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

// Helper function to get component model
const getComponentModel = (type) => {
  return componentModels[type.toLowerCase()];
};

// Helper function to build filters (reused from your componentController)
const buildFilters = (queryParams, componentType) => {
  const filter = {};

  // Always filter by category if not 'all'
  if (componentType.toLowerCase() !== "all") {
    filter.category = componentType.toLowerCase();
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
      $in: Array.isArray(queryParams.brand)
        ? queryParams.brand.map((b) => new RegExp(b, "i"))
        : [new RegExp(queryParams.brand, "i")],
    };
  }

  // Component-specific filters
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
  } else if (componentType === "storage") {
    if (queryParams.size) {
      filter.size = {
        $in: Array.isArray(queryParams.size)
          ? queryParams.size
          : [queryParams.size],
      };
    }
  }

  return filter;
};

exports.searchComponents = async (req, res) => {
  try {
    const { type } = req.params; // 'all' or specific component type
    const {
      q: searchQuery,
      page = 1,
      pageSize = 15,
      sortBy,
      ...filterParams
    } = req.query;

    console.log("Search request:", {
      type,
      searchQuery,
      page,
      pageSize,
      sortBy,
      filterParams,
    });

    // Pagination parameters
    const currentPage = parseInt(page);
    const limit = Math.min(parseInt(pageSize), 100); // Cap at 100 results
    const skip = (currentPage - 1) * limit;

    // Build base filter using the same logic as your browse controller
    const baseFilter = buildFilters(filterParams, type);

    // Add text search if query provided
    if (searchQuery && searchQuery.trim()) {
      const searchRegex = new RegExp(searchQuery.trim(), "i");
      const searchConditions = [
        { title: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
        { manfacturer: searchRegex }, // Note: keeping original spelling from your DB
        { category: searchRegex },
      ];

      // Combine search with existing filters
      if (Object.keys(baseFilter).length > 0) {
        baseFilter.$and = [
          { $or: searchConditions },
          // Remove $or from baseFilter if it exists and add it as separate conditions
          ...Object.entries(baseFilter)
            .filter(([key]) => key !== "$or")
            .map(([key, value]) => ({ [key]: value })),
        ];

        // Clean up the original keys that we moved to $and
        Object.keys(baseFilter).forEach((key) => {
          if (key !== "$and") {
            delete baseFilter[key];
          }
        });
      } else {
        baseFilter.$or = searchConditions;
      }
    }

    console.log("Final search filter:", JSON.stringify(baseFilter, null, 2));

    let components = [];
    let totalCount = 0;

    if (type.toLowerCase() === "all") {
      // Search across all component types with filters
      const searchPromises = Object.keys(componentModels).map(
        async (componentType) => {
          const Model = componentModels[componentType];

          // Create component-specific filter
          const componentFilter = { ...baseFilter };

          // Add category filter for this specific component type
          if (componentFilter.$and) {
            componentFilter.$and.push({
              category: componentType.toLowerCase(),
            });
          } else {
            componentFilter.category = componentType.toLowerCase();
          }

          try {
            let query = Model.find(componentFilter)
              .select(
                "title brand model manfacturer category price rating image_source type"
              )
              .lean();

            // Apply sorting if specified
            if (sortBy) {
              const [field, order] = sortBy.split(":");
              const sortOrder = order === "desc" ? -1 : 1;
              query = query.sort({ [field]: sortOrder });
            }

            const results = await query.exec();

            // Add component type to each result for identification
            return results.map((result) => ({
              ...result,
              componentType: componentType,
            }));
          } catch (error) {
            console.error(`Error searching ${componentType}:`, error);
            return [];
          }
        }
      );

      const searchResults = await Promise.all(searchPromises);
      let allComponents = searchResults.flat();

      // Sort the combined results if needed
      if (sortBy) {
        const [field, order] = sortBy.split(":");
        allComponents.sort((a, b) => {
          const aVal = a[field] || 0;
          const bVal = b[field] || 0;
          return order === "desc" ? bVal - aVal : aVal - bVal;
        });
      } else if (searchQuery && searchQuery.trim()) {
        // Sort by relevance if searching without explicit sort
        allComponents = allComponents.sort((a, b) => {
          const queryLower = searchQuery.toLowerCase();

          // Simple relevance scoring
          const getRelevanceScore = (item) => {
            let score = 0;
            const title = (item.title || "").toLowerCase();
            const brand = (item.brand || "").toLowerCase();

            // Exact matches get highest score
            if (title === queryLower) score += 100;
            if (brand === queryLower) score += 80;

            // Starts with matches
            if (title.startsWith(queryLower)) score += 50;
            if (brand.startsWith(queryLower)) score += 40;

            // Contains matches
            if (title.includes(queryLower)) score += 20;
            if (brand.includes(queryLower)) score += 15;

            return score;
          };

          return getRelevanceScore(b) - getRelevanceScore(a);
        });
      }

      // Apply pagination AFTER sorting and combining
      totalCount = allComponents.length;
      components = allComponents.slice(skip, skip + limit);
    } else {
      // Search specific component type with filters
      const Model = getComponentModel(type);
      if (!Model) {
        return res.status(400).json({
          success: false,
          message: "Invalid component type",
        });
      }

      // Get total count for pagination
      totalCount = await Model.countDocuments(baseFilter);

      // Build the query
      let query = Model.find(baseFilter)
        .select(
          "title brand model manfacturer category price rating image_source type"
        )
        .lean();

      // Apply sorting if specified
      if (sortBy) {
        const [field, order] = sortBy.split(":");
        const sortOrder = order === "desc" ? -1 : 1;
        query = query.sort({ [field]: sortOrder });
      } else if (searchQuery && searchQuery.trim()) {
        // Default sort by rating and price if searching without explicit sort
        query = query.sort({ rating: -1, price: 1 });
      }

      // Apply pagination
      components = await query.skip(skip).limit(limit);

      // Add component type for consistency
      components = components.map((component) => ({
        ...component,
        componentType: type.toLowerCase(),
      }));
    }

    console.log(
      `Returning ${components.length} search results out of ${totalCount} total`
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    // Return search results with pagination
    res.json({
      success: true,
      components,
      pagination: {
        currentPage: currentPage,
        pageSize: limit,
        totalCount,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
      searchQuery: searchQuery || null,
      componentType: type,
      appliedFilters: filterParams,
    });
  } catch (err) {
    console.error("Error in searchComponents:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Alternative: Get all components without search (for initial load)
exports.getAllComponentsForSearch = async (req, res) => {
  try {
    const { limit = 1000, ...filterParams } = req.query;
    const maxLimit = Math.min(parseInt(limit), 2000); // Cap at 2000 for initial load

    // Build base filter
    const baseFilter = buildFilters(filterParams, "all");

    // Fetch from all component models with filters
    const fetchPromises = Object.keys(componentModels).map(
      async (componentType) => {
        const Model = componentModels[componentType];

        // Create component-specific filter
        const componentFilter = { ...baseFilter };

        // Add category filter for this specific component type
        if (componentFilter.$and) {
          componentFilter.$and.push({ category: componentType.toLowerCase() });
        } else {
          componentFilter.category = componentType.toLowerCase();
        }

        try {
          const results = await Model.find(componentFilter)
            .limit(Math.ceil(maxLimit / Object.keys(componentModels).length))
            .select(
              "title brand model manfacturer category price rating image_source type"
            )
            .sort({ rating: -1, price: 1 })
            .lean();

          return results.map((result) => ({
            ...result,
            componentType: componentType,
          }));
        } catch (error) {
          console.error(`Error fetching ${componentType}:`, error);
          return [];
        }
      }
    );

    const results = await Promise.all(fetchPromises);
    const allComponents = results.flat().slice(0, maxLimit);

    console.log(
      `Returning ${allComponents.length} components for search initialization`
    );

    res.json({
      success: true,
      components: allComponents,
      totalResults: allComponents.length,
      appliedFilters: filterParams,
    });
  } catch (err) {
    console.error("Error in getAllComponentsForSearch:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
