const Story = require("../models/Story");
const Like = require("../models/Like");
const User = require("../models/User");
const Ranking = require("../CollectiveIntelligence/Ranking");
const ObjectId = require("mongoose").Types.ObjectId;
const multer = require('multer');

/**
 * Defines Storage Location and filename for uploads
 * Stores files in an uploads folder
 * Each File starts with a randomly generated Prefix and ends with the original filename
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniquePrefix = Math.round(Math.random() * 1E10)
        cb(null, uniquePrefix + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Define fields to be gathered from db
const storyPopulate = { path: "author likes", select: "_id username rating", populate: { path: "user", select: "_id username" } };

/**
 * Get stories that were not created by the given user
 * SORTED: chronologically
 * @route GET /api/stories/latest
 */
async function getLatestStories(req, res) {
    try {
        let stories = await Story.find({ author: { $ne: req.user._id } }).sort({ createdAt: "desc" }).populate(storyPopulate).exec();

        return res.status(200).json({
            data: stories
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: "Server Error"
        })
    }
}

/**
 * Get stories that were created by the given user 
 * SORTED: chronologically
 * @route GET /api/stories/:username
 */
async function getUserStories(req, res) {
    try {
        let user = await User.find({ username: req.params.username }).exec();

        // if the user was found by username the first item will be that user
        user = user[0];
        let stories = await Story.find({ author: user._id }).sort({ createdAt: "desc" }).populate(storyPopulate).exec();

        return res.status(200).json({
            data: stories
        })
    } catch (e) {
        return res.status(500).json({
            error: "Server Error"
        })
    }
}

/**
 * Adds a story to the database with the authenticated user as the author
 * Validation checks are run by mongoose to ensure data integrity
 * @route POST /api/stories
 */
async function addStory(req, res) {
    try {

        // multer provides an array of files that were uploaded
        const images = req.files.map(file => file.path);

        const story = await Story.create({ text: req.body.text, author: req.user._id, images });

        return res.status(201).json({ data: story });
    } catch (err) {
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map(val => ({ field: val.path, error: val.message }));

            return res.status(400).json({
                error: messages
            })
        } else {
            return res.status(500).json({
                error: "Server Error"
            })
        }
    }

}

/**
 * Handles liking a story
 * @route POST /api/stories/like/:storyId
 */
async function like(req, res) {

    try {

        const { storyId, rating } = req.body;
        const user = req.user;

        let story = await Story.findById(storyId).exec();

        if (!story) {
            return res.status(404).json({ error: "No story found" });
        }

        // Prevent a user from liking their own story
        if (story.author === req.user._id) {
            return res.status(400).json({ error: "Can't like own story" });
        }

        // Creates like, push likes to story and to user to be used for recommendation engine
        const like = await Like.create({ story: story._id, user: req.user._id, rating });
        await story.update({ $push: { likes: { _id: like._id } } }).exec();
        await user.update({ $push: { likes: { _id: like._id } } }).exec();

        return res.status(201).send();
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(val => ({ field: val.path, error: val.message }));

            return res.status(400).json({
                error: messages
            })
        } else {
            return res.status(500).json({
                error: "Server Error"
            })
        }
    }
}

/**
 * Get recommended stories for current user by running the recommendation algorithm
 * SORTED: by recommendation
 * @route GET /api/stories/recommended
 */
async function getRecommendedStories(req, res) {
    try {

        // Get all users that have liked posts
        const allUsersWithLikes = await User.find().populate("likes", "-_id story rating").select("_id");

        // format the data correctly for collaborative filtering
        const formattedLikes = {};
        for (const user of allUsersWithLikes) {
            formattedLikes[user._id] = user.likes.map(like => ({ [like.story]: like.rating }));
        }

        // Call ranking algorithm
        // DEFAULT: pearson
        const recommended = new Ranking().getRecommendations(formattedLikes, req.user._id, "sim_pearson");

        const recommendedStoryIds = recommended.map(r => ObjectId(r.story));

        // mongodb gives us the stories back in random order
        // so this is used to retain the stories ranked by score
        const storiesOrderedByScore = recommendedStoryIds.reduce((obj, id) => {
            obj[id] = null
            return obj
        }, {});

        // Find all the recommended stories by their id
        const stories = await Story.find({
            _id: {
                $in: recommendedStoryIds
            }
        }).populate(storyPopulate).exec();

        // insert them in the correct order
        for (const story of stories) {
            storiesOrderedByScore[story._id] = story;
        }

        res.status(200).send({ data: Object.values(storiesOrderedByScore) });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: "Server Error"
        })
    }

}

exports.getLatestStories = getLatestStories;
exports.addStory = addStory;
exports.like = like;
exports.getRecommendedStories = getRecommendedStories;
exports.getUserStories = getUserStories;
exports.upload = upload;