const mongoose = require("mongoose");

async function connectDB() {
    const conn = await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
    console.log(`MongoDB Connected ${conn.connection.host}`);
}

module.exports = connectDB;