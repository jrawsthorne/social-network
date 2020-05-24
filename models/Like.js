const mongoose = require("mongoose");

const Like = new mongoose.Schema(
    {
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            max: 5,
            min: 0
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        story: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Story",
            required: true
        }
    },
    { timestamps: true }
)

Like.index({
    user: 1, story: 1
}, { unique: true });
module.exports = mongoose.model("Like", Like);