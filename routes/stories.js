const express = require("express");
const router = express.Router();
const { addStory, like, getLatestStories, getRecommendedStories, getUserStories, upload } = require("../controllers/stories");

// Protects all authenticated users
const { protect } = require("../middleware/auth");

router.route("/").get(protect, getLatestStories).post(protect, upload.array("photos", 3), addStory);
router.route("/recommended").get(protect, getRecommendedStories);
router.route("/:username").get(protect, getUserStories);

router.route("/like").post(protect, like);

module.exports = router;