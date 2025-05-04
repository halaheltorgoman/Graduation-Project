const Build = require('../models/Build');
const User = require('../models/User');

exports.getSharedBuilds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const builds = await Build.find({ isShared: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username')
      .populate('components.cpu components.gpu components.motherboard')
      .populate('ratings.user', 'username')
      .populate('comments.user', 'username');

    const total = await Build.countDocuments({ isShared: true });

    res.json({
      success: true,
      builds,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBuilds: total
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community builds',
      error: err.message
    });
  }
};


exports.addComment = async (req, res) => {
  try {
    const { buildId } = req.params;
    const { text } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const build = await Build.findById(buildId);
    if (!build || !build.isShared) {
      return res.status(404).json({ success: false, message: 'Build not found or not shared' });
    }

    build.comments.push({
      user: req.userId,
      text
    });

    await build.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: build.comments[build.comments.length - 1]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: err.message
    });
  }
};


exports.rateBuild = async (req, res) => {
  try {
    const { buildId } = req.params;
    const { value } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const build = await Build.findById(buildId);
    if (!build || !build.isShared) {
      return res.status(404).json({ success: false, message: 'Build not found or not shared' });
    }
    const existingRating = build.ratings.find(r => r.user.equals(req.userId));
    if (existingRating) {
      existingRating.value = value;
    } else {
      build.ratings.push({
        user: req.userId,
        value
      });
    }

    const sum = build.ratings.reduce((acc, curr) => acc + curr.value, 0);
    build.averageRating = sum / build.ratings.length;

    await build.save();

    res.json({
      success: true,
      message: 'Build rated successfully',
      averageRating: build.averageRating,
      userRating: value
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to rate build',
      error: err.message
    });
  }
};


exports.saveBuild = async (req, res) => {
  try {
    const { buildId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const build = await Build.findById(buildId);
    if (!build || !build.isShared) {
      return res.status(404).json({ success: false, message: 'Build not found or not shared' });
    }

    //add the build to my saved builds
    await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { savedBuilds: buildId } }
    );

    
    build.savesCount += 1;
    await build.save();

    res.json({
      success: true,
      message: 'Build saved to your profile'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to save build',
      error: err.message
    });
  }
};


exports.getSharedBuildDetails = async (req, res) => {
  try {
    const { buildId } = req.params;

    const build = await Build.findById(buildId)
      .populate('user', 'username')
      .populate('components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler')
      .populate('ratings.user', 'username')
      .populate('comments.user', 'username');

    if (!build || !build.isShared) {
      return res.status(404).json({ success: false, message: 'Build not found or not shared' });
    }
    let userRating = null;
    if (req.userId) {
      const rating = build.ratings.find(r => r.user._id.equals(req.userId));
      if (rating) userRating = rating.value;
    }

    res.json({
      success: true,
      build,
      userRating
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to get build details',
      error: err.message
    });
  }
};