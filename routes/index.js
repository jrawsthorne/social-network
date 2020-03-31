const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../models/user");

const initDB = require("../controllers/init");
initDB.init();

router.get("/", function (req, res, next) {
  if (!req.user) {
    return res.redirect("/login");
  }
  const user = { username: req.user.username };
  res.render("index", { user });
});

router.get('/register', function (req, res) {
  res.render('register');
});

router.post('/register', async (req, res, next) => {
  try {
    await User.register(new User({ username: req.body.username }), req.body.password);
    passport.authenticate('local')(req, res, () => res.redirect("/"));
  } catch (err) {
    console.log(err)
    return res.render('register');
  }
});

router.get("/login", (req, res, next) => {
  res.render("login", { user: req.user });
});

router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
