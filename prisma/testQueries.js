const { PrismaClient } = require("./generated/prisma");

const prisma = new PrismaClient();

async function addUser(name, email, password) {
  await prisma.user.create({
    data: {
      email: email,
      fullName: name,
      password: password,
    },
  });
}

addUser("annie k", "a@a.com", "123456");
// require("dotenv").config();
// const fs = require("fs");
// const pool = require("./pool");
// const db = require("./queries");
// const config = {
//   user: process.env.AIVEN_DB_USERNAME,
//   password: process.env.AIVEN_DB_PASSWORD,
//   host: process.env.AIVEN_DB_HOSTNAME,
//   port: process.env.AIVEN_DB_PORT,
//   database: process.env.AIVEN_DB,
//   ssl: {
//     rejectUnauthorized: true,
//     ca: fs.readFileSync("./ca.pem").toString(),
//   },
// };

// const config = {
//   user: process.env.LOCAL_DB_USERNAME,
//   password: process.env.LOCAL_DB_PASSWORD,
//   host: process.env.LOCAL_DB_HOSTNAME,
//   port: process.env.LOCAL_DB_PORT,
//   database: process.env.LOCAL_DB,
// };

// async function test(email, id) {
// await client.connect();

// const result = await client.query("SELECT * from messages;");
// console.log(result);
// const isClubMember = await db.userIsClubMember(email);
// console.log(isClubMember);
// const isAdmin = await db.userIsAdmin(id);
// console.log('out', isAdmin);
// const queryResult = await db.getUser(email);
// const user = queryResult[0];
// console.log(user);
// return rows;
// console.log(rows);
// console.log(rows[0].members);
// console.log(rows[0].text);
// }

// async function getUsernameById(id) {
//   await client.connect();
//   const { rows } = await client.query(
//     "SELECT * FROM messages WHERE id = ($1);",
//     [id]
//   );
//   console.log(rows);
//   await client.end();
// }
// test("a@a.co");
// test("a@a.commm");
// test("a@a.co", 2);
// let msgId = 6;
// getUsernameById(msgId);

// client.connect(function (err) {
//   if (err) throw err;
//   client.query("SELECT VERSION()", [], function (err, result) {
//     // if (err) throw err;

//     console.log(result[0]);
//     client.end(function (err) {
//       if (err) throw err;
//     });
//   });
// });
