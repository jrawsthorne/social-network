const express = require("express");
const router = express.Router();
const passport = require("passport");
const Story = require("../models/Story");

var multer  = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniquePrefix = Math.round(Math.random() * 1E10)
        cb(null, uniquePrefix + "-" + file.originalname);
    }
});
var upload = multer({ storage: storage })

router.get("/", async function (req, res) {
    const stories = await Story.find().sort({ createdAt: "desc" }).populate("author").exec();
    res.status(200).json(stories);
})

/* create story with limit of 3 photos */
router.post("/create-story", upload.array("photos", 3), async (req, res, next) => {
    
    console.log("Checking Login for: " + req.user)

    if (!req.user) {
        return res.status(400).json({ error: "Not signed in" });
    }

    const { text } = req.body;

    console.log("Checking Text Contents: " + text)

    if (!text) {
        return res.status(400).json({ error: "No text" });
    } else if (text.length > 150) {
        return res.status(400).json({ error: "Text is too long"})
    }
    
    var files_path = req.files.map(file => file.path)

    const story = new Story({text: text, author: req.user._id, images: files_path,  });

    const saved = await story.save();

    return res.status(201).json(saved);
});

router.get("/photos/:filename", async (req, res, next) => {


});

module.exports = router;