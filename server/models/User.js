const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true }, // to control the same username registered
    password: String,
}, { timestamps: true }) // to know when the user has created

const userModel = mongoose.model('User', UserSchema);

module.exports = userModel;