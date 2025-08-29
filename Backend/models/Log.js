const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: { expires: '1d' } },
    details: { type: String }
});

module.exports = mongoose.model("Log", LogSchema);