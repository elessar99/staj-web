const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; 

  if (!token) {
    return res.status(401).json({ error: "Token eksik." });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    req.tokenVersion = decoded.tokenVersion;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Geçersiz veya süresi dolmuş token." });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "Bu işlem için yetkiniz yok." });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
