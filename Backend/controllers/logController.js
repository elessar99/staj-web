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
    html: text // HTML versiyonu (tablo formatı için)
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
    const criticalActions = ["DELETE_USER", "DELETE_PROJECT", "DELETE_SITE", "ADD_SITE", "ADD_PROJECT", "SCHEDULE_USER_DELETION"];
    
    if (criticalActions.includes(action)) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .log-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .log-table th, .log-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .log-table th { background-color: #f4f4f4; font-weight: bold; }
                .log-table tr:nth-child(even) { background-color: #f9f9f9; }
                .critical { background-color: #ffebee !important; color: #c62828; }
            </style>
        </head>
        <body>
            <h2>🚨 Kritik Sistem Aksiyonu</h2>
            <table class="log-table">
                <tr>
                    <th width="150">Alan</th>
                    <th>Değer</th>
                </tr>
                <tr class="critical">
                    <td><strong>Aksiyon Tipi</strong></td>
                    <td><strong>${action}</strong></td>
                </tr>
                <tr>
                    <td>Kullanıcı Email</td>
                    <td>${email}</td>
                </tr>
                <tr>
                    <td>Kullanıcı ID</td>
                    <td>${userId}</td>
                </tr>
                <tr>
                    <td>Zaman</td>
                    <td>${new Date().toLocaleString('tr-TR')}</td>
                </tr>
                <tr>
                    <td>Detaylar</td>
                    <td>${details}</td>
                </tr>
            </table>
            <p><em>Bu mail otomatik olarak gönderilmiştir.</em></p>
        </body>
        </html>
      `;

      await sendLogMail(
        `🚨 Kritik Aksiyon: ${action}`, 
        htmlContent,
        "erden0652@gmail.com"
      );
    }
    return newLog;
  } catch (err) {
    console.error("Log oluşturulurken hata:", err);
    return null;
  }
};

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