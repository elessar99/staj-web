const express = require("express");
const { getUsers, deleteUser, changeAuthority,
    addProjectToUser , removeProjectFromUser,
    addSitesToUser, removeSitesFromUser,
    getNoneVerifiedUsers, userVerification,
    scheduleUserDeletion,
    } = require("../controllers/adminController");

const { getAllLogs, getUserLogs, getActionLogs, createLogEndpoint } = require("../controllers/logController");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");


router.get("/users", authMiddleware, adminMiddleware, getUsers);

router.post("/changeAuthority/:userId", authMiddleware, adminMiddleware, changeAuthority);
 
router.delete("/:userId", authMiddleware, adminMiddleware, deleteUser);

router.post("/addProject/:userId", authMiddleware, adminMiddleware, addProjectToUser);

router.post("/removeProject/:userId", authMiddleware, adminMiddleware, removeProjectFromUser);

router.post("/addSites/:userId", authMiddleware, adminMiddleware, addSitesToUser);

router.post("/removeSites/:userId", authMiddleware, adminMiddleware, removeSitesFromUser);

router.get("/noneVerifiedUsers", authMiddleware, adminMiddleware, getNoneVerifiedUsers);

router.post("/confirmUser/:userId", authMiddleware, adminMiddleware, userVerification);

router.get("/logs", authMiddleware, adminMiddleware, getAllLogs);

router.get("/logs/user/:userId", authMiddleware, adminMiddleware, getUserLogs);

router.get("/logs/action/:action", authMiddleware, adminMiddleware, getActionLogs);

router.patch("/scheduleDeletion", authMiddleware, adminMiddleware, scheduleUserDeletion);

module.exports = router;
