const User = require("../models/User");
const CPU = require("../models/Components/CPU");
const GPU = require("../models/Components/GPU");
const Motherboard = require("../models/Components/MotherBoard");
const Case = require("../models/Components/Case");
const Memory = require("../models/Components/Memory");
const Storage = require("../models/Components/Storage");
const PSU = require("../models/Components/PSU");
const Cooler = require("../models/Components/Cooler");

const componentModels = {
  cpu: CPU,
  gpu: GPU,
  motherboard: Motherboard,
  memory: Memory,
  case: Case,
  storage: Storage,
  psu: PSU,
  cooler: Cooler,
};
function getComponentModel(type) {
  const model = componentModels[type.toLowerCase()];
  if (!model) throw new Error("Invalid component type");
  return model;
}

exports.getMaxPriceForComponentType = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = getComponentModel(type);

    const result = await Model.findOne().sort({ price: -1 }).limit(1);
    const rawMaxPrice = result?.price || 1000;

    // Round up to the next 50 or 100
    const roundedMaxPrice = Math.ceil(rawMaxPrice / 50) * 50;
    res.json({ maxPrice: roundedMaxPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch max price" });
  }
};

exports.getComponentsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const queryParams = req.query;
    console.log("Received API request with params:", queryParams);

    // Pagination parameters
    const page = parseInt(queryParams.page) || 1;
    const pageSize = parseInt(queryParams.pageSize) || 15;
    const skip = (page - 1) * pageSize;

    // Build base filter
    const filter = {};

    // Always filter by category if not 'all'
    if (type.toLowerCase() !== "all") {
      filter.category = type.toLowerCase();
    }

    // Price and rating filters
    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.price = {};
      if (queryParams.minPrice)
        filter.price.$gte = parseFloat(queryParams.minPrice);
      if (queryParams.maxPrice)
        filter.price.$lte = parseFloat(queryParams.maxPrice);
    }

    if (queryParams.minRating || queryParams.maxRating) {
      filter.rating = {};
      if (queryParams.minRating)
        filter.rating.$gte = parseFloat(queryParams.minRating);
      if (queryParams.maxRating)
        filter.rating.$lte = parseFloat(queryParams.maxRating);
    }

    if (queryParams.manufacturer) {
      filter.manfacturer = {
        // Note the spelling matches your DB
        $in: Array.isArray(queryParams.manufacturer)
          ? queryParams.manufacturer.map((m) => new RegExp(m, "i"))
          : [new RegExp(queryParams.manufacturer, "i")],
      };
    }
    if (queryParams.brand) {
      filter.brand = {
        // Note the spelling matches your DB
        $in: Array.isArray(queryParams.brand)
          ? queryParams.brand
          : [queryParams.brand],
      };
    }

    // Component-specific filters
    const componentType = type.toLowerCase();
    if (componentType === "cpu") {
      if (queryParams.socket) {
        filter.socket = {
          $in: Array.isArray(queryParams.socket)
            ? queryParams.socket
            : [queryParams.socket],
        };
      }
      if (queryParams.cores) {
        filter.cores = {
          $in: Array.isArray(queryParams.cores)
            ? queryParams.cores.map((c) => parseInt(c))
            : [parseInt(queryParams.cores)],
        };
      }
      if (queryParams.threads) {
        filter.threads = {
          $in: Array.isArray(queryParams.threads)
            ? queryParams.threads.map((t) => parseInt(t))
            : [parseInt(queryParams.threads)],
        };
      }
    } else if (componentType === "gpu") {
      if (queryParams.memorySize) {
        filter.RAM_size = {
          $in: Array.isArray(queryParams.memorySize)
            ? queryParams.memorySize.map(
                (size) => new RegExp(`^${size}\\s*GB`, "i")
              )
            : [new RegExp(`^${queryParams.memorySize}\\s*GB`, "i")],
        };
      }
      if (queryParams.memoryType) {
        filter.Graphics_RAM_Type = {
          $in: Array.isArray(queryParams.memoryType)
            ? queryParams.memoryType.map((type) => new RegExp(type, "i"))
            : [new RegExp(queryParams.memoryType, "i")],
        };
      }
      if (queryParams.brand) {
        filter.brand = {
          $in: Array.isArray(queryParams.brand)
            ? queryParams.brand.map((b) => new RegExp(b, "i"))
            : [new RegExp(queryParams.brand, "i")],
        };
      }
    } else if (componentType === "motherboard") {
      if (queryParams.MB_socket) {
        filter.MB_socket = {
          $in: Array.isArray(queryParams.MB_socket)
            ? queryParams.MB_socket
            : [queryParams.MB_socket],
        };
      }
      if (queryParams.supported_memory) {
        filter.supported_memory = {
          $in: Array.isArray(queryParams.supported_memory)
            ? queryParams.supported_memory
            : [queryParams.supported_memory],
        };
      }
      if (queryParams.MB_form) {
        filter.MB_form = {
          $in: Array.isArray(queryParams.MB_form)
            ? queryParams.MB_form
            : [queryParams.MB_form],
        };
      }
    } else if (componentType === "case") {
      if (queryParams.case_type) {
        filter.case_type = {
          $in: Array.isArray(queryParams.case_type)
            ? queryParams.case_type
            : [queryParams.case_type],
        };
      }
      if (queryParams.color) {
        filter.color = {
          $in: Array.isArray(queryParams.color)
            ? queryParams.color
            : [queryParams.color],
        };
      }
    } else if (componentType === "cooler") {
      if (queryParams.cooling_method) {
        filter.cooling_method = {
          $in: Array.isArray(queryParams.cooling_method)
            ? queryParams.cooling_method
            : [queryParams.cooling_method],
        };
      }
    } else if (componentType === "memory") {
      if (queryParams.DDR_generation) {
        filter.DDR_generation = {
          $in: Array.isArray(queryParams.DDR_generation)
            ? queryParams.DDR_generation
            : [queryParams.DDR_generation],
        };
      }
      if (queryParams.memory_size) {
        filter.memory_size = {
          $in: Array.isArray(queryParams.memory_size)
            ? queryParams.memory_size
            : [queryParams.memory_size],
        };
      }
    }
    if (componentType === "storage") {
      if (queryParams.size) {
        filter.size = {
          $in: Array.isArray(queryParams.size)
            ? queryParams.size
            : [queryParams.size],
        };
      }
      if (queryParams.storage_type) {
        filter.storage_type = {
          $in: Array.isArray(queryParams.storage_type)
            ? queryParams.storage_type
            : [queryParams.storage_type],
        };
      }
    }

    console.log("Final filter object:", JSON.stringify(filter, null, 2));

    let components = [];
    let totalCount = 0;

    if (componentType === "all") {
      // For 'all' type, handle cross-collection queries
      const countPromises = Object.keys(componentModels).map(async (key) => {
        return await componentModels[key].countDocuments(filter);
      });
      const counts = await Promise.all(countPromises);
      totalCount = counts.reduce((sum, count) => sum + count, 0);

      // Get components from all collections
      const dataPromises = Object.keys(componentModels).map(async (key) => {
        let query = componentModels[key].find(filter);

        // Apply sorting if specified
        if (queryParams.sortBy) {
          const [field, order] = queryParams.sortBy.split(":");
          const sortOrder = order === "desc" ? -1 : 1;
          query = query.sort({ [field]: sortOrder });
        }

        return await query.exec();
      });

      const results = await Promise.all(dataPromises);
      let allComponents = results.flat();

      // Sort the combined results if needed
      if (queryParams.sortBy) {
        const [field, order] = queryParams.sortBy.split(":");
        allComponents.sort((a, b) => {
          const aVal = a[field] || 0;
          const bVal = b[field] || 0;
          return order === "desc" ? bVal - aVal : aVal - bVal;
        });
      }

      // Apply pagination AFTER sorting and combining
      components = allComponents.slice(skip, skip + pageSize);

      // Update totalCount based on actual filtered results
      totalCount = allComponents.length;
    } else {
      // Fetch from a specific component type
      const Model = getComponentModel(componentType);
      if (!Model) {
        return res.status(400).json({ message: "Invalid component type" });
      }

      // Get total count for pagination
      totalCount = await Model.countDocuments(filter);

      // Build the query
      let query = Model.find(filter);

      // Apply sorting if specified
      if (queryParams.sortBy) {
        const [field, order] = queryParams.sortBy.split(":");
        const sortOrder = order === "desc" ? -1 : 1;
        query = query.sort({ [field]: sortOrder });
      }

      // Apply pagination
      components = await query.skip(skip).limit(pageSize);
    }

    console.log(
      `Returning ${components.length} components out of ${totalCount} total`
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);

    // Return paginated response with metadata
    res.json({
      components,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Error in getComponentsByType:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.addToFavorites = async (req, res) => {
  try {
    const { componentId, componentType } = req.body;
    if (!componentId || !componentType) {
      return res.status(400).json({
        message: "Component ID and type are required",
      });
    }

    // Find user by ID from auth middleware
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate component exists
    try {
      const Model = getComponentModel(componentType);
      const component = await Model.findById(componentId);

      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
    } catch (err) {
      return res.status(400).json({ message: "Invalid component type" });
    }

    // Check if already favorited
    const alreadyFavorited = user.favorites.some(
      (fav) =>
        fav.componentId.toString() === componentId &&
        fav.componentType.toLowerCase() === componentType.toLowerCase()
    );

    if (alreadyFavorited) {
      return res.status(200).json({
        message: "Component already in favorites",
        favorites: user.favorites,
      });
    }

    // Add to favorites
    user.favorites.push({
      componentType: componentType.toLowerCase(),
      componentId,
    });

    await user.save();
    res.status(201).json({
      message: "Added to favorites",
      favorites: user.favorites,
    });
  } catch (err) {
    console.error("Error adding to favorites:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    // Get component ID from URL params (this matches the DELETE route)
    const componentId = req.params.id;
    const componentType = req.body.componentType;

    console.log("Remove favorite request:", { componentId, componentType });

    if (!componentId) {
      return res.status(400).json({
        message: "Component ID is required",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if component exists in favorites before removal
    const favoriteExists = user.favorites.some(
      (fav) => fav.componentId.toString() === componentId
    );

    if (!favoriteExists) {
      console.log("Component not found in favorites");
      return res.status(404).json({
        message: "Component not found in favorites",
        favorites: user.favorites,
      });
    }

    // Remove from favorites (remove by componentId only for simplicity)
    user.favorites = user.favorites.filter(
      (fav) => fav.componentId.toString() !== componentId
    );

    await user.save();
    console.log("Removed from favorites successfully");

    res.json({
      message: "Removed from favorites successfully",
      componentId: componentId,
      favorites: user.favorites,
    });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Return the favorites list
    res.json(user.favorites);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUserFavoriteComponents = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Group favorites by component type
    const favoritesByType = {};
    user.favorites.forEach((fav) => {
      const type = fav.componentType;
      if (!favoritesByType[type]) {
        favoritesByType[type] = [];
      }
      favoritesByType[type].push(fav.componentId);
    });

    // Fetch component details for each type
    const results = [];

    for (const [type, ids] of Object.entries(favoritesByType)) {
      try {
        const Model = getModel(type);
        const components = await Model.find({ _id: { $in: ids } });

        components.forEach((component) => {
          results.push({
            ...component.toObject(),
            type: type,
          });
        });
      } catch (err) {
        console.error(`Error fetching ${type} components:`, err);
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Error fetching favorite components:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getComponentById = async (req, res) => {
  try {
    const { type, componentId } = req.params;

    // Special handling for 'all' type
    if (type.toLowerCase() === "all") {
      // Search through all component types to find the matching ID
      const results = await Promise.all(
        Object.values(componentModels).map((Model) =>
          Model.findById(componentId).lean()
        )
      );

      const component = results.find((c) => c !== null);
      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
      return res.json(component);
    }

    // Normal case for specific component types
    const Model = getComponentModel(type);
    if (!Model) {
      return res.status(400).json({ message: "Invalid component type" });
    }

    const component = await Model.findById(componentId);
    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }

    res.json(component);
  } catch (err) {
    console.error("Error in getComponentById:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
