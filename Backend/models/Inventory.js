const mongoose = require("mongoose");
const { link } = require("../routes/projectRoutes");

const InventorySchema = new mongoose.Schema({
    _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  device: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Cihaz adı 100 karakteri geçemez']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Cihaz adı 100 karakteri geçemez']
  },
  link: {
    type: String,
    required: true,
    trim: true,
    validate: { 
        validator: function(value) {
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipRegex.test(value);
    },
    message: 'Geçersiz IP adresi formatı'
      }
  },
  productSerialNumber: {
    type: String,
    required: true,
  },
  lisansStartDate: {
    type: Date,
    required: true,
  },
  lisansEndDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Konum 100 karakteri geçemez']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', "retired"],
    default: 'inactive',
  },
  lisansStartDate: { 
    type: Date,
    required: true
  },
  lisansEndDate: { 
    type: Date,
    required: true
  },
  followerUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
},
{
  timestamps: true,
});

module.exports = mongoose.model("Inventory", InventorySchema);
