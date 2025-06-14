const Build = require("../models/Build");
const Guide = require("../models/Guide");
const User = require("../models/User");

exports.getGuidesByCategory = async (req, res) => {
  try {
    console.log("=== GET GUIDES BY CATEGORY START ===");
    const { category } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "newest",
      minRating = 0,
      maxPrice,
      genre,
    } = req.query;

    console.log("Request received:", {
      category,
      query: req.query,
      params: req.params,
      url: req.originalUrl,
    });

    // Validate category parameter
    if (!category || category.trim() === "") {
      console.log("Invalid category provided");
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const skip = (page - 1) * limit;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "rating":
        sort = { averageRating: -1, createdAt: -1 };
        break;
      case "saves":
        sort = { savesCount: -1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Build filter object
    const filter = {
      category: category,
      status: "Published",
      isApproved: true,
    };

    if (minRating > 0) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    if (genre && genre.trim() !== "") {
      filter.genre = { $regex: new RegExp(`^${genre}$`, "i") };
    }

    console.log("Query filter:", JSON.stringify(filter, null, 2));
    console.log("Query sort:", JSON.stringify(sort, null, 2));
    console.log("Query pagination:", { skip, limit: parsedLimit });

    // Get total count for pagination
    const totalCount = await Guide.countDocuments(filter);
    console.log("Total matching guides:", totalCount);

    if (totalCount === 0) {
      console.log("No guides found, returning empty result");
      return res.json({
        success: true,
        guides: [],
        hasMore: false,
        pagination: {
          currentPage: parsedPage,
          totalPages: 0,
          totalGuides: 0,
          hasMore: false,
        },
      });
    }

    console.log("Fetching guides from database...");
    const guides = await Guide.find(filter)
      .skip(skip)
      .limit(parsedLimit)
      .sort(sort)
      .populate("creator", "username avatar")
      .populate({
        path: "ratings.user",
        select: "username avatar",
      })
      .populate({
        path: "build",
        populate: {
          path: "components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler",
          select: "title image_source price manufacturer brand",
        },
      })
      .lean()
      .exec();

    console.log(`Retrieved ${guides.length} guides from database`);

    if (guides.length === 0) {
      console.log("Query returned no results");
      return res.json({
        success: true,
        guides: [],
        hasMore: false,
        pagination: {
          currentPage: parsedPage,
          totalPages: Math.ceil(totalCount / parsedLimit),
          totalGuides: totalCount,
          hasMore: false,
        },
      });
    }

    // Process guides and calculate prices
    console.log("Processing guides...");
    let userId = req.userId ? req.userId.toString() : null;

    // Get user's saved guides if authenticated
    let savedGuideIds = [];
    if (userId) {
      try {
        const user = await User.findById(userId).select("savedGuides");
        savedGuideIds = user ? user.savedGuides.map((id) => id.toString()) : [];
      } catch (userErr) {
        console.warn("Could not fetch user saved guides:", userErr.message);
      }
    }

    const processedGuides = guides
      .map((guide, index) => {
        try {
          console.log(`Processing guide ${index + 1}: ${guide.title}`);

          // Calculate total price
          let totalPrice = 0;
          if (guide.build && guide.build.components) {
            Object.values(guide.build.components).forEach((component) => {
              if (component && typeof component.price === "number") {
                totalPrice += component.price;
              }
            });
          }

          // Apply price filter if specified
          if (maxPrice && totalPrice > parseFloat(maxPrice)) {
            console.log(
              `Guide filtered out by price: $${totalPrice} > $${maxPrice}`
            );
            return null;
          }

          // Build processed guide object
          const processedGuide = {
            _id: guide._id,
            title: guide.title,
            description: guide.description,
            category: guide.category,
            genre: guide.genre,
            tags: guide.tags || [],
            difficulty: guide.difficulty,
            estimatedBuildTime: guide.estimatedBuildTime,
            performance: guide.performance || {},
            averageRating: guide.averageRating || 0,
            totalRatings: guide.ratings ? guide.ratings.length : 0,
            savesCount: guide.savesCount || 0,
            viewCount: guide.viewCount || 0,
            status: guide.status,
            isFeatured: guide.isFeatured || false,
            createdAt: guide.createdAt,
            updatedAt: guide.updatedAt,
            creator: guide.creator,
            build: guide.build,
            ratings: guide.ratings || [],
            totalPrice,
            isSaved: savedGuideIds.includes(guide._id.toString()),
            userRating:
              userId && guide.ratings
                ? guide.ratings.find(
                    (r) => r.user && r.user.toString() === userId
                  )?.value || null
                : null,
          };

          return processedGuide;
        } catch (processErr) {
          console.error(`Error processing guide ${index + 1}:`, processErr);
          return null;
        }
      })
      .filter(Boolean); // Remove null entries

    console.log(`Final processed guides count: ${processedGuides.length}`);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / parsedLimit);
    const hasMore = parsedPage < totalPages;

    const response = {
      success: true,
      guides: processedGuides,
      hasMore,
      pagination: {
        currentPage: parsedPage,
        totalPages,
        totalGuides: totalCount,
        hasMore,
      },
    };

    console.log("=== RESPONSE SUMMARY ===");
    console.log("Success:", response.success);
    console.log("Guides count:", response.guides.length);
    console.log("Has more:", response.hasMore);
    console.log("Pagination:", response.pagination);

    // Log first guide structure for debugging
    if (response.guides.length > 0) {
      console.log("First guide keys:", Object.keys(response.guides[0]));
      console.log("First guide build present:", !!response.guides[0].build);
      console.log("First guide creator present:", !!response.guides[0].creator);
    }

    console.log("=== END GET GUIDES BY CATEGORY ===");

    res.json(response);
  } catch (err) {
    console.error("=== CONTROLLER ERROR ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("=== END CONTROLLER ERROR ===");

    res.status(500).json({
      success: false,
      message: "Internal server error while fetching guides",
      error:
        process.env.NODE_ENV === "development" ? err.message : "Server error",
    });
  }
};

exports.convertToGuide = async (req, res) => {
  try {
    console.log("=== Convert to Guide Debug ===");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);
    console.log("User ID:", req.userId);

    const { buildId } = req.params;
    const {
      title,
      description,
      genre,
      category,
      tags,
      difficulty,
      estimatedBuildTime,
      performance,
    } = req.body;

    console.log("Extracted data:", {
      buildId,
      title,
      description,
      genre,
      category,
    });

    // Validate required fields
    if (!title || !description || !genre || !category) {
      console.log("Validation failed - missing required fields");
      return res.status(400).json({
        success: false,
        message: "Title, description, genre, and category are required",
      });
    }

    console.log("Looking for build with ID:", buildId);
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

    console.log("Build found:", !!build);

    if (!build) {
      console.log("Build not found");
      return res.status(404).json({
        success: false,
        message: "Build not found",
      });
    }

    console.log("Build components:", Object.keys(build.components || {}));

    // Check if build has all required components
    const requiredComponents = [
      "cpu",
      "gpu",
      "motherboard",
      "memory",
      "storage",
      "psu",
      "case",
    ];

    const missingComponents = requiredComponents.filter(
      (comp) => !build.components || !build.components[comp]
    );

    console.log("Missing components:", missingComponents);

    if (missingComponents.length > 0) {
      console.log("Build incomplete, missing components:", missingComponents);
      return res.status(400).json({
        success: false,
        message: `Build is incomplete. Missing: ${missingComponents.join(
          ", "
        )}`,
      });
    }

    // Check if guide already exists for this build
    console.log("Checking for existing guide...");
    const existingGuide = await Guide.findOne({ build: buildId });
    console.log("Existing guide found:", !!existingGuide);

    if (existingGuide) {
      console.log("Guide already exists for this build");
      return res.status(400).json({
        success: false,
        message: "A guide already exists for this build",
      });
    }

    // Create new guide
    console.log("Creating new guide...");
    const guideData = {
      build: buildId,
      creator: req.userId,
      title,
      description,
      category,
      genre,
      tags: tags || [],
      difficulty: difficulty || "Intermediate",
      estimatedBuildTime: estimatedBuildTime || "2-4 hours",
      performance: performance || {},
      status: "Published",
      isApproved: true,
      viewCount: 0,
      savesCount: 0,
      ratings: [],
      averageRating: 0,
    };

    console.log("Guide data:", guideData);

    const guide = new Guide(guideData);
    console.log("Guide instance created");

    await guide.save();
    console.log("Guide saved to database");

    // Populate the guide with build and component data
    console.log("Populating guide data...");
    await guide.populate([
      {
        path: "build",
        populate: {
          path: "components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler",
          select: "title image_source price manufacturer brand",
        },
      },
      {
        path: "creator",
        select: "username avatar",
      },
    ]);

    console.log("Guide populated successfully");
    console.log("Populated guide build:", guide.build ? "Present" : "Missing");
    console.log(
      "Populated guide creator:",
      guide.creator ? "Present" : "Missing"
    );

    if (guide.build && guide.build.components) {
      console.log(
        "Populated build components:",
        Object.keys(guide.build.components)
      );
      Object.keys(guide.build.components).forEach((key) => {
        const component = guide.build.components[key];
        console.log(
          `${key}:`,
          component
            ? {
                id: component._id,
                title: component.title,
                price: component.price,
              }
            : "null"
        );
      });
    }

    res.json({
      success: true,
      message: "Guide created successfully",
      guide,
    });

    console.log("=== Convert to Guide Success ===");
  } catch (err) {
    console.error("=== Convert to Guide Error ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Error details:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create guide",
      error: err.message,
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create guides",
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to verify admin status",
      error: err.message,
    });
  }
};

exports.getGenres = async (req, res) => {
  try {
    const genres = await Guide.distinct("genre", {
      status: "Published",
      isApproved: true,
    });
    res.json({
      success: true,
      genres: genres.filter((genre) => genre),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch genres",
      error: err.message,
    });
  }
};

exports.toggleSaveGuide = async (req, res) => {
  try {
    const { guideId } = req.params;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Find the guide - don't modify it, just find by ID
    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    // Find the user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if guide is already saved by this user
    const isCurrentlySaved = user.savedGuides.includes(guideId);
    let newSaveStatus;

    if (isCurrentlySaved) {
      // Remove from user's saved guides
      user.savedGuides.pull(guideId);
      // Decrease guide's save count
      guide.savesCount = Math.max(0, (guide.savesCount || 0) - 1);
      newSaveStatus = false;
    } else {
      // Add to user's saved guides
      user.savedGuides.addToSet(guideId);
      // Increase guide's save count
      guide.savesCount = (guide.savesCount || 0) + 1;
      newSaveStatus = true;
    }

    // Save user first, then guide with validation skip if needed
    await user.save();

    // Update guide without triggering validation on category field
    await Guide.findByIdAndUpdate(
      guideId,
      { savesCount: guide.savesCount },
      { runValidators: false } // Skip validation to avoid enum error
    );

    res.json({
      success: true,
      message: `Guide ${newSaveStatus ? "saved" : "unsaved"} successfully`,
      isSaved: newSaveStatus,
      savesCount: guide.savesCount,
    });
  } catch (err) {
    console.error("Toggle save error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to toggle save status",
      error: err.message,
    });
  }
};

exports.getSavedGuides = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.userId).select("savedGuides");

    const [guides, totalCount] = await Promise.all([
      Guide.find({
        _id: { $in: user.savedGuides },
        status: "Published",
        isApproved: true,
      })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .populate("creator", "username avatar")
        .populate({
          path: "build",
          populate: {
            path: "components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler",
            select: "title image_source price manufacturer brand",
          },
        }),
      Guide.countDocuments({
        _id: { $in: user.savedGuides },
        status: "Published",
        isApproved: true,
      }),
    ]);

    const guidesWithPrices = guides.map((guide) => {
      let totalPrice = 0;
      if (guide.build && guide.build.components) {
        Object.values(guide.build.components.toObject()).forEach(
          (component) => {
            if (component && component.price) {
              totalPrice += component.price;
            }
          }
        );
      }
      return {
        ...guide.toObject(),
        totalPrice,
        isSaved: true,
      };
    });

    res.json({
      success: true,
      guides: guidesWithPrices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalGuides: totalCount,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved guides",
      error: err.message,
    });
  }
};

exports.getGuideById = async (req, res) => {
  try {
    const { guideId } = req.params;

    const guide = await Guide.findById(guideId)
      .populate("creator", "username avatar")
      .populate({
        path: "ratings.user",
        select: "username avatar",
      })
      .populate({
        path: "build",
        populate: {
          path: "components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler",
          select: "title image_source price manufacturer brand",
        },
      });

    if (!guide || guide.status !== "Published" || !guide.isApproved) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    guide.viewCount += 1;
    await guide.save();

    let totalPrice = 0;
    if (guide.build && guide.build.components) {
      Object.values(guide.build.components.toObject()).forEach((component) => {
        if (component && component.price) {
          totalPrice += component.price;
        }
      });
    }

    let isSaved = false;
    let userRating = null;
    if (req.userId) {
      const user = await User.findById(req.userId).select("savedGuides");
      isSaved = user.savedGuides.includes(guideId);
      userRating =
        guide.ratings.find((r) => r.user.toString() === req.userId.toString())
          ?.value || null;
    }

    res.json({
      success: true,
      guide: {
        ...guide.toObject(),
        totalPrice,
        isSaved,
        userRating,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch guide",
      error: err.message,
    });
  }
};
exports.rateGuide = async (req, res) => {
  try {
    const { guideId } = req.params;
    const { value, review } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (value < 1 || value > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const guide = await Guide.findById(guideId);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found",
      });
    }

    guide.addRating(req.userId, value, review);
    await guide.save();

    res.json({
      success: true,
      message: "Guide rated successfully",
      averageRating: guide.averageRating,
      userRating: value,
      totalRatings: guide.ratings.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to rate guide",
      error: err.message,
    });
  }
};
