const express = require("express");
const { allInventory, allSite } = require("../controllers/filterController");
const router = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware");


router.get("/inventory", authMiddleware, allInventory);
router.get("/site", authMiddleware, allSite)


module.exports = router;