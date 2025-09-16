function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.render("partials/errors", { messages: "not authorized to this route" });
  }
}

function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect("home");
  }
}

module.exports = {
  isAuth,
  isLoggedIn,
};
