const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  console.log(req.cookies)
  const token = req.cookies.token; 
  console.log("token: ", token)

  if (!token) {
    return res.status(401).json({ error: "Token eksik." });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Geçersiz veya süresi dolmuş token." });
  }
};

module.exports = authMiddleware;
