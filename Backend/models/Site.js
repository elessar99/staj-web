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
  topSite: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Site", 
    default: null 
  },
  hasSubSite: { 
    type: Boolean, 
    default: false
  },
  isSubSite: { 
    type: Boolean, 
    default: false
  },
});

module.exports = mongoose.model("Site", SiteSchema);
