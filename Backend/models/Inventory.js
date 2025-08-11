const mongoose = require("mongoose");
const { link } = require("../routes/projectRoutes");

const InventorySchema = new mongoose.Schema({
    _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
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
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
},
{
  timestamps: true,
});

module.exports = mongoose.model("Inventory", InventorySchema);
