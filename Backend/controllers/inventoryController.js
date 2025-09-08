const Inventory = require("../models/Inventory");
const User = require("../models/User");
const Site = require("../models/Site");
const {createLog} = require("./logController");
const { createNotification, createNotifications } = require("./notificationController");

const getInventories = async (req, res) => {
  try {
    const { siteId } = req.params;
    const userId = req.userId;
    console.log("userId:", userId, "siteId:", siteId);
    const isAdmin = req.isAdmin 

    // Kullanıcıyı bul ve permissions'larını getir
    const user = await User.findById(userId).select("permissions");
    
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Kullanıcının tüm yetkili olduğu site ID'lerini bul
    const authorizedSiteIds = [];
    user.permissions.forEach(permission => {
      if (permission.sites && permission.sites.length > 0) {
        authorizedSiteIds.push(...permission.sites.map(site => site.toString()));
      }
    });

    if (isAdmin) {
      // Admin ise tüm inventory'leri getir
      const inventories = await Inventory.find({ siteId: siteId });
      return res.json(inventories);
    }

    // Eğer kullanıcı bu site'da yetkili değilse boş array döndür
    if (!authorizedSiteIds.includes(siteId)) {
      return res.json([]);
    }

    // Kullanıcı yetkili ise inventory'leri getir
    const inventories = await Inventory.find({ siteId: siteId });
    res.json(inventories);

  } catch (error) {
    console.error('Error in getInventories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addInventory = async (req, res) => {
  try {
    const isAdmin = req.isAdmin;
    const userId = req.userId;
    const { siteId, device, name, link, productSerialNumber,lisansStartDate, lisansEndDate , location } = req.body;

    // Gerekli alanların kontrolü
    if (!userId || !siteId) {
      return res.status(400).json({ error: "Kullanıcı ID ve Site ID zorunludur." });
    }

    // Kullanıcıyı bul ve permissions'larını getir
    const user = await User.findById(userId).select("permissions");
    
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Site'nin hangi projeye ait olduğunu bul
    const site = await Site.findById(siteId).select("projectId");
    
    if (!site) {
      return res.status(404).json({ error: "Site bulunamadı." });
    }

    // Kullanıcının bu projedeki yetkilerini kontrol et
    const projectPermission = user.permissions.find(p => 
      p.project && p.project.toString() === site.projectId.toString()
    );

    // Eğer kullanıcı bu projede yetkili değilse veya bu site'da yetkisi yoksa
    if (
      !isAdmin && (
        !projectPermission ||
        !projectPermission.sites ||
        !projectPermission.sites.some(s => s.toString() === siteId)
      )
    ) {
      return res.status(403).json({ error: "Bu işlem için yetkiniz bulunmamaktadır." });
    }
    // Yetkisi varsa inventory oluştur ve kaydet
    const inventory = new Inventory({
      device,
      name,
      link,
      productSerialNumber,
      lisansStartDate,
      lisansEndDate,
      location,
      siteId,
    });

    await inventory.save();

    await createLog({
      userId: userId,
      action: "ADD_INVENTORY",
      details: `Inventory eklendi: ${inventory._id} - ${inventory.name}`
    });

    res.json({ 
      success: true, 
      message: "Inventory başarıyla eklendi.",
      inventory 
    });

  } catch (error) {
    console.error('Error in addInventory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Envanter temel bilgilerini güncelleyen fonksiyon
const updateInventoryInfo = async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  const nameNew = req.body.name;
  const serialNew = req.body.productSerialNumber;
  const linkNew = req.body.link;
  const locationNew = req.body.location;
  const updated = await Inventory.findByIdAndUpdate(
    req.params.id,
    { name: nameNew, productSerialNumber: serialNew, link: linkNew, location: locationNew },
    { new: true }
  );

  const changeTable = `
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse; font-size:13px;">
      <thead>
        <tr>
          <th>Alan</th>
          <th>Eski Değer</th>
          <th>Yeni Değer</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>İsim</td><td>${item.name}</td><td>${nameNew}</td></tr>
        <tr><td>Seri No</td><td>${item.productSerialNumber}</td><td>${serialNew}</td></tr>
        <tr><td>Link</td><td>${item.link}</td><td>${linkNew}</td></tr>
        <tr><td>Lokasyon</td><td>${item.location}</td><td>${locationNew}</td></tr>
      </tbody>
    </table>
  `;

  await createNotifications(
    updated.followerUsers,
    `<b>Takip ettiğiniz envanter öğesi güncellendi:</b> ${updated.name} - ${updated.productSerialNumber}<br><br>${changeTable}`,
    "info"
  );

  await createLog({
    userId: req.userId,
    action: "UPDATE_INVENTORY_INFO",
    details: `<b>Inventory bilgileri güncellendi:</b> ${updated.name} - ${updated.productSerialNumber}<br><br>${changeTable}`
  });

  res.json(updated);
};

// Lisans tarihlerini güncelleyen fonksiyon
const updateInventoryLicense = async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  const lisansStartDateNew = req.body.lisansStartDate;
  const lisansEndDateNew = req.body.lisansEndDate;
  const updated = await Inventory.findByIdAndUpdate(
    req.params.id,
    { lisansStartDate: lisansStartDateNew, lisansEndDate: lisansEndDateNew },
    { new: true }
  );

  const changeTable = `
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse; font-size:13px;">
      <thead>
        <tr>
          <th>Alan</th>
          <th>Eski Değer</th>
          <th>Yeni Değer</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Lisans Başlangıç</td>
          <td>${item.lisansStartDate ? new Date(item.lisansStartDate).toLocaleDateString("tr-TR") : ""}</td>
          <td>${lisansStartDateNew ? new Date(lisansStartDateNew).toLocaleDateString("tr-TR") : ""}</td>
        </tr>
        <tr>
          <td>Lisans Bitiş</td>
          <td>${item.lisansEndDate ? new Date(item.lisansEndDate).toLocaleDateString("tr-TR") : ""}</td>
          <td>${lisansEndDateNew ? new Date(lisansEndDateNew).toLocaleDateString("tr-TR") : ""}</td>
        </tr>
      </tbody>
    </table>
  `;

  await createNotifications(
    updated.followerUsers,
    `<b>Takip ettiğiniz envanterin lisans bilgileri güncellendi:</b> ${updated.name} - ${updated.productSerialNumber}<br><br>${changeTable}`,
    "info"
  );

  await createLog({
    userId: req.userId,
    action: "UPDATE_INVENTORY_LICENSE",
    details: `<b>Inventory lisans bilgileri güncellendi:</b> ${updated.name} - ${updated.productSerialNumber}<br><br>${changeTable}`
  });

  res.json(updated);
};

const deleteInventory = async (req, res) => {
  const userId = req.userId;
  const inventoryItem = await Inventory.findById(req.params.id);
  if (!inventoryItem) {
    return res.status(404).json({ success: false, message: "Inventory item not found" });
  }
  await Inventory.findByIdAndDelete(req.params.id);

  await createNotifications(
    inventoryItem.followerUsers,
    `Takip ettiğiniz envanter öğesi silindi: ${inventoryItem.name} - ${inventoryItem.productSerialNumber}`,
    "warning"
  );

  await createLog({
    userId: userId,
    action: "DELETE_INVENTORY",
    details: `Inventory silindi: ${inventoryItem.name} - ${inventoryItem.productSerialNumber}`
  });
  res.json({ success: true });

};

const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body)
    const status = req.body.status;
    console.log(status)

    // Inventory öğesini güncelle
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { status } , // güncellenecek alanlar
      { new: true, runValidators: true } // options: yeni versiyonu döndür ve validasyonları çalıştır
    );

    // Öğe bulunamadıysa hata döndür
    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Belirtilen ID ile inventory öğesi bulunamadı'
      });
    }
    await createNotifications(
      updatedItem.followerUsers,
      `Takip ettiğiniz envanter öğesinin durumu değişti: ${updatedItem.name} - Yeni Durum: ${status}`,
      "info"
    );

    await createLog({
      userId: req.userId,
      action: "CHANGE_INVENTORY_STATUS",
      details: `Inventory durumu değiştirildi: ${updatedItem.name} - Yeni Durum: ${status}`
    });
    // Başarılı yanıt döndür
    res.status(200).json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    // Hata durumunda hata mesajını döndür
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const followItem = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.userId;
    const inventoryItem = await Inventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }
    if (inventoryItem.followerUsers.includes(userId)) {
      return res.status(400).json({ success: false, message: "You are already following this item" });
    }
    inventoryItem.followerUsers.push(userId);
    await inventoryItem.save();
    res.json({ success: true, message: "You are now following this item" });
  } catch (error) {
    res.status(500).json({ success: false, message: "burası" });
  }
};

const unfollowItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const inventoryItem = await Inventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }
    if (!inventoryItem.followers.includes(userId)) {
      return res.status(400).json({ success: false, message: "You are not following this item" });
    }
    inventoryItem.followers = inventoryItem.followers.filter(followerId => followerId.toString() !== userId);
    await inventoryItem.save();
    res.json({ success: true, message: "You have unfollowed this item" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventories,
  addInventory,
  updateInventoryInfo,
  updateInventoryLicense,
  deleteInventory,
  changeStatus,
  followItem,
  unfollowItem
};
