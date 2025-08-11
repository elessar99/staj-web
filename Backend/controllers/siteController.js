const Site = require("../models/Site");
const Project = require("../models/Project");
const Inventory = require("../models/Inventory");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const getSites = async (req, res) => {
  try {
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

    res.json({sites: sites, project: project});
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

const addSite = async (req, res) => {
  const projectExists = await Project.exists({ _id: req.body.projectId });
    
    if (!projectExists) {
      return res.status(400).json({ error: 'Belirtilen projectId bulunamadı' });
    }
  const site = new Site({
    name: req.body.name,
    projectId: req.body.projectId
  });
  await site.save();
  res.json(site);
};

const deleteSite = async (req, res) => {
  try {
    const siteId = req.params.id;

    // 1. Önce siteye ait tüm envanterleri sil
    await Inventory.deleteMany({ siteId: siteId });

    // 2. Sonra siteyi sil
    const deletedSite = await Site.findByIdAndDelete(siteId);

    if (!deletedSite) {
      return res.status(404).json({ message: "Site not found" });
    }

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
module.exports = { getSites, addSite, deleteSite };
