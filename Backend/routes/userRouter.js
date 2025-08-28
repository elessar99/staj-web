const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { getUser, getUserById, updateUser } = require("../controllers/userController");

router.get("/", authMiddleware, getUser);
router.get("/:userId", authMiddleware, getUserById);
router.patch("/", authMiddleware, updateUser);


module.exports = router;
