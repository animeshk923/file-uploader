const { Router } = require("express");
const controller = require("../controllers/index");
const appRoute = Router();
const passport = require("passport");
const { isAuth } = require("../auth/authMiddleware");

appRoute.get("/", controller.rootGet);
appRoute.get("/signup", controller.signUpGet);
appRoute.post("/signup", controller.validateUser, controller.signUpPost);
appRoute.get("/login", controller.logInGet);
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
appRoute.get("/clubJoinGet", isAuth, controller.clubJoinGet);
appRoute.post("/clubJoinPost", isAuth, controller.clubJoinPost);
appRoute.get("/messageFormGet", isAuth, controller.messageFormGet);
appRoute.post("/messageFormPost", isAuth, controller.messageFormPost);
appRoute.post("/deleteMessagePost", isAuth, controller.messageDeletePost);
module.exports = appRoute;
