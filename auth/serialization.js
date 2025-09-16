const { PrismaClient } = require("../prisma/generated/prisma");
const prisma = new PrismaClient();

async function serializerFunction(user, done) {
  done(null, user.email);
}

async function deserializerFunction(email, done) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    done(null, user);
  } catch (err) {
    done(err);
  }
}

module.exports = {
  serializerFunction,
  deserializerFunction,
};
