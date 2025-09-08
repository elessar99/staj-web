const cron = require("node-cron");
const Inventory = require("../models/Inventory");
const nodemailer = require("nodemailer");
const Site = require("../models/Site");
const Project = require("../models/Project");

// Mail ayarları
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "erden0652@gmail.com",
    pass: "gwpy qzmx gond zadc"
  }
});

// Her gün saat 13:57'de çalışır
cron.schedule("45 16 * * *", async () => {
  try {
    const now = new Date();
    const threeMonthsLater = new Date(now.getTime() + 3 * 30 * 24 * 60 * 60 * 1000);

    // Tüm site ve projeleri çek
    const sites = await Site.find();
    const projects = await Project.find();

    // Lisans bitiş tarihi 3 aydan az kalanları bul
    const expiringInventories = await Inventory.find({
      lisansEndDate: { $lte: threeMonthsLater, $gte: now }
    });

    if (expiringInventories.length > 0) {
      let htmlText = `
        <h2>Lisans süresi 3 aydan az kalan envanterler</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;">
          <thead>
            <tr>
              <th>Adı</th>
              <th>Product Serial Number</th>
              <th>Link</th>
              <th>Site Adı</th>
              <th>Proje Adı</th>
              <th>Bitişine Kaç Gün Kaldı</th>
              <th>Bitiş Tarihi</th>
            </tr>
          </thead>
          <tbody>
      `;
      expiringInventories.forEach(item => {
        // Site ve proje adlarını eşleştir
        const site = sites.find(s => String(s._id) === String(item.siteId));
        const projectId = site ? site.projectId : null;
        const project = projects.find(p => String(p._id) === String(projectId));
        const siteName = site ? site.name : "-";
        const projectName = project ? project.name : "-";

        htmlText += `
          <tr>
            <td>${item.name}</td>
            <td>${item.productSerialNumber}</td>
            <td>${item.link}</td>
            <td>${siteName}</td>
            <td>${projectName}</td>
            <td>${Math.ceil((new Date(item.lisansEndDate) - now) / (1000 * 60 * 60 * 24))}</td>
            <td>${new Date(item.lisansEndDate).toLocaleDateString("tr-TR")}</td>
          </tr>
        `;
      });
      htmlText += `
          </tbody>
        </table>
      `;

      await transporter.sendMail({
        from: '"Envanter Uyarı" <erden0652@gmail.com>',
        to: "erden0652@gmail.com",
        subject: "Lisans Süresi Yaklaşan Envanterler",
        html: htmlText
      });
    }
  } catch (err) {
    console.error("Cron job hata:", err);
  }
});