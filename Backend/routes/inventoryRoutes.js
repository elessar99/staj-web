const express = require("express");
const router = express.Router();
const {
  getInventories,
  addInventory,
  updateInventory,
  deleteInventory,
  allInventory,
} = require("../controllers/inventoryController");

router.get("/:siteId", getInventories);
router.post("/", addInventory);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

module.exports = router;
