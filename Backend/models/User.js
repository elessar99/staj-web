const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  userName:{
    type: String,
    required : true
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  permissions :[{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    sites:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
    }]
  }],
  tokenVersion: { 
    type: Number, 
    default: 0 
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
