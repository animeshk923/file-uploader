const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../prisma/generated/prisma");
const prisma = new PrismaClient();

const customFields = { usernameField: "email" };
const verifyCallback = async (email, password, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return done(null, false, { message: "User doesn't exists." });
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
