const express = require("express");
const router = express.Router();
const {
  getInventories,
  addInventory,
  updateInventory,
  deleteInventory,
  changeStatus,
} = require("../controllers/inventoryController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

router.get("/:siteId", authMiddleware, getInventories);
router.post("/", authMiddleware, addInventory);
router.put("/:id", authMiddleware, updateInventory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteInventory);
router.patch("/:id", authMiddleware, changeStatus);

module.exports = router;
