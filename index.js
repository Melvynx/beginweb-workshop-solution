import bodyParser from "body-parser";
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

app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "views/index.html");
  res.sendFile(indexPath);
});

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

app.get("/api/challenges/random", async (req, res) => {
  const db = await getDb();
  const challengesCount = await db.get(
    "SELECT COUNT(*) as count FROM challenges"
  );
  const index = getRandomArbitrary(0, challengesCount.count);

  const challenge = await db.get(
    "SELECT * FROM challenges ORDER BY created_at LIMIT 1 OFFSET ?",
    [index]
  );

  res.json(challenge);
});

app.post("/api/challenges/:challengeId/votes", async (req, res) => {
  const body = req.body;
  const choice = body.choice;
  const { challengeId } = req.params;

  if (choice !== "right" && choice !== "left") {
    res.statusCode = 400;
    res.json({ error: "Invalid body.vote : must be right or left" });
    return;
  }

  const db = await getDb();
  db.run(
    `INSERT INTO votes (challenge_id, ip_address_hash, choice) VALUES (?, ?, ?)`,
    [
      challengeId,
      Math.random().toString(), // TODO : Update this
      choice,
    ]
  );

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
