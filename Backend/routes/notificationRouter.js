const express = require("express");
const router = express.Router();
const {createNotification, getNotificationsForUser, deleteNotification, markAsRead } = require("../controllers/notificationController");
const {authMiddleware} = require("../middleware/authMiddleware");

router.patch("/:id", authMiddleware, markAsRead);
router.get("/", authMiddleware, getNotificationsForUser);
router.delete("/:id", authMiddleware, deleteNotification);

module.exports = router;