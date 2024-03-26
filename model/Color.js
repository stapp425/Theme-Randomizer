const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const colorScheme = new Schema({
    name: {
        type: String,
        required: true
    },
    colors: {
        type: Array,
        required: true
    },
    favorite: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model("Color", colorScheme);