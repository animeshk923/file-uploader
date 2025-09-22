const { Router } = require("express");
const appRoute = Router();
const controller = require("../controllers/index");
const passport = require("passport");
const { isAuth, isNotLoggedIn } = require("../auth/authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "./public/files",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

appRoute.post("/upload", upload.single("upload_file"), controller.uploadFile); // TODO: change filename to retain the original one. Remove this line after the task is achieved.

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

module.exports = appRoute;
