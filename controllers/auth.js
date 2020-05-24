const User = require("../models/User");
const passport = require("passport");

// @route POST /api/auth/register
async function register(req, res) {
    const { username, password } = req.body;
    try {
        const user = await User.register(new User({ username }), password);
        return passport.authenticate('local')(req, res, () => res.status(201).json({ _id: user._id, username }));
    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: err });
    }

}

// @route POST /api/auth/login
// actual authentication is handled by passport
async function login(req, res) {
    return res.status(200).send();
}

// @route POST /api/auth/logout
async function logout(req, res) {
    req.logout();
    return res.status(200).send();
}

// @route GET /api/auth/me
async function me(req, res) {
    const { _id, username } = req.user;
    return res.status(200).json({ _id, username });
}

exports.register = register;
exports.login = login;
exports.me = me;
exports.logout = logout;