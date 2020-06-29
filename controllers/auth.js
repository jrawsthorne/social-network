const User = require("../models/User");
const passport = require("passport");

/**
 * Registers user with given username and password and logs them in using passport
 * @route POST /api/auth/register
 * @param {string} username 
 * @param {password} password 
 * @returns {string} _id
 * @returns {string} username
 */
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

/**
 * Log the user in. Authentication is provided by passport
 * @route POST /api/auth/login
 */
async function login(req, res) {
    return res.status(200).send();
}

/**
 * Log the user out
 * @route POST /api/auth/logout
 */
async function logout(req, res) {
    req.logout();
    return res.status(200).send();
}

/**
 * Returns information about the authenticated user
 * @route GET /api/auth/me
 * @returns {string} _id
 * @returns {string} username
 */
async function me(req, res) {
    const { _id, username } = req.user;
    return res.status(200).json({ _id, username });
}

exports.register = register;
exports.login = login;
exports.me = me;
exports.logout = logout;