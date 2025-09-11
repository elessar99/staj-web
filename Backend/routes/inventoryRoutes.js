const express = require("express");
const router = express.Router();
const {
  getInventories,
  addInventory,
  updateInventoryInfo,
  updateInventoryLicense,
  deleteInventory,
  changeStatus,
  followItem,
  unfollowItem
} = require("../controllers/inventoryController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

router.get("/:siteId", authMiddleware, getInventories);
router.post("/", authMiddleware, addInventory);
router.patch("/:id", authMiddleware, updateInventoryInfo);
router.patch("/lisans/:id", authMiddleware, updateInventoryLicense);
router.delete("/:id", authMiddleware, adminMiddleware, deleteInventory);
router.patch("/status/:id", authMiddleware, changeStatus);
router.post("/follow", authMiddleware, followItem);
router.post("/unfollow", authMiddleware, unfollowItem);


module.exports = router;
