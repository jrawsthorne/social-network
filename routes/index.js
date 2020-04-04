const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../models/user");
const Story = require("../models/Story");

const initDB = require("../controllers/init");
initDB.init();

// router.get("/", async function (req, res, next) {
//   if (!req.user) {
//     return res.redirect("/login");
//   }
//   const user = { username: req.user.username };
//   const stories = await Story.find().sort({ createdAt: "desc" }).populate("author").exec();
//   res.render("index", { user, stories });
// });

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

module.exports = router;
