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

exports.searchComponents = async (req, res) => {
  try {
    const { type } = req.params; // 'all' or specific component type
    const { q: searchQuery, limit = 50 } = req.query; // q for search query, limit for results

    console.log("Search request:", { type, searchQuery, limit });

    // Build search filter
    const searchFilter = {};

    // Add text search if query provided
    if (searchQuery && searchQuery.trim()) {
      const searchRegex = new RegExp(searchQuery.trim(), "i");
      searchFilter.$or = [
        { title: searchRegex },
        { brand: searchRegex },
        { model: searchRegex },
        { manfacturer: searchRegex }, // Note: keeping original spelling from your DB
        { category: searchRegex },
      ];
    }

    let components = [];
    const maxLimit = Math.min(parseInt(limit), 100); // Cap at 100 results

    if (type.toLowerCase() === "all") {
      // Search across all component types
      const searchPromises = Object.keys(componentModels).map(
        async (componentType) => {
          const Model = componentModels[componentType];

          try {
            const results = await Model.find(searchFilter)
              // Distribute limit across models
              .select(
                "title brand model manfacturer category price rating image_source type"
              )
              .lean(); // Use lean() for better performance

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
      components = searchResults.flat();

      // Sort by relevance (you can customize this scoring)
      if (searchQuery && searchQuery.trim()) {
        components = components.sort((a, b) => {
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

      // Apply final limit
      components = components.slice(0, maxLimit);
    } else {
      // Search specific component type
      const Model = getComponentModel(type);
      if (!Model) {
        return res.status(400).json({
          success: false,
          message: "Invalid component type",
        });
      }

      // Add category filter for specific type
      if (type.toLowerCase() !== "all") {
        searchFilter.category = type.toLowerCase();
      }

      components = await Model.find(searchFilter)
        .limit(maxLimit)
        .select(
          "title brand model manfacturer category price rating image_source type"
        )
        .sort({
          // Sort by relevance if searching, otherwise by rating/price
          ...(searchQuery ? {} : { rating: -1, price: 1 }),
        })
        .lean();

      // Add component type for consistency
      components = components.map((component) => ({
        ...component,
        componentType: type.toLowerCase(),
      }));
    }

    console.log(`Returning ${components.length} search results`);

    // Return search results
    res.json({
      success: true,
      components,
      totalResults: components.length,
      searchQuery: searchQuery || null,
      componentType: type,
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
    const { limit = 1000 } = req.query;
    const maxLimit = Math.min(parseInt(limit), 2000); // Cap at 2000 for initial load

    // Fetch from all component models
    const fetchPromises = Object.keys(componentModels).map(
      async (componentType) => {
        const Model = componentModels[componentType];

        try {
          const results = await Model.find({})
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
