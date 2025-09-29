require("dotenv").config();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../prisma/generated/prisma");
const prisma = new PrismaClient();
const fs = require("node:fs");
// import { v2 as cloudinary } from "cloudinary";
const cloudinary = require("cloudinary").v2;
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
  res.render("home");
}

/**
 * Makes all folders of current logged in user available globally in the app
 */
async function allFolderOfUser(req, res, next) {
  const userId = req.user.id;
  // console.log(userId);
  const folders = await prisma.folder.findMany({ where: { userId: userId } });
  console.log("folders:", folders);
  res.locals.userFolders = folders;
  next();
}

async function logOutGet(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

async function deleteFileGet(req, res) {
  const file_id = req.params.fileId;
  const folder_id = req.params.folderId;
  const file_name = req.params.fileName;
  // console.log("fileId:", file_id);
  // console.log("file_name:", file_name);

  try {
    // delete link from database
    const file = await prisma.file.findUnique({
      where: { fileName: file_name },
    });
    const public_id = file.fileName;
    // console.log("public_id:", file.fileName);

    await prisma.file.delete({ where: { fileId: Number(file_id) } });

    // delete from cloudinary
    cloudinary.uploader
      .destroy(public_id)
      .then((result) => {
        if (result == "ok") {
          console.log(result);
          res.redirect(`/folder/${folder_id}`);
        } else {
          res.status(500).json({ error: result });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
  // res.status(200).json({ msg: "File deleted!" });
}

async function createFolderGet(req, res) {
  // console.log(req.user);

  res.render("newFolder");
}

async function createFolderPost(req, res) {
  const { folderName } = req.body;
  const userId = req.user.id;

  try {
    await prisma.folder.create({
      data: {
        userId: userId,
        folderName: folderName,
      },
    });
    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.json({ message: err });
  }
}

// render files inside the folder
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

    res.render("partials/userFiles", { files: files });
  } catch (err) {
    console.log(err);
    res.json({ msg: err });
  }
}

async function updateUserFolderGet(req, res) {
  console.log("folderId:", req.params.folderId);
  const folder_id = req.params.folderId;

  res.render("updateFolder", { folderId: folder_id });
}

// update folder info
async function updateUserFolderPost(req, res, next) {
  const folder_name = req.body.folderName;
  const folder_id = req.params.folderId;

  try {
    await prisma.folder.update({
      data: { folderName: folder_name },
      where: { folderId: Number(folder_id) },
    });
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
  res.redirect("/home");
}

// delete folder (check implementation) (delete link implementation in ejs remaining)
async function deleteUserFolderGet(req, res) {
  const folder_id = req.params.folderId;

  try {
    // delete from cloudinary (implementation remaining)

    // delete all files link from folder
    await prisma.file.deleteMany({ where: { folderId: Number(folder_id) } });
    // delete folder link from database
    await prisma.folder.delete({ where: { folderId: Number(folder_id) } });
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
  res.status(200).redirect("/home");
}

async function userFilesGet(req, res) {
  const file_id = req.params.fileId;
  const fileInfo = await prisma.file.findUnique({
    where: { fileId: Number(file_id) },
  });
  // console.log("fileUrl", fileInfo.fileURL);

  res.redirect(`${fileInfo.fileURL}`);
}

async function uploadFilePost(req, res, next) {
  // console.log("reqBodyInUploadPost", req.body);

  // add case if no folder selected then what
  const { folder_id } = req.body;
  const fileName = req.file.originalname;

  // create file link in database
  try {
    const createdFile = await prisma.file.create({
      data: {
        fileName: fileName,
        folderId: Number(folder_id),
      },
    });

    const fileId = createdFile.fileId;
    req.newFileId = fileId;

    next();
  } catch (err) {
    console.error(err);
    res.json({ message: err });
  }
}

async function uploadFileToCloudinary(req, res) {
  const byteArrayBuffer = req.file.buffer;
  // console.log("originalName in cloudinary:", req.file);
  // console.log("req.fileIinCloudinary: ", req.newFileId);
  const options = { public_id: req.file.originalname };

  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, uploadResult) => {
        if (error) {
          return reject(error);
        }
        return resolve(uploadResult);
      })
      .end(byteArrayBuffer);
  })
    .then((uploadResult) => {
      console.log(
        `Buffer upload_stream wth promise success - ${uploadResult.public_id}`
      );
      console.log("upload result", uploadResult);

      // add secure media url to database
      addUrlToDB(uploadResult.secure_url, req.newFileId);

      // add metadata to database
      addMetaToDB(uploadResult.bytes, uploadResult.created_at, req.newFileId);
    })
    .catch((err) => {
      console.error(err);
      res.status(404).json({ error: err });
    });
  res.redirect("/home");
}

async function fileDetailsGet(req, res) {
  const file_id = req.params.fileId;
  console.log("file_idindetails:", file_id);

  // await prisma.file.findUnique({ where: { fileId: file_id } });
  res.render("fileDetails");
}

async function addUrlToDB(secureUrl, file_id) {
  await prisma.file.update({
    data: { fileURL: secureUrl },
    where: { fileId: file_id },
  });
}

async function addMetaToDB(fileSize, fileCreateTime, file_id) {
  console.log("filesize: ", fileSize);
  console.log("typeof filesize: ", typeof fileSize);
  const MB = Number(fileSize) / 1000000;

  console.log("MB:", MB);

  await prisma.file.update({
    data: { fileSize: MB, fileTime: fileCreateTime },
    where: { fileId: file_id },
  });
}
module.exports = {
  signUpGet,
  signUpPost,
  logInGet,
  logOutGet,
  validateUser,
  homepageGet,
  allFolderOfUser,
  redirectSignUp,
  uploadFilePost,
  createFolderGet,
  createFolderPost,
  userFolderGet,
  userFilesGet,
  uploadFileToCloudinary,
  deleteFileGet,
  fileDetailsGet,
  updateUserFolderGet,
  updateUserFolderPost,
  deleteUserFolderGet,
  handleOtherRoutes,
};

async function handleOtherRoutes(req, res) {
  res.json({ message: "404 NOT FOUND!" });
}

uploadResultFormat = {
  asset_id: "c9b0b0fdc7a43edb5cc6140012372463",
  public_id: "em-exp-5.png",
  version: 1759155265,
  version_id: "55c712694ff51ce121d48fa8e6c5f039",
  signature: "a8d24802b17126928917fa3022c93bdf7078b36a",
  width: 1675,
  height: 1596,
  format: "png",
  resource_type: "image",
  created_at: "2025-09-29T14:14:25Z",
  tags: [],
  bytes: 114303,
  type: "upload",
  etag: "db98b233edda2e3b52ff159b34774f62",
  placeholder: false,
  url: "http://res.cloudinary.com/dwdp7afus/image/upload/v1759155265/em-exp-5.png.png",
  secure_url:
    "https://res.cloudinary.com/dwdp7afus/image/upload/v1759155265/em-exp-5.png.png",
  asset_folder: "",
  display_name: "em-exp-5.png",
  original_filename: "file",
  api_key: "514278498221124",
};
