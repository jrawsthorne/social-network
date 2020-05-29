const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }]
});

// Helper that creates the register functionality 
// including password hashing and salting
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);