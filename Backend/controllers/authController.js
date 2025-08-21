const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SECRET = process.env.JWT_SECRET;
const TOKEN_SURESI = "30d";


const register = async (req, res) => {
  try {
    const { email, userName, password } = req.body;
    if (!email || !userName || !password) {
    return res.status(400).json({ error: "Tüm alanlar zorunludur" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Geçersiz email formatı" });
    }
    if (userName.length < 3 || userName.length > 20) {
      return res.status(400).json({ error: "Kullanıcı adı 3-20 karakter arasında olmalıdır" });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "Parola en az 4 karakter olmalıdır" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Bu e-posta zaten kayıtlı." });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);


    const user = new User({ email, userName , password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Kayıt başarılı." });
  } catch (err) {
    console.error("Kayıt hatası:", err);
    res.status(500).json({ error: "Sunucu hatası (register)." });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Kullanıcı bulunamadı." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Şifre yanlış." });
    }

    user.tokenVersion += 1; // Token versiyonunu artır
    await user.save();
    
    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin, tokenVersion: user.tokenVersion }, SECRET, { expiresIn: TOKEN_SURESI });
    console.log("Oluşturulan Token:", token);
    res.cookie("token", token, {
      httpOnly: true,          
      maxAge: 1000 * 60 * 60 * 24 * 30, 
      sameSite: "Lax",         
      secure: false,
      path: "/",           
    });

    res.status(200).json({ 
      message:"giriş başarılı",
      user: {
          userName: user.userName,
          email: user.email,
          isAdmin: user.isAdmin
      }
     });

  } catch (err) {
    console.error("Giriş hatası:", err);
    res.status(500).json({ error: "Sunucu hatası (login)." });
  }
};

const logout = async (req, res) =>{
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
    path: "/" 
  });

  res.status(200).json({ message: "Çıkış başarılı." });
}

module.exports = { register, login, logout };
