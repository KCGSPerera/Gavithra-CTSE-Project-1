const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Order - Service MongoDB connected successfully");
    } catch (err) {
        console.error("Order - Service MongoDB connection failed:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
