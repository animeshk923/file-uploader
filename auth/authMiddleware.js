function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.render("partials/errors", { messages: "not authorized to this route" });
  }
}

const club1 = 1234;
const club2 = 4321;
const club3 = 1221;
const club4 = 1212;
module.exports = {
  isAuth,
  club1,
  club2,
  club3,
  club4,
};
