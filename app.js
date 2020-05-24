const express = require("express");
const path = require("path");
const logger = require("morgan");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require('express-session');
const dotenv = require("dotenv");

const User = require("./models/User");
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const connectDB = require("./config/db");

dotenv.config({ path: "./config/config.env" });

connectDB();

const stories = require("./routes/stories");
const auth = require("./routes/auth");

const app = express();
const socket = require('http').Server(app);
const io = require('socket.io')(socket);

socket.listen('8080', async () => {
  console.log('SocketIO Server listening on Port 8080');
  // const users = await User.find({});
  // console.log(users);
})

io.on('connection', async function (socket) {
  console.log('a user connected');
  socket.on('create-story', function (storyPackage) {
    console.log("New story from " + storyPackage.name + " it reads: " + storyPackage.text);
    // Post story to db
  });

  socket.on('like-post', function (likePostPackage) {
    console.log("New like from " + likePostPackage.name + " number of likes: " + likePostPackage.numberOfLikes);
    // Post like to db
  });

});

app.use(logger("dev"));
app.use(express.json());
// TODO: CHANGE `secret` IN PROD
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));

app.use("/api/stories", stories);
app.use("/api/auth", auth);

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use('/uploads', express.static(__dirname + '/uploads'));

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

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   const err = new Error("Not Found");
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));