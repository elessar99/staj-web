
const Project = require("../models/Project");
const Site = require("../models/Site");
const Inventory = require("../models/Inventory");
const User = require("../models/User");
const { createLog } = require("./logController");


const getUnauthorizedProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kullanıcının yetkili olduğu proje ID'lerini bul
    const user = await User.findById(userId).select("permissions");
    const authorizedProjectIds = user.permissions.map(p => p.project.toString());

    // Yetkili olunmayan projeleri getir (sadece id ve name alanlarıyla)
    const unauthorizedProjects = await Project.find({
      _id: { $nin: authorizedProjectIds }
    })
    .select('_id name') // Sadece id ve name alanlarını getir
    .lean(); // Daha hızlı işlem için

    res.json(unauthorizedProjects);
  } catch (error) {
    console.error('Error in getUnauthorizedProjects:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAuthorizedProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Kullanıcının yetkili olduğu proje ID'lerini bul
    const user = await User.findById(userId).select("permissions");
    const authorizedProjectIds = user.permissions.map(p => p.project.toString());

    // Yetkili olunmayan projeleri getir (sadece id ve name alanlarıyla)
    const authorizedProjects = await Project.find({
      _id: authorizedProjectIds
    })
    .select('_id name') // Sadece id ve name alanlarını getir
    .lean(); // Daha hızlı işlem için

    res.json(authorizedProjects);
  } catch (error) {
    console.error('Error in getAuthorizedProjects:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projectList = await Project.find()
    res.json(projectList)
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const getProjects = async (req, res) => {
  try {
    const userId = req.userId;
    const isAdmin = req.isAdmin;

    let projects = [];

    if (isAdmin) {
      // Admin için tüm projeler
      projects = await Project.aggregate([
        {
          $lookup: {
            from: 'sites',
            localField: '_id',
            foreignField: 'projectId',
            as: 'sites'
          }
        },
        {
          $lookup: {
            from: 'inventories',
            localField: 'sites._id',
            foreignField: 'siteId',
            as: 'inventories'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            siteCount: { $size: '$sites' },
            totalInventoryCount: { $size: '$inventories' },
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]);
    } else {
      // Normal kullanıcı için
      const user = await User.findById(userId).select("permissions").populate('permissions.project');
      
      // Her proje için ayrı hesaplama
      for (const permission of user.permissions) {
        if (permission.project) {
          const project = await Project.aggregate([
            { $match: { _id: permission.project._id } },
            {
              $lookup: {
                from: 'sites',
                localField: '_id',
                foreignField: 'projectId',
                as: 'allSites'
              }
            },
            {
              $lookup: {
                from: 'inventories',
                localField: 'allSites._id',
                foreignField: 'siteId',
                as: 'allInventories'
              }
            },
            {
              $addFields: {
                authorizedSites: {
                  $filter: {
                    input: '$allSites',
                    as: 'site',
                    cond: { $in: ['$$site._id', permission.sites] }
                  }
                },
                authorizedInventories: {
                  $filter: {
                    input: '$allInventories',
                    as: 'inventory',
                    cond: { $in: ['$$inventory.siteId', permission.sites] }
                  }
                }
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                siteCount: { $size: '$authorizedSites' },
                totalInventoryCount: { $size: '$authorizedInventories' },
                createdAt: 1,
                updatedAt: 1
              }
            }
          ]);

          if (project.length > 0) {
            projects.push(project[0]);
          }
        }
      }
    }

    res.json(projects);
  } catch (error) {
    console.error('Error in getProjects:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const addProject = async (req, res) => {
  const project = new Project({ name: req.body.name });
  await project.save();
  await createLog({
    userId: req.userId, 
    action: "ADD_PROJECT", 
    details: `Proje eklendi: ${project._id} - ${project.name}`
  });
  res.json(project);
};

const deleteProject = async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = req.params.id;

    // 1. Projeye ait tüm siteleri bul
    const sites = await Site.find({ projectId });
    const siteIds = sites.map(site => site._id);

    // 2. Bu sitelere ait tüm envanterleri sil
    await Inventory.deleteMany({ siteId: { $in: siteIds } });

    // 3. Tüm siteleri sil
    await Site.deleteMany({ projectId });

    // 4. Projeyi sil
    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({ message: "Proje bulunamadı" });
    }

    await createLog({
      userId: userId,
      action: "DELETE_PROJECT",
      details: `Proje silindi: ${deletedProject._id} - ${deletedProject.name}`
    });

    res.json({
      message: "Proje, siteler ve envanterler silindi",
      deletedProject,
      deletedSitesCount: sites.length,
      deletedInventoriesCount: siteIds.length
    });

  } catch (error) {
    console.error("Hiyerarşik silme hatası:", error);
    res.status(500).json({ 
      message: "Silme işlemi başarısız",
      error: error.message 
    });
  }
};

// const deleteProject = async (req, res) => {
//   try {
//     const deletedProject = await Project.findByIdAndDelete(req.params.id);
//     if (!deletedProject) {
//       return res.status(404).json({ message: "Proje bulunamadı" });
//     }
//     res.json({ message: "Proje silindi", deletedProject });
//   } catch (error) {
//     res.status(500).json({ message: "Sunucu hatası", error: error.message });
//   }
// };

// Tüm fonksiyonları export edin
module.exports = { 
  getProjects, 
  addProject, 
  getAllProjects,
  deleteProject,
  getUnauthorizedProjects,
  getAuthorizedProjects 
};