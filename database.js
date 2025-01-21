import { open } from "sqlite";
import sqlite3 from "sqlite3";

let dbInstance = null;

export async function initDb() {
  dbInstance = await open({
    filename: "db/database.sqlite",
    driver: sqlite3.Database,
  });

  // Init tables
  await dbInstance.exec(`

CREATE TABLE IF NOT EXISTS challenges (
  id              INTEGER     PRIMARY KEY AUTOINCREMENT,
  left_label      TEXT        NOT NULL,
  left_image      TEXT        NOT NULL,
  right_label     TEXT        NOT NULL,
  right_image     TEXT        NOT NULL,
  created_at      DATATIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
  id              INTEGER     PRIMARY KEY AUTOINCREMENT,
  challenge_id    INTEGER     NOT NULL,
  ip_address_hash STRING      NOT NULL,
  choice          STRING      NOT NULL,
  created_at      DATATIME    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE ON UPDATE CASCADE
)
    `);

  // Insert seed data if no challenges exist
  const existingChallenges = await dbInstance.get(
    "SELECT COUNT(*) as count FROM challenges"
  );

  if (existingChallenges.count === 0) {
    await dbInstance.run(`
        INSERT INTO challenges (left_label, right_label, left_image, right_image) 
        VALUES
          ('Pizza', 'Sushi', 'https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg', 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg'),
          ('Tacos', 'Hamburger', 'https://www.themealdb.com/images/media/meals/ypxvwv1505333929.jpg', 'https://www.themealdb.com/images/media/meals/k420tj1585565244.jpg'),
          ('Pasta', 'Ramen', 'https://www.themealdb.com/images/media/meals/wvqpwt1468339226.jpg', 'https://images.unsplash.com/photo-1591325418441-ff678baf78ef?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Steak', 'Falafel', 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1558458601-0d69a278b8e6?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Kebab', 'Couscous', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=3552&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?q=80&w=3571&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Moussaka', 'Raclette', 'https://www.themealdb.com/images/media/meals/ctg8jd1585563097.jpg', 'https://images.unsplash.com/photo-1657828514361-e95409cac913?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('BBQ Ribs', 'Poutine', 'https://images.unsplash.com/photo-1623174479658-79fb603acf60?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1586805608485-add336722759?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Shakshuka', 'Fish and Chips', 'https://images.unsplash.com/photo-1584278859380-c94d92e083dd?q=80&w=3571&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1553557202-e8e60357f061?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Pasta', 'Steak', 'https://www.themealdb.com/images/media/meals/wvqpwt1468339226.jpg', 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Ramen', 'Kebab', 'https://images.unsplash.com/photo-1591325418441-ff678baf78ef?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=3552&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Falafel', 'Moussaka', 'https://images.unsplash.com/photo-1558458601-0d69a278b8e6?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://www.themealdb.com/images/media/meals/ctg8jd1585563097.jpg'),
          ('Couscous', 'BBQ Ribs', 'https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?q=80&w=3571&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1623174479658-79fb603acf60?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Raclette', 'Shakshuka', 'https://images.unsplash.com/photo-1657828514361-e95409cac913?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1584278859380-c94d92e083dd?q=80&w=3571&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Poutine', 'Fish and Chips', 'https://images.unsplash.com/photo-1586805608485-add336722759?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1553557202-e8e60357f061?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Steak', 'Ramen', 'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1591325418441-ff678baf78ef?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Kebab', 'Falafel', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=3552&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1558458601-0d69a278b8e6?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Moussaka', 'Couscous', 'https://www.themealdb.com/images/media/meals/ctg8jd1585563097.jpg', 'https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?q=80&w=3571&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('BBQ Ribs', 'Raclette', 'https://images.unsplash.com/photo-1623174479658-79fb603acf60?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1657828514361-e95409cac913?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Raclette', 'Pizza', 'https://images.unsplash.com/photo-1657828514361-e95409cac913?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg'),
          ('Sushi', 'Tacos', 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg', 'https://www.themealdb.com/images/media/meals/ypxvwv1505333929.jpg'),
          ('Hamburger', 'Fish and Chips', 'https://www.themealdb.com/images/media/meals/k420tj1585565244.jpg', 'https://images.unsplash.com/photo-1553557202-e8e60357f061?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Pasta', 'Poutine', 'https://www.themealdb.com/images/media/meals/wvqpwt1468339226.jpg', 'https://images.unsplash.com/photo-1586805608485-add336722759?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('BBQ Ribs', 'Sushi', 'https://images.unsplash.com/photo-1623174479658-79fb603acf60?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg'),
          ('Shakshuka', 'Couscous', 'https://images.unsplash.com/photo-1584278859380-c94d92e083dd?q=80&w=3571&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?q=80&w=3571&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
          ('Pizza', 'Moussaka', 'https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg', 'https://www.themealdb.com/images/media/meals/ctg8jd1585563097.jpg'),
          ('Hamburger', 'Kebab', 'https://www.themealdb.com/images/media/meals/k420tj1585565244.jpg', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=3552&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')
`);
  }
}

export async function getDb() {
  if (!dbInstance) {
    throw new Error("initDb must be called before getDb");
  }
  return dbInstance;
}
