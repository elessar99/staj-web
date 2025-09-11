const Site = require("../models/Site");
const Project = require("../models/Project");
const Inventory = require("../models/Inventory");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const User = require("../models/User");
const {createLog} = require("./logController");

const getMissingSites = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query; // Query parametresinden userId alıyoruz

    // User'ın bu projedeki yetkilerini bul
    const user = await User.findById(userId).select("permissions");
    const userPermissions = user.permissions.find(p => p.project.toString() === projectId);

    let sites;

    if (userPermissions && userPermissions.sites.length > 0) {
      // User'ın yetkili olduğu siteleri hariç tut
      sites = await Site.find({
        projectId: projectId,
        _id: { $nin: userPermissions.sites }
      });
    } else {
      // User'ın bu projede hiç yetkisi yoksa tüm siteleri getir
      sites = await Site.find({ projectId: projectId });
    }

    res.json(sites);
  } catch (error) {
    console.error('Error in getAllSites:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const getIncludedSites = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    // User'ı ve permissions'larını bul
    const user = await User.findById(userId).select("permissions");
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Bu projeye ait permission'ı bul
    const userPermissions = user.permissions.find(p => 
      p.project && p.project.toString() === projectId
    );

    let sites;

    if (userPermissions && userPermissions.sites && userPermissions.sites.length > 0) {
      // Sadece user'ın yetkili olduğu siteleri getir
      sites = await Site.find({
        _id: { $in: userPermissions.sites },
        projectId: projectId
      });
    } else {
      // User'ın bu projede hiç yetkisi yoksa boş dizi döndür
      sites = [];
    }

    res.json(sites);
  } catch (error) {
    console.error('Error in getIncludedSites:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const getAllSites = async (req, res) => {
  try {
    const { projectId } = req.params
    const sites = await Site.find({projectId: projectId})
    res.json(sites)
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const getSites = async (req, res) => {
  try {
    const userId = req.userId;
    const isAdmin = req.isAdmin;

    const user = await User.findById(userId).select("permissions");
    const permissions = user.permissions
    const siteIdList = permissions.filter(permission => permission.project.toString() === req.params.projectId)
    const project = await Project.find({_id: req.params.projectId})
    const projectId = new ObjectId(req.params.projectId);
    const sites = await Site.aggregate([
      { 
        $match: { 
          projectId: projectId 
        } 
      },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'siteId',
          as: 'inventories'
        }
      },
      {
        $addFields: {
          inventoryCount: { $size: '$inventories' }
        }
      },
      {
        $project: {
          inventories: 0 // Envanter listesini gizle, sadece sayıyı göster
        }
      }
    ]);

    if (isAdmin) {
      const clearSites = sites.filter(site => !site.isSubSite);
      res.json({ clearSites, project });
      return;
    }
    else {
      const filteredSites = sites.filter(site => siteIdList.some(permission => permission.sites.includes(site._id)));
      const clearSites = filteredSites.filter(site => !site.isSubSite);
      return res.json({ sites: clearSites, project });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

const addSite = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, projectId } = req.body;

    // Gerekli alanların kontrolü
    if (!name || !projectId || !userId) {
      return res.status(400).json({ error: 'Name, projectId ve userId zorunludur' });
    }

    // Projenin var olup olmadığını kontrol et
    const projectExists = await Project.exists({ _id: projectId });
    if (!projectExists) {
      return res.status(400).json({ error: 'Belirtilen projectId bulunamadı' });
    }

    // Kullanıcıyı bul ve permissions'larını getir
    const user = await User.findById(userId).select("permissions isAdmin");
    
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Admin kullanıcılar tüm projelere site ekleyebilir
    if (user.isAdmin) {
      const site = new Site({
        name: name,
        projectId: projectId
      });
      await site.save();
      await createLog({
        userId: userId,
        action: "ADD_SITE",
        details: `Site eklendi: ${site._id} - ${site.name}`
      });
      return res.json(site);
    }

    // Kullanıcının bu projedeki yetkilerini kontrol et
    const projectPermission = user.permissions.find(p => 
      p.project && p.project.toString() === projectId
    );

    // Eğer kullanıcı bu projede yetkili değilse
    if (!projectPermission) {
      return res.status(403).json({ error: "Bu projeye site eklemek için yetkiniz bulunmamaktadır." });
    }

    // Yetkisi varsa site oluştur ve kaydet
    const site = new Site({
      name: name,
      projectId: projectId
    });
    
    console.log("Site eklendi:", site);
    await site.save();
    console.log("Site eklendi:", site);
    await createLog({
      userId: userId, 
      action: "ADD_SITE", 
      details: `Site eklendi: ${site._id} - ${site.name}`
    });
    res.json(site);
  } catch (error) {
    console.error('Error in addSite:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSubSite = async (req, res) => {
  try {
    const { parentSiteId, name} = req.body;
    const projectId = await Site.findById(parentSiteId).then(site => site ? site.projectId : null);
    if (!parentSiteId || !name || !projectId) {
      return res.status(400).json({ error: 'parentSiteId, name ve projectId zorunludur' });
    }

    const parentSite = await Site.findById(parentSiteId);
    if (!parentSite) {
      return res.status(404).json({ error: 'Belirtilen parentSiteId bulunamadı' });
    }
    
    if (!(parentSite.hasSubSite)) {
      parentSite.hasSubSite = true;
      await parentSite.save();
    }

    const subSite = new Site({
      name: name,
      projectId: projectId,
      topSite: parentSiteId,
      isSubSite: true
    });

    await subSite.save();
    await parentSite.save();
    res.json(subSite);
  } catch (error) {
    console.error('Error in createSubSite:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSubsites = async (req, res) => {
  try {
    const { siteId } = req.params;
    const userId = req.userId;
    const isAdmin = req.isAdmin;
    const subSites = await Site.find({ topSite: siteId });
    const projectName = await Project.findById(subSites[0]?.projectId).then(proj => proj ? proj.name : '');
    const inventoryCounts = await Inventory.aggregate([
      { $match: { siteId: { $in: subSites.map(site => site._id) } } },
      { $group: { _id: "$siteId", count: { $sum: 1 } } }
    ]);
    const subSitesWithCounts = subSites.map(site => {
      const inventoryCount = inventoryCounts.find(ic => ic._id.toString() === site._id.toString());
      return {
        ...site.toObject(),
        inventoryCount: inventoryCount ? inventoryCount.count : 0
      };
    });
    if(isAdmin) {
      return res.json({sites:subSitesWithCounts, projectName: projectName});
    }
    const userSiteList = await User.findById(userId).then(user => {
      if (!user) return [];
      return user.permissions.flatMap(p => (p.sites || []).map(id => id.toString()));
    });
    const filteredSubSites = subSitesWithCounts.filter(site => userSiteList.includes(site._id.toString()));
    
    res.json({sites:filteredSubSites, projectName: projectName});
  } catch (error) {
    console.error('Error in getSupsites:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteSite = async (req, res) => {
  try {
    const userId = req.userId;
    const siteId = req.params.id;

    // 1. Önce siteye ait tüm envanterleri sil
    await Inventory.deleteMany({ siteId: siteId });

    // 2. Sonra siteyi sil
    const deletedSite = await Site.findByIdAndDelete(siteId);

    if (!deletedSite) {
      return res.status(404).json({ message: "Site not found" });
    }

    await createLog({
      userId: userId, 
      action: "DELETE_SITE", 
      details: `Site silindi: ${deletedSite._id} - ${deletedSite.name}`
    });
    
    res.json({ 
      message: "Site and all its inventories deleted successfully",
      deletedSite
    });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      message: "Error deleting site and inventories",
      error: error.message 
    });
  }
};
module.exports = { getSites, addSite, deleteSite, getAllSites, getMissingSites, getIncludedSites, createSubSite, getSubsites };
