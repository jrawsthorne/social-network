const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require('express-session')

const User = require("./models/user");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const index = require("./routes/index");
const users = require("./routes/users");
const stories = require("./routes/stories");

const app = express();

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// TODO: CHANGE `secret` IN PROD
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "public")));

app.use("/stories", stories);

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/index.html`));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/login.html`));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/register.html`));
});
app.get('/me', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/me.html`));
});
app.get('/*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/404.html`));
});

// app.use("/", index);
// app.use("/users", users);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
