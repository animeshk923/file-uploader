require("dotenv").config();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../prisma/generated/prisma");
const prisma = new PrismaClient();
const fs = require("node:fs");

// Sign up validation
const alphaErr = "must only contain letters.";
const emailErr = "must be a valid email";
const passErr = "Password length should be at least 6 characters";
const confirmPassErr = "Passwords don't match. please re-enter";
const validateUser = [
  body("fullName").trim().isAlpha().withMessage(`First name ${alphaErr}`),
  body("email").trim().isEmail().withMessage(`${emailErr}`),
  body("password").trim().isLength({ min: 6 }).withMessage(passErr),
  body("confirmPassword")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage(confirmPassErr),
];

async function signUpGet(req, res) {
  res.render("signup");
}

async function redirectSignUp(req, res) {
  res.redirect("signup");
}

async function signUpPost(req, res, next) {
  // validation check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("signup", {
      errors: errors.array(),
    });
  }

  const { fullName, email, password } = req.body;

  try {
    // handle case where user is already registered so redirect them to login page
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: email,
        fullName: fullName,
        password: hashedPassword,
      },
    });

    res.redirect("/login");
  } catch (error) {
    console.error(error);
    next(error);
  }
}

async function logInGet(req, res) {
  const errorMessage = req.session.messages;
  res.render("login", { messages: errorMessage });
}

async function homepageGet(req, res) {
  const userId = req.user.id;
  // console.log("req.baseUrl", req.baseUrl);
  // console.log(userId);
  const folders = await prisma.folder.findMany({ where: { userId: userId } });
  console.log("folders:", folders);

  res.render("home", { userFolders: folders });
}

async function logOutGet(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

async function uploadFilePost(req, res) {
  // console.log(req.file);
  const { fileName, folder_id } = req.body;
  try {
    await prisma.file.create({
      data: {
        fileName: fileName,
        folderId: Number(folder_id),
      },
    });
    res.json({ message: "Successfully uploaded files" });
  } catch (err) {
    console.error(err);
    res.json({ message: err });
  }
}

async function createFolderGet(req, res) {
  // console.log(req.user);

  res.render("newFolder");
}

async function createFolderPost(req, res) {
  // console.log("req body:", req.body);
  const { folderName } = req.body;

  // console.log("typeof:", typeof folderName);
  const userId = req.user.id;

  try {
    await prisma.folder.create({
      data: {
        userId: userId,
        folderName: folderName,
      },
    });
    res.json({ result: "FOLDER CREATED!" });
  } catch (err) {
    console.error(err);
    res.json({ message: err });
  }
  // const folderPath = `./public/userFolders/${userId}/${folderName}`;
  // try {
  //   if (!fs.existsSync(folderPath)) {
  //     fs.mkdirSync(folderPath, { recursive: true });
  //     res.redirect("home");
  //     // res.json({ message: "Folder created successfully!" });
  //   }
  // } catch (err) {
  //   console.error(err);
  //   res.json({ message: err });
  // }
}

async function userFolderGet(req, res) {
  // console.log(req.user);
  const { folderId } = req.params;
  try {
    const files = await prisma.file.findMany({
      where: {
        folderId: Number(folderId),
      },
    });
    console.log("files info:", files);
    // console.log("req.baseUrl", req.baseUrl);

    res.render("partials/userFiles", { files: files });
  } catch (err) {
    console.log(err);
    res.json({ msg: err });
  }
}

async function userFilesGet(req, res) {
  // console.log(req.user);
  // const { folderId } = req.params;
  // const files = await prisma.file.findMany({
  //   where: {
  //     folderId: folderId,
  //   },
  // });
  // res.render("userFiles", { files: files });
  res.json({ msg: "you reached here!" });
}

async function handleOtherRoutes(req, res) {
  res.json({ message: "404 NOT FOUND!" });
}
module.exports = {
  signUpGet,
  signUpPost,
  logInGet,
  logOutGet,
  validateUser,
  homepageGet,
  redirectSignUp,
  uploadFilePost,
  createFolderGet,
  createFolderPost,
  userFolderGet,
  userFilesGet,
  handleOtherRoutes,
};
