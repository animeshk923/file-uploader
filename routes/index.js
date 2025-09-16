const { Router } = require("express");
const controller = require("../controllers/index");
const appRoute = Router();
const passport = require("passport");
const { isAuth, isLoggedIn } = require("../auth/authMiddleware");

appRoute.get("/", isLoggedIn, controller.homepageGet);
appRoute.get("/signup", isLoggedIn, controller.signUpGet);
appRoute.post("/signup", controller.validateUser, controller.signUpPost);
appRoute.get("/login", isLoggedIn, controller.logInGet);
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
