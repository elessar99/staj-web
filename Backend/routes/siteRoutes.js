const express = require("express");
const router = express.Router();
const { getSites, addSite, deleteSite } = require("../controllers/siteController");


router.get("/:projectId", getSites);
router.post("/", addSite);
router.delete("/:id", deleteSite);

module.exports = router;
