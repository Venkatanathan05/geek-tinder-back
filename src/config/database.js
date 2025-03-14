const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://bsvenkatanathan:ykB55emGWBkpHDgN@cluster1.uuxth.mongodb.net/"
    );
}

module.exports = { connectDB }
