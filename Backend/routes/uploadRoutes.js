const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadExcel } = require("../controllers/uploadController");
const {authMiddleware} = require("../middleware/authMiddleware");

// Dosyaları 'uploads/' klasörüne kaydedecek
const upload = multer({ dest: "uploads/" });

router.post("/", authMiddleware, upload.single("file"), uploadExcel);

module.exports = router;
