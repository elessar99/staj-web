const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    to: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    isHtml: { 
        type: Boolean, 
        default: false   
    },
    type: { 
        type: String, 
        default: "info" // örn: info, warning, message 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    read: { 
        type: Boolean, 
        default: false 
    }
});

module.exports = mongoose.model("Notification", NotificationSchema);
