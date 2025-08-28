const Inventory = require("../models/Inventory");
const User = require("../models/User");
const Site = require("../models/Site");
const {createLog} = require("./logController");

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
    const { siteId, device, name, link, productSerialNumber, location } = req.body;

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

const updateInventory = async (req, res) => {
  const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await createLog({
    userId: req.userId,
    action: "UPDATE_INVENTORY",
    details: `Inventory güncellendi: ${updated.name} - ${updated.productSerialNumber}`
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

module.exports = {
  getInventories,
  addInventory,
  updateInventory,
  deleteInventory,
  changeStatus,
};
