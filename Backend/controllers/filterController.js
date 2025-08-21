const Inventory = require("../models/Inventory");
const Site = require("../models/Site");
const Project = require("../models/Project");
const User = require("../models/User");


const allInventory = async (req, res) => {
  try {
    const userId = req.userId;
    const isAdmin = req.isAdmin;
    const user = await User.findById(userId).select("permissions");
    const permissions = user.permissions
    const siteList = permissions.flatMap(permission => permission.sites);
    const result = await Inventory.aggregate([
      {
        $lookup: {
          from: 'sites',
          localField: 'siteId',
          foreignField: '_id',
          as: 'site'
        }
      },
      { $unwind: { path: '$site', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'projects',
          localField: 'site.projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          link: 1,
          productSerialNumber: 1,
          siteId: '$site._id',
          siteName: '$site.name',
          projectId: '$project._id',
          projectName: '$project.name'
        }
      }
    ]);
    if (isAdmin) {
      res.json(result);
    }
    const clearResult = result.filter(item => 
      siteList.some(siteId => siteId.equals(item.siteId))
    );
    res.json(clearResult);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const allSite = async (req, res) => {
  try {
    const userId = req.userId;
    const isAdmin = req.isAdmin;
    const user = await User.findById(userId).select("permissions");
    const permissions = user.permissions
    const siteList = permissions.flatMap(permission => permission.sites);
    const result = await Site.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'siteId',
          as: 'inventories'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          projectName: '$project.name',
          projectId: '$project._id',
          inventoryCount: { $size: '$inventories' },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if(isAdmin){
      res.json(result);
    }
    const clearResult = result.filter(item => 
      siteList.some(siteId => siteId.equals(item._id))
    );
    res.json(clearResult);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  allInventory,
  allSite
};