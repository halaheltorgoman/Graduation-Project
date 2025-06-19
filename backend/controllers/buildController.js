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
    const { components, title, description } = req.body; // Added description
    console.log("Received components in createBuild:", components);

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!components || typeof components !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid components data" });
    }

    // Validate title if provided
    if (title && typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "Title must be a string",
      });
    }

    // Validate description if provided
    if (description && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    // Clean and format title
    const cleanTitle = title
      ? title.trim().substring(0, 100)
      : `My Build ${new Date().toLocaleDateString()}`;

    // Clean and format description
    const cleanDescription = description
      ? description.trim().substring(0, 1000) // Limit description length
      : null;

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
      title: cleanTitle,
      description: cleanDescription, // Add description
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
      .populate("components.cooler");

    res.status(201).json({
      success: true,
      message: "Build created successfully",
      build: populatedBuild,
      nextStep: `/createbuild/${newBuild._id}/finalize`,
    });
  } catch (err) {
    console.error("Create build error:", err);
    res.status(500).json({
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

exports.getBuildForReconfigure = async (req, res) => {
  try {
    const { buildId } = req.params;
    const { componentType } = req.query;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!componentType) {
      return res.status(400).json({
        success: false,
        message: "Component type is required",
      });
    }

    // Validate component type
    const validTypes = [
      "cpu",
      "gpu",
      "motherboard",
      "case",
      "cooler",
      "memory",
      "storage",
      "psu",
    ];
    if (!validTypes.includes(componentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid component type",
      });
    }

    // Find the build
    const build = await Build.findById(buildId).populate([
      "components.cpu",
      "components.gpu",
      "components.motherboard",
      "components.memory",
      "components.storage",
      "components.psu",
      "components.case",
      "components.cooler",
      "title",
    ]);

    if (!build) {
      return res.status(404).json({
        success: false,
        message: "Build not found",
      });
    }

    // Check if user owns the build
    if (!build.user.equals(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this build",
      });
    }

    // Extract component IDs for the build service
    const componentIds = {};
    Object.keys(build.components.toObject()).forEach((key) => {
      if (build.components[key] && build.components[key]._id) {
        componentIds[key] = build.components[key]._id.toString();
      }
    });

    res.json({
      success: true,
      build: build,
      selectedComponents: componentIds,
      targetComponent: componentType,
    });
  } catch (err) {
    console.error("Get build for reconfigure error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get build for reconfiguration",
      error: err.message,
    });
  }
};
exports.updateBuildComponent = async (req, res) => {
  try {
    const { buildId } = req.params;
    const { componentType, componentId } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!componentType || !componentId) {
      return res.status(400).json({
        success: false,
        message: "Component type and ID are required",
      });
    }

    // Validate component type
    const validTypes = [
      "cpu",
      "gpu",
      "motherboard",
      "case",
      "cooler",
      "memory",
      "storage",
      "psu",
    ];
    if (!validTypes.includes(componentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid component type",
      });
    }

    // Find the build
    const build = await Build.findById(buildId);
    if (!build) {
      return res.status(404).json({
        success: false,
        message: "Build not found",
      });
    }

    // Check if user owns the build
    if (!build.user.equals(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to modify this build",
      });
    }

    // Create updated components object for compatibility check
    const updatedComponents = {
      ...build.components.toObject(),
      [componentType]: componentId,
    };

    // Convert ObjectIds to strings for compatibility check
    const componentIds = {};
    Object.keys(updatedComponents).forEach((key) => {
      if (updatedComponents[key]) {
        componentIds[key] = updatedComponents[key].toString();
      }
    });

    // Validate compatibility of the updated build
    const { valid, checks } = await buildService.checkCompatibility(
      componentIds
    );
    if (!valid) {
      return res.status(400).json({
        success: false,
        message:
          "The selected component is not compatible with your current build",
        compatibilityIssues: checks,
      });
    }

    // Update the component directly in the existing build
    build.components[componentType] = componentId;
    build.updatedAt = new Date();
    await build.save();

    // Get the populated build with updated component
    const populatedBuild = await Build.findById(buildId).populate([
      "components.cpu",
      "components.gpu",
      "components.motherboard",
      "components.memory",
      "components.storage",
      "components.psu",
      "components.case",
      "components.cooler",
    ]);

    // Recalculate total price
    let totalPrice = 0;
    Object.values(populatedBuild.components.toObject()).forEach((component) => {
      if (component && component.price) {
        totalPrice += component.price;
      }
    });

    populatedBuild.totalPrice = totalPrice;
    await populatedBuild.save();

    res.json({
      success: true,
      message: `${componentType.toUpperCase()} updated successfully`,
      build: populatedBuild,
    });
  } catch (err) {
    console.error("Update build component error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update component",
      error: err.message,
    });
  }
};

exports.getBuildDetails = async (req, res) => {
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
      "title",
    ]);

    if (!build) {
      return res.status(404).json({
        success: false,
        message: "Build not found",
      });
    }

    // Check if user owns the build or if it's shared
    if (!build.user.equals(req.userId) && !build.isShared) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this build",
      });
    }

    // Calculate total price if not already calculated
    if (!build.totalPrice) {
      let totalPrice = 0;
      Object.values(build.components.toObject()).forEach((component) => {
        if (component && component.price) {
          totalPrice += component.price;
        }
      });
      build.totalPrice = totalPrice;
      await build.save();
    }

    res.json({
      success: true,
      build: build,
    });
  } catch (err) {
    console.error("Get build details error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get build details",
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

    const build = await Build.findById(buildId);
    if (!build) {
      return res.status(404).json({
        success: false,
        message: "Build not found",
      });
    }

    if (!build.user.equals(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to modify this build",
      });
    }

    // Update the existing build
    if (title) build.title = title;
    if (description !== undefined) build.description = description;
    if (shareToCommunity !== undefined)
      build.isShared = shareToCommunity === true;

    await build.save();

    // Handle community sharing
    if (build.isShared) {
      // Check if post already exists for this build
      const existingPost = await CommunityPost.findOne({ build: build._id });

      if (!existingPost) {
        const newPost = new CommunityPost({
          build: build._id,
          user: req.userId,
          title: build.title,
          description: build.description,
        });
        await newPost.save();
      } else {
        // Update existing post
        existingPost.title = build.title;
        existingPost.description = build.description;
        await existingPost.save();
      }
    }

    // Ensure build is in user's builds array
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { builds: buildId },
    });

    const populatedBuild = await Build.findById(build._id).populate([
      "components.cpu",
      "components.gpu",
      "components.motherboard",
      "components.memory",
      "components.storage",
      "components.psu",
      "components.case",
      "components.cooler",
    ]);

    res.json({
      success: true,
      message: `Build ${
        build.isShared ? "updated and shared" : "updated"
      } successfully`,
      build: populatedBuild,
    });
  } catch (err) {
    console.error("Finalize build error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to finalize build",
      error: err.message,
    });
  }
};
