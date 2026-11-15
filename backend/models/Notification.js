
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
        index: true
    },

    serviceName: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["Failure", "Recovery", "Restored"],
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    isRead: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);
