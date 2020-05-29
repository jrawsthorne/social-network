const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }]
});

// Handles user password security
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);