const dotenv = require("dotenv");
const Story = require("./models/Story");
const User = require("./models/User");
const Like = require("./models/Like");

const connectDB = require("./config/db");
dotenv.config({ path: "./config/config.env" });

const data = require("./public/Data/usersStoriesAndRatings.json");

(async function seed() {
    await connectDB();

    await User.deleteMany({}).exec();
    await Like.deleteMany({}).exec();
    await Story.deleteMany({}).exec();

    const userIdMap = {};
    const storyIdMap = {};

    for (const user of data.users) {
        const u = await User.register(new User({ username: user.userId }), "password");
        userIdMap[user.userId] = u._id;
        console.log(`${user.userId} added`);
    }

    for (const story of data.stories) {
        const p = await Story.create({ text: story.text, author: userIdMap[story.userId] });
        storyIdMap[story.storyId] = p._id;
    }

    for (const user of data.users) {
        const dbUser = await User.findById(userIdMap[user.userId]).exec();

        for (const rating of user.ratings) {
            const story = await Story.findById(storyIdMap[rating.storyId]).exec();
            const like = await Like.create({ story: story._id, user: dbUser._id, rating: rating.rating });
            await story.updateOne({ $push: { likes: { _id: like._id } } }).exec();
            await dbUser.updateOne({ $push: { likes: { _id: like._id } } }).exec();
        }
        console.log(`${Math.min(10, user.ratings.length)} likes added for ${user.userId}`);
    }

    console.log("Done");

})()