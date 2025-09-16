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

async function addFolder(folderName) {
  
}