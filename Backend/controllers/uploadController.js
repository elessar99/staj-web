const ExcelJS = require("exceljs");
const fs = require("fs");
const Inventory = require("../models/Inventory");

const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Dosya bulunamadı." });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[2];

    const rows = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // başlığı atla

      const [name, link, sn] = row.values.slice(1); // A, B, C sütunları

      rows.push({
        name: name || "",
        link: link || "",
        productSerialNumber: sn || "",
        siteId: req.body.siteId || "manual", // frontend'den gelmeyebilir
      });
    });

    await Inventory.insertMany(rows);
    fs.unlinkSync(req.file.path); // dosyayı sil

    res.status(200).json({ message: `${rows.length} kayıt başarıyla eklendi.` });
  } catch (error) {
    console.error("Excel yükleme hatası:", error);
    res.status(500).json({ error: "Yükleme sırasında hata oluştu." });
  }
};

module.exports = { uploadExcel };
