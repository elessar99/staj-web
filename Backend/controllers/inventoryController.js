const Inventory = require("../models/Inventory");

const getInventories = async (req, res) => {
  const inventories = await Inventory.find({ siteId: req.params.siteId });
  res.json(inventories);
};

const addInventory = async (req, res) => {
  const inventory = new Inventory({
    name: req.body.name,
    link: req.body.link,
    productSerialNumber: req.body.productSerialNumber,
    siteId: req.body.siteId,
  });
  await inventory.save();
  res.json(inventory);
};

const updateInventory = async (req, res) => {
  const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteInventory = async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

module.exports = {
  getInventories,
  addInventory,
  updateInventory,
  deleteInventory,
};
