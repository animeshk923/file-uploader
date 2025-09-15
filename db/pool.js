require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");

// PROD DATABASE

module.exports = new Pool({
  connectionString: `postgresql://${process.env.AIVEN_DB_USERNAME}:${process.env.AIVEN_DB_PASSWORD}@${process.env.AIVEN_DB_HOSTNAME}:${process.env.AIVEN_DB_PORT}/${process.env.AIVEN_DB}`,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./ca.pem").toString(),
  },
});

// DEV DATABASE

// module.exports = new Pool({
//   connectionString: `postgresql://${process.env.LOCAL_DB_USERNAME}:${process.env.LOCAL_DB_PASSWORD}@${process.env.LOCAL_DB_HOSTNAME}:${process.env.LOCAL_DB_PORT}/${process.env.LOCAL_DB}`,
// });
