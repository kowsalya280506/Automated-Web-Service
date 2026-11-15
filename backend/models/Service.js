
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    currentStatus: {
        type: String,
        enum: ["Healthy", "Slow", "Unavailable", "Recovering", "Restored"],
        default: "Healthy"
    },
    responseTime: {
        type: Number,
        default: 0
    },
    lastChecked: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Service", serviceSchema);
