const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Run inside `async` function
const allUsers = await prisma.user.findMany();
