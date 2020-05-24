const mongoose = require("mongoose");

const Story = new mongoose.Schema(
    {
        text: {
            type: String,
            trim: true,
            required: [true, "Text is required"]
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
        images: [{
            type: String,
        }]
    },
    { timestamps: true }
)

module.exports = mongoose.model("Story", Story);