const User = require("../models/User");
const Site = require("../models/Site");
const Project = require("../models/Project");
const { createLog } = require("./logController");
const { createNotification, createNotifications } = require("./notificationController");
const { create } = require("../models/Inventory");

const getUsers = async (req, res) => {
  try {
    const userId = req.userId
    const Users = await User.find({ approved: true }).select("-password");
    const filteredUsers = Users.filter(user => user._id.toString() !== userId.toString());
    res.json(filteredUsers);
    } catch (err) {
    console.error("Kullanıcılar alınırken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (getUsers)."
    });
  }
}

const userVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const isAdmin = req.isAdmin;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    if (!isAdmin) {
      return res.status(403).json({ error: "Yetkisiz işlem." });
    }
    user.approved = true;
    user.tokenVersion += 1;
    await user.save();
    await createLog({
      userId: req.userId,
      action: "VERIFY_USER",
      details: `Kullanıcı onaylandı: ${user._id} - ${user.email}`
    });
    res.json(user);
  } catch (err) {
    console.error("Kullanıcı onaylanırken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (userVerification)." });
  }
}

const getNoneVerifiedUsers = async (req, res) => {
  try {
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
      return res.status(403).json({ error: "Yetkisiz işlem." });
    }
    const users = await User.find({ approved: false }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Onaylanmamış kullanıcılar alınırken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (getNoneVerifiedUsers)." });
  }
}

const changeAuthority = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    user.isAdmin = req.body.isAdmin;
    user.tokenVersion += 1;
    await user.save();
    await createNotification(
      user._id,
      `Yetkiniz <b>${user.isAdmin ? "Admin" : "Kullanıcı"}</b> olarak değiştirildi.`,
      "info",
      true
    );
    await createLog({
      userId: req.userId,
      action: "CHANGE_AUTHORITY",
      details: `Kullanıcı yetkisi değiştirildi: ${user._id} - Yeni Yetki: ${user.isAdmin ? "Admin" : "Kullanıcı"}`
    });
    res.json(user);
  } catch (err) {
    console.error("Kullanıcı bilgileri alınırken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (authorizationUser)." });
    }
}


const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    await User.findByIdAndDelete(userId);
    await createLog({
      userId: req.userId,
      action: "DELETE_USER",
      details: `Kullanıcı silindi: ${user._id} - ${user.email}`
    });
    res.json({ message: "Kullanıcı silindi." });
  } catch (err) {
    console.error("Kullanıcı silinirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (deleteUser)." });
  }
};

const addProjectToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    let allSitesToAdd = req.body.sites || [];
    let clearedSites = [...allSitesToAdd];

    // Tüm üst siteleri zincir halinde ekle
    const siteControl = async (siteId) => {
      const site = await Site.findById(siteId);
      if (site && site.topSite && !clearedSites.includes(site.topSite.toString())) {
        clearedSites.push(site.topSite.toString());
        await siteControl(site.topSite.toString());
      }
    };

    for (let siteId of allSitesToAdd) {
      await siteControl(siteId);
    }

    user.permissions.push({
      project: req.body.projectId,
      sites: clearedSites,
    });

    user.tokenVersion += 1;
    await user.save();

    // Proje ve site isimlerini bul
    const project = await Project.findById(req.body.projectId);
    const siteDocs = await Site.find({ _id: { $in: clearedSites } });

    // Bildirim için tablo hazırla
    const tableRows = siteDocs.map(site =>
      `<tr><td>${site.name}</td></tr>`
    ).join("");

    const changeTable = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse; font-size:13px;">
        <thead>
          <tr>
            <th>Eklenen Proje</th>
            <th>Eklenen Siteler</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${project ? project.name : req.body.projectId}</td>
            <td>
              <table border="0" cellpadding="3" cellspacing="0" style="font-size:13px;">
                ${tableRows}
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    await createNotification(
      user._id,
      `<b>Yetkinize yeni proje ve siteler eklendi:</b><br><br>${changeTable}`,
      "info",
      true
    );

    await createLog({
      userId: req.userId,
      action: "USER_INCLUDE",
      details: `Kullanıcıya proje eklendi: ${user._id} - Proje: ${project ? project.projectName : req.body.projectId} - Siteler: ${siteDocs.map(s => s.siteName).join(", ")}`
    });

    res.json(user);
  } catch (err) {
    console.error("Kullanıcıya proje eklenirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (addProjectToUser)." });
  }
};

const addSitesToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    const projectPermission = user.permissions.find(p => p.project.toString() === req.body.projectId);
    if (!projectPermission) {
        return res.status(404).json({ error: "Proje bulunamadı." });
    }

    let allSitesToAdd = req.body.sites || [];
    let clearedSites = [...allSitesToAdd];

    const siteControl = async (siteId) => {
      const site = await Site.findById(siteId);
      console.log("Kontrol edilen site:", siteId, site ? site.name : "Bulunamadı");
      if (site && site.topSite && !clearedSites.includes(site.topSite.toString()) && !projectPermission.sites.includes(site.topSite.toString())) {
        clearedSites.push(site.topSite.toString());
        await siteControl(site.topSite.toString());
      }
    }

    for (let siteId of allSitesToAdd) {
      await siteControl(siteId);
    }
    console.log("Eklenecek siteler (üst siteler dahil):", clearedSites);

    projectPermission.sites.push(...clearedSites);

    console.log("Kullanıcıya eklenen siteler:", projectPermission.sites);
    user.tokenVersion += 1;
    await user.save();

    // Proje ve site isimlerini bul
    const project = await Project.findById(req.body.projectId);
    const siteDocs = await Site.find({ _id: { $in: clearedSites } });

    // Bildirim için tablo hazırla
    const tableRows = siteDocs.map(site =>
      `<tr><td>${site.name}</td></tr>`
    ).join("");

    const changeTable = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse; font-size:13px;">
        <thead>
          <tr>
            <th>${project ? project.name : req.body.projectId} Projesine Eklenen Siteler</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <table border="0" cellpadding="3" cellspacing="0" style="font-size:13px;">
                ${tableRows}
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    await createNotification(
      user._id,
      `<b>Yetkinizdeki ${project ? project.name : req.body.projectId} projesine yeni siteler eklendi:</b><br><br>${changeTable}`,
      "info",
      true
    );

    await createLog({
      userId: req.userId,
      action: "USER_INCLUDE",
      details: `Kullanıcıya siteler eklendi: ${user._id} - Proje ID: ${req.body.projectId} - Siteler: ${req.body.sites.join(", ")}`
    });

    res.json(user);
    } catch (err) {
    console.error("Kullanıcıya siteler eklenirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (addSitesToUser)." });
  }
}
    

const removeProjectFromUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    user.permissions = user.permissions.filter(p => p.project.toString() !== req.body.projectId);
    user.tokenVersion += 1;
    await user.save();

    const project = await Project.findById(req.body.projectId);

    await createNotification(
      user._id,
      `Yetkinizden bir proje kaldırıldı: <b>${project.name} - ${project._id}</b>`,
      "info",
      true
    );

    await createLog({
      userId: req.userId,
      action: "USER_EXCLUDE",
      details: `Kullanıcıdan proje silindi: ${user._id} - Proje ID: ${req.body.projectId}`
    });
    
    res.json(user);
  } catch (err) {
    console.error("Kullanıcıdan proje silinirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (removeProjectFromUser)." });
  }
}

const removeSitesFromUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    const projectPermission = user.permissions.find(p => p.project.toString() === req.body.projectId);
    if (!projectPermission) {
        return res.status(404).json({ error: "Proje bulunamadı." });
    }

    let siteList = [...projectPermission.sites];

    let siteControl = async (siteId) => {
      const site = await Site.findById(siteId);
      if(site && site.hasSubSite) {
        for(const siteId of siteList) {
          const subSite = await Site.findById(siteId);
          if(subSite && subSite.topSite && subSite.topSite.toString() === site._id.toString()) {
            siteList = siteList.filter(s => s.toString() !== subSite._id.toString());
            await siteControl(subSite._id, siteList);
          }
        }
      }
      siteList = siteList.filter(s => s.toString() !== siteId.toString());
    }

    for(const siteId of req.body.sites) {
      await siteControl(siteId, siteList);
    }
    const removedSites = projectPermission.sites.filter(s => !siteList.includes(s));
    projectPermission.sites = siteList;
    user.tokenVersion += 1;
    await user.save();
    const siteDocs = await Site.find({ _id: { $in: removedSites } });
    const project = await Project.findById(req.body.projectId);

    // Bildirim için tablo hazırla
    const tableRows = siteDocs.map(site =>
      `<tr><td>${site.name}</td></tr>`
    ).join("");

    const changeTable = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse; font-size:13px;">
        <thead>
          <tr>
            <th>${project ? project.name : req.body.projectId} Projesinden Kaldırılan Siteler</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <table border="0" cellpadding="3" cellspacing="0" style="font-size:13px;">
                ${tableRows}
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `;
    console.log("contorl")
    await createNotification(
      user._id,
      `<b>Yetkinizden ${project.name} projesine ait siteler kaldırıldı:</b><br><br>${changeTable}`,
      "info",
      true
    );

    await createLog({
      userId: req.userId,
      action: "USER_EXCLUDE",
      details: `Kullanıcıdan siteler silindi: ${user._id} - Proje ID: ${req.body.projectId} - Siteler: ${removedSites.join(", ")}`
    });
    res.json(user);
    } catch (err) {
    console.error("Kullanıcıdan siteler silinirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (removeSitesFromUser)." });
  }
}

const scheduleUserDeletion = async (req, res) => {
  const userId = req.body.userId;
  const days = req.body.days; // kaç gün sonra silinecek
  // days: Kaç gün sonra silinsin
  const now = new Date();
  // const deleteAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000); // gün cinsinden ileri tarih
  const deleteAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000); // gün cinsinden ileri tarih
  
  await createNotification(
    userId,
    `Hesabınız <b>${days} gün</b> sonra otomatik olarak silinecektir.`,
    "warning",
    true
  );  

  await createLog({
    userId: req.userId,
    action: "SCHEDULE_USER_DELETION",
    details: `Kullanıcı silme işlemi planlandı: ${userId} - ${days} gün sonra silinecek.`
  });

  await User.findByIdAndUpdate(userId, {
    accountTerminatedDate: deleteAt, // isteğe bağlı, silme işlemi başlatıldı
  });
  return { success: true, message: `${days} gün sonra kullanıcı otomatik silinecek.` };
};




module.exports = {deleteUser, getUsers, changeAuthority,
    addProjectToUser, removeProjectFromUser, 
    addSitesToUser, removeSitesFromUser,
    getNoneVerifiedUsers, userVerification,
    scheduleUserDeletion };
