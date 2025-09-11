const express = require("express");
const router = express.Router();
const { getSites, addSite, deleteSite, getAllSites, getMissingSites, getIncludedSites, getSubsites, createSubSite } = require("../controllers/siteController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");


router.get("/:projectId", authMiddleware, getSites);
router.get("/all/:projectId", authMiddleware, getAllSites)
router.get("/:projectId/missing", authMiddleware, getMissingSites)
router.get("/:projectId/included", authMiddleware, getIncludedSites)
router.post("/", authMiddleware, addSite);
router.delete("/:id", authMiddleware, adminMiddleware, deleteSite);
router.get("/sub/:siteId", authMiddleware, getSubsites);
router.post("/sub/:siteId", authMiddleware, createSubSite);

module.exports = router;
