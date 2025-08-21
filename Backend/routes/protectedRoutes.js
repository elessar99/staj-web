const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/me", authMiddleware, async (req, res) => {
    try {
    const user = await User.findById(req.userId).select("-password");
    const tokenVersion = req.tokenVersion; // Token versiyonunu al
    if (user.tokenVersion !== tokenVersion) {
        return res.status(403).json({ error: "Token versiyonu uyuşmuyor." });
    }
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    res.json({
        user: {
        userName: user.userName,
        email: user.email,
        isAdmin: user.isAdmin
        },
    });
    } catch (err) {
    res.status(500).json({ error: "Sunucu hatası (me)." });
    }
});

module.exports = router;
