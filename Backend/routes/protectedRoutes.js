const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/me", authMiddleware, async (req, res) => {
    try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

    res.json({
        user: {
        userName: user.userName,
        email: user.email,
        },
    });
    } catch (err) {
    res.status(500).json({ error: "Sunucu hatası (me)." });
    }
    res.json({ message: "Token geçerli!", userId: req.userId });
});

module.exports = router;
