import bodyParser from "body-parser";
import crypto from "crypto";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getDb, initDb } from "./database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
initDb();

function hash(str) {
  return crypto
    .createHash("md5")
    .update("4B39BA05-BE1C-4BF3-83CA-20435B48208F" + str)
    .digest("hex");
}

function getRemoteAddress(req) {
  return hash(req.headers["x-forwarded-for"] || req.socket.remoteAddress);
}

app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "views/index.html");
  res.sendFile(indexPath);
});

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

app.get("/api/challenges/random", async (req, res) => {
  const db = await getDb();
  const remoteAddress = getRemoteAddress(req);
  let challenge = await db.get(
    `SELECT challenges.* FROM challenges
WHERE NOT EXISTS
(
  SELECT 1 FROM votes
  WHERE votes.challenge_id = challenges.id
  AND votes.ip_address_hash = ?
)
ORDER BY RANDOM()
LIMIT 1;`,
    [remoteAddress]
  );

  if (!challenge) {
    challenge = await db.get(
      `SELECT challenges.* FROM challenges
ORDER BY RANDOM()
LIMIT 1;`
    );
  }

  res.json(challenge);
});

app.post("/api/challenges/:challengeId/votes", async (req, res) => {
  const body = req.body;
  const choice = body.choice;
  const remoteAddress = getRemoteAddress(req);
  const { challengeId } = req.params;

  if (choice !== "right" && choice !== "left") {
    res.statusCode = 400;
    res.json({ error: "Invalid body.vote : must be right or left" });
    return;
  }

  const db = await getDb();

  const previousVote = await db.get(
    "SELECT 1 FROM votes WHERE challenge_id = ? AND ip_address_hash = ?",
    [challengeId, remoteAddress]
  );

  console.log({ challengeId, previousVote });

  if (!previousVote) {
    db.run(
      `INSERT INTO votes (challenge_id, ip_address_hash, choice) VALUES (?, ?, ?)`,
      [challengeId, remoteAddress, choice]
    );
  }

  const result = await db.get(
    `SELECT 
    COUNT(*) AS total_votes,
    SUM(CASE WHEN choice = 'left' THEN 1 ELSE 0 END) AS left_votes,
    SUM(CASE WHEN choice = 'right' THEN 1 ELSE 0 END) AS right_votes
FROM votes
WHERE challenge_id = ?;`,
    [challengeId]
  );

  res.json({
    total: result.total_votes,
    left_votes: result.left_votes,
    right_votes: result.right_votes,
  });
});

app.listen(PORT, () => {
  console.info(`App is running at http://localhost:${PORT}`);
});
