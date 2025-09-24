const { Router } = require("express");
const appRoute = Router();
const controller = require("../controllers/index");
const passport = require("passport");
const { isAuth, isNotLoggedIn } = require("../auth/authMiddleware");
const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: "./public/files",
//   filename: function (req, file, cb) {
//     filePath = "./public/files/" + file.originalname;
//     cb(null, file.originalname);
//   },
// });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

appRoute.get("/", isNotLoggedIn, controller.redirectSignUp);
appRoute.get("/signup", isNotLoggedIn, controller.signUpGet);
appRoute.post("/signup", controller.validateUser, controller.signUpPost);
appRoute.get("/login", isNotLoggedIn, controller.logInGet);
appRoute.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureMessage: true,
  })
);
appRoute.get("/home", isAuth, controller.homepageGet);
appRoute.get("/logout", isAuth, controller.logOutGet);
appRoute.post(
  "/upload",
  upload.single("upload_file"),
  controller.uploadFileToCloudinary,
  controller.uploadFilePost
);
// appRoute.post("/upload", upload.none(), controller.uploadFilePost);
appRoute.get("/newFolder", isAuth, controller.createFolderGet);
appRoute.post("/newFolder", isAuth, controller.createFolderPost);
appRoute.get("/folder/:folderId", isAuth, controller.userFolderGet);
appRoute.get(
  "/folder/:folderId/update",
  isAuth,
  controller.updateUserFolderGet
);
appRoute.post(
  "/folder/:folderId/update",
  isAuth,
  controller.updateUserFolderPost
);
appRoute.get(
  "/folder/:folderId/delete",
  isAuth,
  controller.deleteUserFolderGet
);
appRoute.get(
  "/folder/:folderId/file/:fileName",
  isAuth,
  controller.userFilesGet
);
appRoute.get(
  "/folder/:folderId/file/:fileName/details",
  isAuth,
  controller.fileDetailsGet
);
appRoute.get(
  "/folder/:folderId/file/:fileName/:fileId/delete",
  isAuth,
  controller.deleteFileGet
);

appRoute.get("/{*splat}", controller.handleOtherRoutes);
module.exports = appRoute;
