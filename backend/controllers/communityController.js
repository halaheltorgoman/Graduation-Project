
const User = require('../models/User');
const Build = require('../models/Build');
const CPU = require('../models/Components/CPU');
const GPU = require('../models/Components/GPU');
const Motherboard = require('../models/Components/MotherBoard');
const Case = require('../models/Components/Case');
const Memory = require('../models/Components/Memory');
const Storage = require('../models/Components/Storage');
//const PSU = require('../models/Components/PSU');
const Cooler = require('../models/Components/Cooler');


const componentModels = {
  cpu: CPU,
  gpu: GPU,
  motherboard: Motherboard,
  memory: Memory,
  case:Case,
  storage: Storage,
  //psu: PSU,
  cooler: Cooler,

};
function getComponentModel(type) {
  const model = componentModels[type.toLowerCase()];
  if (!model) throw new Error('Invalid component type');
  return model;
}


exports.getSharedBuilds = async (req, res) => {
  try {
    const builds = await Build.find({ isShared: true })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    const populatedBuilds = await Promise.all(builds.map(async (build) => {
      const components = await Promise.all(build.components.map(async (comp) => {
        const Model = getComponentModel(comp.type);
        const component = await Model.findById(comp.componentId, 'title price imageUrl');
        return { ...comp.toObject(), details: component };
      }));
      return { ...build.toObject(), components };
    }));

    res.json(populatedBuilds);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch builds', error: err.message });
  }
};


exports.shareBuild = async (req, res) => {
  try {
    const build = await Build.findById(req.params.id);
    
    if (!build) return res.status(404).json({ message: 'Build not found' });
    if (build.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to share this build' });
    }

    build.isShared = !build.isShared;
    await build.save();
    
    res.json({ message: `Build ${build.isShared ? 'shared' : 'unshared'}` });
  } catch (err) {
    res.status(500).json({ message: 'Sharing failed', error: err.message });
  }
};

exports.getBuildDetails = async (req, res) => {
  try {
    const build = await Build.findById(req.params.id)
      .populate('user', 'username')
      .populate('comments.user', 'username');

    if (!build || !build.isShared) {
      return res.status(404).json({ message: 'Build not found or not shared' });
    }

    // Populate components dynamically
    const components = await Promise.all(build.components.map(async (comp) => {
      const Model = getComponentModel(comp.type);
      const component = await Model.findById(comp.componentId, 'name price imageUrl');
      return { ...comp.toObject(), details: component };
    }));

    res.json({ ...build.toObject(), components });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch build details', error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const build = await Build.findById(req.params.id);
    if (!build || !build.isShared) {
      return res.status(404).json({ message: 'Build not found or not shared' });
    }

    build.comments.push({
      user: req.userId,
      text: req.body.text
    });

    await build.save();
    res.json(build.comments);
  } catch (err) {
    res.status(500).json({ message: 'Comment failed', error: err.message });
  }
};
exports.addRating = async (req, res) => {
  try {
    const build = await Build.findById(req.params.id);
    if (!build || !build.isShared) {
      return res.status(404).json({ message: 'Build not found or not shared' });
    }

    const existingRating = build.ratings.find(r => r.user.toString() === req.userId);
    if (existingRating) {
      existingRating.value = req.body.rating;
    } else {
      build.ratings.push({ user: req.userId, value: req.body.rating });
    }

    build.averageRating = build.ratings.reduce((sum, r) => sum + r.value, 0) / build.ratings.length;

    await build.save();
    res.json(build.ratings);
  } catch (err) {
    res.status(500).json({ message: 'Rating failed', error: err.message });
  }
};

exports.saveBuild = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const build = await Build.findById(req.params.id);
    
    if (!build || !build.isShared) {
      return res.status(404).json({ message: 'Build not found or not shared' });
    }

    if (user.savedBuilds.includes(build._id)) {
      return res.status(400).json({ message: 'Build already saved' });
    }

    user.savedBuilds.push(build._id);
    await user.save();
    
    res.json({ message: 'Build saved', savedBuilds: user.savedBuilds });
  } catch (err) {
    res.status(500).json({ message: 'Save failed', error: err.message });
  }
};

