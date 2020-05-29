const express = require("express");
const path = require("path");
const logger = require("morgan");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require('express-session');
const dotenv = require("dotenv");

// Authentication:
const User = require("./models/User");
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const connectDB = require("./config/db");

// Updated config.env to change db destination
dotenv.config({ path: "./config/config.env" });

connectDB();

const stories = require("./routes/stories");
const auth = require("./routes/auth");

const app = express();



app.use(logger("dev"));
app.use(express.json());

app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));

app.use("/api/stories", stories);
app.use("/api/auth", auth);

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use('/uploads', express.static(__dirname + '/uploads'));


// Define routes
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


// Listen on port 3000 / process port
const PORT = process.env.PORT || 3000;

// Starts server
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));


// Starts Socket.io service
var io = require('socket.io').listen(server);

io.on('connection', async function (socket) {
  socket.on('create-story', function (storyPackage) {
    socket.broadcast.emit('new-story',{from:storyPackage.name});
  });
});
