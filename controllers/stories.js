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

const storyPopulate = { path: "author likes", select: "_id username rating", populate: { path: "user", select: "_id username" } };

// @route GET /api/stories/latest
// get all stories not by user
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

// @route GET /api/stories/:username
// get stories by user
async function getUserStories(req, res) {
    try {
        let user = await User.find({ username: req.params.username }).exec();
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

// @route POST /api/stories
async function addStory(req, res) {
    try {

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

// @route POST /api/stories/like/:storyId
async function like(req, res) {

    try {

        const { story: storyId, rating } = req.body;
        const user = req.user;

        let story = await Story.findById(storyId).exec();

        if (!story) {
            return res.status(404).json({ error: "No story found" });
        }

        if (story.author === req.user._id) {
            return res.status(400).json({ error: "Can't like own story" });
        }

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

// @route GET /api/stories/recommended
// get recommended stories for current user
async function getRecommendedStories(req, res) {
    try {

        const allUsersWithLikes = await User.find().populate("likes", "-_id story rating").select("_id");

        // format the data correctly for ranking
        const formattedLikes = {};
        for (const user of allUsersWithLikes) {
            formattedLikes[user._id] = user.likes.map(like => ({ [like.story]: like.rating }));
        }

        const recommended = new Ranking().getRecommendations(formattedLikes, req.user._id, "sim_pearson");
        console.log(recommended);

        const recommendedStoryIds = recommended.map(r => ObjectId(r.story));

        // mongodb gives us the stories back in random order
        // so this is used to retain the stories ranked by score
        const storiesOrderedByScore = recommendedStoryIds.reduce((obj, id) => {
            obj[id] = null
            return obj
        }, {});

        const stories = await Story.find({
            _id: {
                $in: recommendedStoryIds
            }
        }).populate(storyPopulate).exec();

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