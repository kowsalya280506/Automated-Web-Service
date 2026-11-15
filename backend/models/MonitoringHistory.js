
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    statusCode: {
        type: Number,
        default: null
    },
    responseTime: {
        type: Number,
        default: 0
    },
    state: {
        type: String,
        enum: [
            "Healthy",
            "Slow",
            "Unavailable",
            "Recovering",
            "Restored"
        ],
        required: true
    },
    checkedAt: {
        type: Date,
        default: Date.now
    },
    errorMessage: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model(
    "MonitoringHistory",
    historySchema
);
