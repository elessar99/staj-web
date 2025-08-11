const mongoose = require("mongoose");
const Project = require("../models/Project");
const Site = require("../models/Site");
const Inventory = require("../models/Inventory");


const getProjects = async (req, res) => {
  try {
    const projects = await Project.aggregate([
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

    res.json(projects);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const addProject = async (req, res) => {
  const project = new Project({ name: req.body.name });
  await project.save();
  res.json(project);
};

const deleteProject = async (req, res) => {
  try {
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
  deleteProject 
};