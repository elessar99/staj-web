const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadExcel } = require("../controllers/uploadController");

// Dosyaları 'uploads/' klasörüne kaydedecek
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), uploadExcel);

module.exports = router;
