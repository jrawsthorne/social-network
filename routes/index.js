const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../models/user");
const Story = require("../models/Story");

const initDB = require("../controllers/init");
initDB.init();

const fs = require('fs');
const Ranking= require('../CollectiveIntelligence/Ranking');
const users = require('../public/Data/users');




// router.get('/register', function (req, res) {
//   res.render('register');
// });

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    await User.register(new User({ username }), password);
    passport.authenticate('local')(req, res, () => res.status(201).json({ username }));
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// router.get("/login", (req, res, next) => {
//   res.render("login", { user: req.user });
// });

router.post('/login', passport.authenticate('local'), (req, res) => {
  const username = req.user.username;
  res.status(200).json({ username })
});


router.post('/logout', function (req, res) {
  req.logout();
  res.status(200).json(null);
});
router.get("/", async function (req, res, next) {

  // set name to the current user
  let name = "user_0";
  let ranking= new Ranking();

  // results = ordered stories by similarity score
  // users need to be in the format shown in public/Data/users.js
  let results= ranking.getRecommendations(users, name, 'sim_pearson');

  if (!req.user) {
    return res.redirect("/login");
  }
  const user = { username: req.user.username };
  const stories = await Story.find().sort({ createdAt: "desc" }).populate("author").exec();
  res.render("index", { user, stories });
});
module.exports = router;
