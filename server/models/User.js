const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    passwordHash: { type: String, required: true},
    instrument: { type: String, default: "guitar"},
    isOnlyVocal: { type: Boolean, default: false},
    isAdmin: { type: Boolean, default: false}
});

module.exports = mongoose.model("User", userSchema);