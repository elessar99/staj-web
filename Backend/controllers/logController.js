const Log = require("../models/Log");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // veya kendi SMTP sunucun
  auth: {
    user: "erden0652@gmail.com",
    pass: "gwpy qzmx gond zadc"
  }
});

const sendLogMail = async (subject, text, to = "erden0652@gmail.com") => {
  await transporter.sendMail({
    from: '"Log Uyarı" <erden0652@gmail.com>',
    to,
    subject,
    text
  });
};

// Yardımcı log oluşturma fonksiyonu (diğer controllerlar için)
const createLog = async ({ userId, action, details }) => {
  try {
    const user = await User.findById(userId);
    const email = user ? user.email : "Unknown";
    const newLog = new Log({ userId, email, action, details });
    await newLog.save();
    // Kritik aksiyonlar için mail gönder
    const criticalActions = ["DELETE_USER", "DELETE_PROJECT", "DELETE_SITE", "ADD_SITE", "ADD_PROJECT"];
    if (criticalActions.includes(action)) {
      await sendLogMail(
        `Kritik Aksiyon: ${action}`, 
        `Kullanıcı: ${email}\nAksiyon: ${action}\nDetaylar: ${details}`);
    }


    return newLog;
  } catch (err) {
    console.error("Log oluşturulurken hata:", err);
    return null;
  }
}

// API endpoint olarak log oluşturma (isteğe bağlı)
const createLogEndpoint = async (req, res) => {
  try {
    const { userId, action, details } = req.body;
    const newLog = await createLog({ userId, action, details });
    res.status(201).json({ message: "Log oluşturuldu.", log: newLog });
  } catch (err) {
    console.error("Log oluşturulurken hata:", err); 
    res.status(500).json({ error: "Sunucu hatası (createLog)." });
  }
}

const getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find();

    res.json({ logs });
  } catch (err) {   
    console.error("Loglar getirilirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (getLogs)." });
  }
}

const getUserLogs = async (req, res) => {
  try {
    const userId = req.params.userId;
    const logs = await Log.find({ userId });
    res.json({ logs });
  } catch (err) {
    console.error("Kullanıcı logları getirilirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (getUserLogs)." });
  }
}

const getActionLogs = async (req, res) => {
  try {
    const action = req.params.action;
    const logs = await Log.find({ action });
    res.json({ logs });
  } catch (err) {
    console.error("Aksiyon logları getirilirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (getActionLogs)." });
  }
}

module.exports = {
  createLog,
  createLogEndpoint,
  getAllLogs,
  getUserLogs,
  getActionLogs
};