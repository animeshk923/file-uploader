require("dotenv").config();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../prisma/generated/prisma");
const prisma = new PrismaClient();
const fs = require("node:fs");
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
  const folders = await prisma.folder.findMany({ where: { userId: userId } });
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

  try {
    // delete link from database
    const file = await prisma.file.findUnique({
      where: { fileName: file_name },
    });
    const public_id = file.fileName;

    await prisma.file.delete({ where: { fileId: Number(file_id) } });

    // delete from cloudinary
    cloudinary.uploader
      .destroy(public_id)
      .then((response) => {
        if (response.result == "ok") {
          console.log(response);
          res.redirect(`/folder/${folder_id}`);
        } else {
          res.status(500).json({ error: response });
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
}

async function createFolderGet(req, res) {
  res.render("newFolder");
}

async function createFolderPost(req, res) {
  const { folderName } = req.body;
  const userId = req.user.id;

  try {
    if (folderName == "") {
      res
        .status(500)
        .render("home", { messages: `folder name can't be empty` });
    } else {
      await prisma.folder.create({
        data: {
          userId: userId,
          folderName: folderName,
        },
      });
      res.redirect("/home");
    }
  } catch (err) {
    console.error(err);
    res.json({ message: err });
  }
}

// render files inside the folder
async function userFolderGet(req, res) {
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

// delete folder
async function deleteUserFolderGet(req, res) {
  const folder_id = req.params.folderId;

  try {
    // FLOW: cloudinary first --> then the DB file records --> then the folder record
    /**
     * Array of string to store public ids of assets.
     * @type {string[]}
     * @description Max item = 100.
     * {@link https://cloudinary.com/documentation/admin_api#delete_resources_required_parameters-1 | Cloudinary Doc}
     */
    const public_ids = [];
    const filesInFolder = await prisma.file.findMany({
      take: 100,
      where: { folderId: Number(folder_id) },
    });

    filesInFolder.forEach((item) => {
      public_ids.push(item.fileName);
    });
    console.log("assets", public_ids);

    // delete from cloudinary (WARNING: uses api credits/limits)
    cloudinary.api
      .delete_resources(public_ids)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });

    // delete all files link from folder
    await prisma.file.deleteMany({ where: { folderId: Number(folder_id) } });
    // delete folder link from database
    await prisma.folder.delete({ where: { folderId: Number(folder_id) } });
    res.status(200).redirect("/home");
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
}

async function userFilesGet(req, res) {
  const file_id = req.params.fileId;
  const fileInfo = await prisma.file.findUnique({
    where: { fileId: Number(file_id) },
  });

  res.redirect(`${fileInfo.fileURL}`);
}

async function uploadFilePost(req, res, next) {
  const { folder_id } = req.body;
  const fileName = req.file.originalname;

  try {
    // case if no folder selected
    if (folder_id == "") {
      res.status(500).render("home", {
        messages: `you must select a FOLDER to upload.`,
      });
    } else {
      // create file link in database
      const createdFile = await prisma.file.create({
        data: {
          fileName: fileName,
          folderId: Number(folder_id),
        },
      });

      const fileId = createdFile.fileId;
      req.newFileId = fileId;

      next();
    }
  } catch (err) {
    console.error(err);
    res.json({ message: err });
  }
}

async function uploadFileToCloudinary(req, res) {
  const byteArrayBuffer = req.file.buffer;
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

  const files = await prisma.file.findUnique({
    where: { fileId: Number(file_id) },
  });
  console.log("files:", files);

  res.render("fileDetails", { fileDetails: files });
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
