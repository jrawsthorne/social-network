const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Story = new Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    likes: [{
        rating: {
            required: true,
            type: Number,
            min: 0,
            max: 5
        },
        user: { type: Schema.Types.ObjectId, ref: "User" }
    }],
    images: [{
        type: String,
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("Story", Story);
