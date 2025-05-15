const User = require("../models/User");
const CPU = require("../models/Components/CPU");
const GPU = require("../models/Components/GPU");
const Motherboard = require("../models/Components/MotherBoard");
const Case = require("../models/Components/Case");
const Memory = require("../models/Components/Memory");
const Storage = require("../models/Components/Storage");
//const PSU = require('../models/Components/PSU');
const Cooler = require("../models/Components/Cooler");

const componentModels = {
  cpu: CPU,
  gpu: GPU,
  motherboard: Motherboard,
  memory: Memory,
  case: Case,
  storage: Storage,
  //psu: PSU,
  cooling: Cooler,
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
      // Manufacturer filter

      if (queryParams.socket) {
        filter.socket = {
          $in: Array.isArray(queryParams.socket)
            ? queryParams.socket
            : [queryParams.socket],
        };
      }
      // Updated cores filter (now accepts array of values)
      if (queryParams.cores) {
        filter.cores = {
          $in: Array.isArray(queryParams.cores)
            ? queryParams.cores.map((c) => parseInt(c))
            : [parseInt(queryParams.cores)],
        };
      }

      // Updated threads filter (now accepts array of values)
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
      // Socket Type filter
      if (queryParams.MB_socket) {
        filter.MB_socket = {
          $in: Array.isArray(queryParams.MB_socket)
            ? queryParams.MB_socket
            : [queryParams.MB_socket],
        };
      }

      // Supported Memory filter
      if (queryParams.supported_memory) {
        // Note: lowercase from frontend conversion
        filter.supported_memory = {
          $in: Array.isArray(queryParams.supported_memory)
            ? queryParams.supported_memory
            : [queryParams.supported_memory],
        };
      }

      // Form Factor filter
      if (queryParams.MB_form) {
        // Option 1: Exact matching (best for consistent data)
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
    } else if (componentType === "cooling") {
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
    }
    console.log("Final filter object:", JSON.stringify(filter, null, 2));

    let components = [];

    if (componentType === "all") {
      // Fetch from all component models
      const promises = Object.keys(componentModels).map(async (key) => {
        return await componentModels[key].find(filter);
      });
      const results = await Promise.all(promises);
      components = results.flat();
    } else {
      // Fetch from a specific component type
      const Model = getComponentModel(componentType);
      if (!Model) {
        return res.status(400).json({ message: "Invalid component type" });
      }
      components = await Model.find(filter);
    }

    // Sorting
    if (queryParams.sortBy) {
      const [field, order] = queryParams.sortBy.split(":");
      components.sort((a, b) =>
        order === "desc" ? b[field] - a[field] : a[field] - b[field]
      );
    }

    console.log(`Returning ${components.length} components`);
    res.json(components);
  } catch (err) {
    console.error("Error in getComponentsByType:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.addToFavorites = async (req, res) => {
  try {
    const { componentId, componentType } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const Model = getComponentModel(componentType.toLowerCase());
    const component = await Model.findById(componentId);

    if (!component)
      return res.status(404).json({ message: "Component not found" });

    // Check if already favorited
    if (
      user.favorites.some(
        (fav) =>
          fav.componentId.equals(componentId) && fav.componentType.toLowerCase()
      )
    ) {
      return res
        .status(400)
        .json({ message: "Component already in favorites" });
    }

    user.favorites.push({
      componentType: componentType.toLowerCase(),
      componentId,
    });

    await user.save();
    res.json({ message: "Added to favorites", favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { componentId, componentType } = req.body;

    const user = await User.findById(req.userId);

    user.favorites = user.favorites.filter(
      (fav) =>
        !(
          fav.componentType === componentType &&
          fav.componentId.equals(componentId)
        )
    );

    await user.save();
    res.json({ message: "Removed from favorites", favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.searchComponents = async (req, res) => {
  try {
    const { type } = req.params;
    const { minRating, maxRating, search, minPrice, maxPrice, sortBy } =
      req.query;

    const Model = getComponentModel(type.toLowerCase());

    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }

    let dbQuery = Model.find(query);

    if (sortBy) {
      const [field, order] = sortBy.split(":");
      dbQuery = dbQuery.sort({ [field]: order === "desc" ? -1 : 1 });
    }

    const results = await dbQuery.limit(100).exec();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
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

// New method to get detailed favorite components
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
// Add this to your components controller
// componentController.js
