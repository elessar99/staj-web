const express = require("express");
const { allInventory, allSite } = require("../controllers/filterController");
const router = express.Router();


router.get("/inventory", allInventory);
router.get("/site", allSite)


module.exports = router;