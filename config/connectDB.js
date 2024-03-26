const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.DATABASE_ACCESS_URI);
    } catch(err) {
        console.error(err);
    }
}

module.exports = connectDB;