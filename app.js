const path = require("node:path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { localStrategyConfig } = require("./auth/strategy");
const appRoute = require("./routes");
const {
  deserializerFunction,
  serializerFunction,
} = require("./auth/serialization");
const pgSession = require("connect-pg-simple")(session);
const pgPool = require("./db/pool");

require("dotenv").config();

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

const sessionStore = new pgSession({
  pool: pgPool,
  createTableIfMissing: true,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  })
);

app.use(passport.session());

passport.use(localStrategyConfig);

passport.serializeUser(serializerFunction);

passport.deserializeUser(deserializerFunction);

app.use("/", appRoute);

app.listen(3000, () => console.log("app listening on port 3000!"));
