const express = require("express");
const router = express.Router();
const { getSites, addSite, deleteSite, getAllSites, getMissingSites, getIncludedSites } = require("../controllers/siteController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");


router.get("/:projectId", authMiddleware, getSites);
router.get("/all/:projectId", getAllSites)
router.get("/:projectId/missing", getMissingSites)
router.get("/:projectId/included", getIncludedSites)
router.post("/", authMiddleware, addSite);
router.delete("/:id", authMiddleware, adminMiddleware, deleteSite);

module.exports = router;
