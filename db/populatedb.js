require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");

// drop table credentials, messages, users, clubs, session, club_members;

const SQL = `
-- Users table

CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name TEXT,
  last_name TEXT,
  isAdmin BOOLEAN
);

-- Credentials table

CREATE TABLE IF NOT EXISTS credentials (
  user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT,
  password TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Messages table

CREATE TABLE IF NOT EXISTS messages (
  msg_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER,
  title TEXT,
  message TEXT,
  date DATE,
  author TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Club table

CREATE TABLE IF NOT EXISTS clubs (
    club_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    club_name TEXT NOT NULL
);

-- Junction table

CREATE TABLE IF NOT EXISTS club_members (
    club_id INTEGER PRIMARY KEY,
    members TEXT NOT NULL,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE
);

-- Insert dummy data into clubs

INSERT INTO clubs (club_name) VALUES
('Book Lovers Association'),
('Science and Technology Club'),
('Music Ensemble'),
('Coding Club');
`;

async function main() {
  console.log("seeding...");

  const client = new Client({
    // connectionString: process.argv[2], // pass your connection URI as a argument when running this script

    // PROD DB String
    connectionString: `postgresql://${process.env.AIVEN_DB_USERNAME}:${process.env.AIVEN_DB_PASSWORD}@${process.env.AIVEN_DB_HOSTNAME}:${process.env.AIVEN_DB_PORT}/${process.env.AIVEN_DB}`,

    // LOCAL DB String
    // connectionString: `postgresql://${process.env.LOCAL_DB_USERNAME}:${process.env.LOCAL_DB_PASSWORD}@${process.env.LOCAL_DB_HOSTNAME}:${process.env.LOCAL_DB_PORT}/${process.env.LOCAL_DB}`,

    // alternate method to connect
    // user: process.env.AIVEN_DB_USERNAME,
    // password: process.env.AIVEN_DB_PASSWORD,
    // host: process.env.AIVEN_DB_HOSTNAME,
    // port: process.env.AIVEN_DB_PORT,
    // database: process.env.AIVEN_DB,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync("./ca.pem").toString(),
    },
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();
