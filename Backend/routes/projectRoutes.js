const express = require("express");
const router = express.Router();
const { getProjects, addProject, deleteProject, getUnauthorizedProjects, getAuthorizedProjects } = require("../controllers/projectController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getProjects);
router.get("/add/:userId",authMiddleware, getUnauthorizedProjects)
router.get("/remove/:userId",authMiddleware, getAuthorizedProjects)
router.post("/", authMiddleware, addProject);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProject);

module.exports = router;
