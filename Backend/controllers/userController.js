const User = require("../models/User");

const getUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    res.json({ user });
  } catch (err) {
    console.error("Kullanıcı getirilirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (getUser)." });
  }
}

const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    res.json({ user });
  } catch (err) {
    console.error("Kullanıcı getirilirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (getUserById)." });
  }
}

const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { department, phone, sicilNo, position } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    user.department = department || user.department;
    user.phone = phone || user.phone;
    user.sicilNo = sicilNo || user.sicilNo;
    user.position = position || user.position;
    await user.save();
    res.json({ message: "Kullanıcı bilgileri güncellendi." });
  } catch (err) {
    console.error("Kullanıcı güncellenirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (updateUser)." });
  }
}

module.exports = {getUser,getUserById, updateUser};
