const Build = require("../models/Build");
const CommunityPost = require("../models/Post");
const User = require("../models/User");
const buildService = require("../services/buildService");

exports.getNextComponents = async (req, res) => {
  try {
    const {
      selectedComponents,
      targetType,
      filters = {},
      sortBy = null,
    } = req.body;

    console.log("[DEBUG] getNextComponents request:", {
      targetType,
      filters,
      sortBy,
      selectedComponents: Object.keys(selectedComponents || {}),
    });

    if (!targetType || typeof selectedComponents !== "object") {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    const compatibleComponents = await buildService.getCompatibleComponents(
      selectedComponents,
      targetType,
      filters,
      sortBy
    );
    // In your getNextComponents controller, after finding compatibleComponents:
    const availableFilters = await buildService.getAvailableFilters(
      selectedComponents,
      targetType,
      filters
    );
    console.log(
      `[DEBUG] Found ${compatibleComponents.length} compatible ${targetType} components`
    );

    res.json({
      type: targetType,
      components: compatibleComponents,
      availableFilters,
    });
  } catch (err) {
    console.error("Error in getNextComponents:", err);
    res.status(500).json({
      message: err.message || "Failed to get compatible components",
      error: err.message,
    });
  }
};

exports.validateBuild = async (req, res) => {
  try {
    const { components } = req.body;
    if (!components || typeof components !== "object") {
      return res.status(400).json({ message: "Invalid components payload" });
    }

    const { valid, checks } = await buildService.checkCompatibility(components);

    res.json({
      valid,
      message: valid
        ? "Build is compatible!"
        : "Build has compatibility issues",
      checks,
    });
  } catch (err) {
    res.status(500).json({
      message: "Validation failed",
      error: err.message,
    });
  }
};

exports.createBuild = async (req, res) => {
  try {
    const { components } = req.body;
    console.log("Received components in createBuild:", components);
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!components || typeof components !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid components data" });
    }

    const { valid, checks } = await buildService.checkCompatibility(components);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Build is not compatible",
        checks,
      });
    }

    const newBuild = new Build({
      user: req.userId,
      components: components,
      title: "Unnamed Build",
      isShared: false,
    });

    await newBuild.save();

    // Populate all component references
    const populatedBuild = await Build.findById(newBuild._id)
      .populate("components.cpu")
      .populate("components.gpu")
      .populate("components.motherboard")
      .populate("components.memory")
      .populate("components.storage")
      .populate("components.psu")
      .populate("components.case")
      .populate("components.cooler"); // Make sure this matches your schema

    res.status(201).json({
      success: true,
      message: "Build created successfully",
      build: populatedBuild,
      nextStep: `/createbuild/${newBuild._id}/finalize`,
    });
  } catch (err) {
    console.error("Create build error:", err);
    res.status(500).json({
      //
      success: false,
      message: "Failed to create build",
      error: err.message,
    });
  }
};
exports.getBuildTotalPrice = async (req, res) => {
  try {
    const { buildId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const build = await Build.findById(buildId).populate([
      "components.cpu",
      "components.gpu",
      "components.motherboard",
      "components.memory",
      "components.storage",
      "components.psu",
      "components.case",
      "components.cooler",
    ]);

    if (!build) {
      return res
        .status(404)
        .json({ success: false, message: "Build not found" });
    }

    if (!build.user.equals(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this build",
      });
    }

    let totalPrice = 0;
    Object.values(build.components.toObject()).forEach((component) => {
      if (component && component.price) {
        totalPrice += component.price;
      }
    });

    build.totalPrice = totalPrice;
    await build.save();

    res.json({
      success: true,
      totalPrice: totalPrice,
      build: build,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate total price",
      error: err.message,
    });
  }
};

exports.finalizeBuild = async (req, res) => {
  try {
    const { buildId } = req.params;
    const { title, description, shareToCommunity } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await User.findById(req.userId);

    const build = await Build.findById(buildId);
    if (!build) {
      return res
        .status(404)
        .json({ success: false, message: "Build not found" });
    }

    if (!build.user.equals(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to modify this build",
      });
    }

    build.title = title || "Unnamed Build";
    build.description = description || "";
    build.isShared = shareToCommunity === true;

    await build.save();
    if (build.isShared) {
      const newPost = new CommunityPost({
        build: build._id,
        user: req.userId,
        title: build.title,
        description: build.description,
      });

      await newPost.save();
    }

    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { builds: buildId },
    });

    await build.save();
    const populatedBuild = await Build.findById(build._id)
      .populate("components.cpu")
      .populate("components.gpu")
      .populate("components.motherboard")
      .populate("components.memory")
      .populate("components.storage")
      .populate("components.psu")
      .populate("components.case")
      .populate("components.cooler");

    res.json({
      success: true,
      message: `Build ${build.isShared ? "shared" : "saved"} successfully`,
      build: populatedBuild,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to finalize build",
      error: err.message,
    });
  }
};

// GET /api/build/user/completed
// GET /api/build/user/completed
exports.getUserCompletedBuilds = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get the user's completed build IDs
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const buildIds = user.builds || [];

    // Fetch only builds in the user's builds array
    const builds = await Build.find({ _id: { $in: buildIds } })
      .populate([
        "components.cpu",
        "components.gpu",
        "components.motherboard",
        "components.memory",
        "components.storage",
        "components.psu",
        "components.case",
        "components.cooler",
      ])
      .sort({ updatedAt: -1 });

    res.json({ success: true, builds });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch completed builds",
      error: err.message,
    });
  }
};
