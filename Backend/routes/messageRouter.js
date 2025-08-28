const express = require("express");
const router = express.Router();
const { sendMessage, getMessagesForUser, getMessagesWithUser, deleteMessage, isRead } = require("../controllers/messageController");
const {authMiddleware} = require("../middleware/authMiddleware");

router.post("/", authMiddleware, sendMessage);
router.get("/", authMiddleware, getMessagesForUser);
router.get("/:userId", authMiddleware, getMessagesWithUser);
router.delete("/:messageId", authMiddleware, deleteMessage);
router.patch("/read/:messageId", authMiddleware, isRead);



module.exports = router;