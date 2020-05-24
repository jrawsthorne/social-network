const express = require("express");
const passport = require("passport");
const { login, register, me, logout } = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router
    .route("/register")
    .post(register);

router
    .route("/login")
    .post(passport.authenticate('local'), login);

router
    .route("/me")
    .get(protect, me);

router.route("/logout").post(protect, logout);

module.exports = router;