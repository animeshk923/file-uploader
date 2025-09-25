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
  console.log("fileId:", file_id);

  try {
    // delete link from database
    await prisma.file.delete({ where: { fileId: Number(file_id) } });
    // delete from cloudinary (implementation remaining)
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
  // res.status(200).json({ msg: "File deleted!" });
  res.redirect(`/folder/${folder_id}`);
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
  res.json({ msg: "you reached here!" });
}

async function uploadFileToCloudinary(req, res, next) {
  const byteArrayBuffer = req.file.buffer;
  console.log(req.file.originalname);
  console.log("req.fileIinCloudinary: ", req.newFileId);
  // const options = { use_filename: true };

  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ use_filename: true }, (error, uploadResult) => {
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
    })
    .catch((err) => {
      console.error(err);
      res.status(404).json({ error: err });
    });
  res.redirect("/home");
}

async function uploadFilePost(req, res, next) {
  console.log("reqBodyInUploadPost", req.body);

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

async function fileDetailsGet(req, res) {
  res.render("fileDetails");
}

async function addUrlToDB(secureUrl, file_id) {
  await prisma.file.update({
    data: { fileURL: secureUrl },
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
  asset_id: "1534594ed4764efb6c4f4bd91674b466",
  public_id: "file_od859q",
  version: 1758814938,
  version_id: "7a6db646c8cdc437e6bd0a89073fccf1",
  signature: "f131122cb74b5a682ed600d489420b2401ee67d7",
  width: 832,
  height: 1248,
  format: "jpg",
  resource_type: "image",
  created_at: "2025-09-25T15:42:18Z",
  tags: [],
  bytes: 618454,
  type: "upload",
  etag: "377f3299e15c8320f39b745c6e4f4d03",
  placeholder: false,
  url: "http://res.cloudinary.com/dwdp7afus/image/upload/v1758814938/file_od859q.jpg",
  secure_url:
    "https://res.cloudinary.com/dwdp7afus/image/upload/v1758814938/file_od859q.jpg",
  asset_folder: "",
  display_name: "file_od859q",
  original_filename: "file",
  api_key: "514278498221124",
};
