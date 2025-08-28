const mongoose = require("mongoose");

const SiteSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Project" 
  },
  subSites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
  }],
  topSite: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Site", 
    default: null 
  },
});

module.exports = mongoose.model("Site", SiteSchema);
