const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

const customFields = { usernameField: "email" };
const verifyCallback = async (email, password, done) => {
  try {
    const queryResult = await db.getUserCredentials(email);
    const user = queryResult[0];

    if (!user) {
      return done(null, false, { message: "Incorrect email" });
    }

    const storedPass = user.password;

    const match = await bcrypt.compare(password, storedPass);

    if (!match) {
      // passwords do not match!
      return done(null, false, { message: "Incorrect password" });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

const localStrategyConfig = new LocalStrategy(customFields, verifyCallback);

module.exports = { localStrategyConfig };
