const User = require("../models/User");

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
    user.permissions.push({
        project: req.body.projectId,
        sites: req.body.sites || [],
    });
    user.tokenVersion += 1;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Kullanıcıya proje eklenirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (addProjectToUser)." });
  }
}

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
    projectPermission.sites.push(...req.body.sites);
    user.tokenVersion += 1;
    await user.save();
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
    projectPermission.sites = projectPermission.sites.filter(s => !req.body.sites.includes(s.toString()));
    user.tokenVersion += 1;
    await user.save();
    res.json(user);
    } catch (err) {
    console.error("Kullanıcıdan siteler silinirken hata:", err);
    res.status(500).json({ error: "Sunucu hatası (removeSitesFromUser)." });
  }
}




module.exports = {deleteUser, getUsers, changeAuthority,
    addProjectToUser, removeProjectFromUser, 
    addSitesToUser, removeSitesFromUser,
  getNoneVerifiedUsers, userVerification};
