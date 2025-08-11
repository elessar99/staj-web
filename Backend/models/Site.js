const mongoose = require("mongoose");

const SiteSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true
   },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
});

module.exports = mongoose.model("Site", SiteSchema);
