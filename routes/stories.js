const express = require("express");
const router = express.Router();
const passport = require("passport");
const Story = require("../models/Story");

/* create story */
router.post("/", async function (req, res, next) {

    if (!req.user) {
        return res.status(400).json({ error: "Not signed in" });
    }

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: "No text" });
    }

    const story = new Story({ text, author: req.user._id });

    const saved = await story.save();

    res.status(201).json(saved);
});

router.get("/", async function (req, res) {
    const stories = await Story.find().sort({ createdAt: "desc" }).populate("author").exec();
    res.status(200).json(stories);
})

module.exports = router;