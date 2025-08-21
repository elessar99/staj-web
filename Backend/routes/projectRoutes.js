const express = require("express");
const router = express.Router();
const { getProjects, addProject, deleteProject, getUnauthorizedProjects, getAuthorizedProjects } = require("../controllers/projectController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getProjects);
router.get("/add/:userId", getUnauthorizedProjects)
router.get("/remove/:userId", getAuthorizedProjects)
router.post("/", authMiddleware, addProject);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProject);

module.exports = router;
