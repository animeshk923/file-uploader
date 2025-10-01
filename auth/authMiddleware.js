function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.render("login", { messages: "NOT AUTHORIZED ON THIS ROUTE" });
  }
}

function isNotLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect("home");
  }
}

module.exports = {
  isAuth,
  isNotLoggedIn,
};
