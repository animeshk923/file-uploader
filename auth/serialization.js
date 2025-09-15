const pool = require("../db/pool");

async function serializerFunction(user, done) {
  done(null, user.email);
}

async function deserializerFunction(email, done) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM credentials WHERE email = $1",
      [email]
    );
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
}

module.exports = {
  serializerFunction,
  deserializerFunction,
};
