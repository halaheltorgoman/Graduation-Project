const Build = require("../models/Build");
const User = require("../models/User");
//const Community = require("../models/Community");

// get all shared builds
exports.getSharedBuilds = async (req, res) => {
  try {
    const sharedBuilds = await Build.find({ isShared: true })
      .populate("userId", "username")
      .populate("components");
    res.json(sharedBuilds);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// save a shared buildto profile
exports.saveBuild = async (req, res) => {
  const { buildId } = req.body;

  try {
    const build = await Build.findById(buildId);
    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    // check if the build is shared
    if (!build.isShared) {
      return res.status(400).json({ message: "This build is not shared" });
    }
    if (build.userId.toString() === req.userId) {
      return res.status(400).json({ message: "You cannot save your own build" });
    }
    // add the build to saved builds
    const user = await User.findById(req.userId);
    if (user.savedBuilds.includes(buildId)) {
      return res.status(400).json({ message: "Build already saved" });
    }
    user.savedBuilds.push(buildId);
    await user.save();

    res.json({ message: "Build saved successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// rate 
exports.rateBuild = async (req, res) => {
  const { buildId } = req.params;
  const { rating } = req.body;

  try {
    const build = await Build.findById(buildId);
    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    // check if the build is shared
    if (!build.isShared) {
      return res.status(400).json({ message: "This build is not shared" });
    }

    if (build.userId.toString() === req.userId) {
      return res.status(400).json({ message: "You cannot rate your own build" });
    }
    
    // check if the user has already rated the build
    const existingRating = build.ratings.find((r) => r.userId.toString() === req.userId);
    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this build" });
    }

    // add the rating
    build.ratings.push({ userId: req.userId, rating });
    await build.save();

    res.json({ message: "Build rated successfully", build });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// add a comment to a shared build
exports.addComment = async (req, res) => {
  const { buildId } = req.params;
  const { text } = req.body;

  try {
    const build = await Build.findById(buildId);
    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    // check if the build is shared
    if (!build.isShared) {
      return res.status(400).json({ message: "This build is not shared" });
    }

    // add the comment
    build.comments.push({ userId: req.userId, text });
    await build.save();

    res.json({ message: "Comment added successfully", build });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};