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
  psu: PSU,
  storage: Storage,
  cooler: Cooler,
};

const FILTER_FIELD_MAP = {
  cpu: {
    manfacturer: "manfacturer",
    socket: "socket",
    cores: "cores",
    threads: "threads",
  },
  gpu: {
    manfacturer: "manfacturer",
    brand: "brand",
  },
  motherboard: {
    brand: "brand",
    MB_socket: "MB_socket",
    supported_memory: "supported_memory",
    MB_form: "MB_form",
  },
  case: {
    brand: "brand",
    case_type: "case_type",
    color: "color",
  },
  cooler: {
    brand: "brand",
    cooling_method: "cooling_method",
  },
  memory: {
    brand: "brand",
    DDR_generation: "DDR_generation",
    memory_size: "memory_size",
  },
  storage: {
    brand: "brand",
    size: "size",
  },
  psu: {
    brand: "brand",
  },
};

const ALLOWED_FILTERS = {
  cpu: [
    "cores",
    "threads",
    "manfacturer",
    "socket",
    "price",
    "minPrice",
    "maxPrice",
  ],
  gpu: [
    "brand",
    "manfacturer",
    "price",
    "minPrice",
    "maxPrice",
    "memorySize",
    "memoryType",
  ],
  motherboard: [
    "brand",
    "MB_socket",
    "supported_memory",
    "MB_form",
    "price",
    "minPrice",
    "maxPrice",
  ],
  case: ["brand", "case_type", "color", "price", "minPrice", "maxPrice"],
  cooler: ["brand", "cooling_method", "price", "minPrice", "maxPrice"],
  memory: [
    "brand",
    "DDR_generation",
    "memory_size",
    "price",
    "minPrice",
    "maxPrice",
  ],
  storage: ["brand", "size", "price", "minPrice", "maxPrice"],
  psu: ["brand", "price", "minPrice", "maxPrice"],
};

function filterUserFiltersForType(type, userFilters) {
  const allowed = ALLOWED_FILTERS[type] || [];
  const filtered = {};
  for (const key of allowed) {
    if (userFilters[key] !== undefined) {
      filtered[key] = userFilters[key];
    }
  }
  return filtered;
}

function mergeFilters(compatibilityFilter, userFilters) {
  const mergedFilter = { ...compatibilityFilter };

  // Handle price range filters
  if (
    userFilters.minPrice !== undefined ||
    userFilters.maxPrice !== undefined
  ) {
    mergedFilter.price = {};
    if (userFilters.minPrice !== undefined) {
      mergedFilter.price.$gte = parseFloat(userFilters.minPrice);
    }
    if (userFilters.maxPrice !== undefined) {
      mergedFilter.price.$lte = parseFloat(userFilters.maxPrice);
    }
  }

  // Handle other filters
  for (const [key, value] of Object.entries(userFilters)) {
    if (["minPrice", "maxPrice"].includes(key)) continue;

    if (mergedFilter[key]) {
      // If compatibility filter already has this field, intersect the values
      const compatVals = Array.isArray(mergedFilter[key].$in)
        ? mergedFilter[key].$in
        : [mergedFilter[key]];
      const userVals = Array.isArray(value) ? value : [value];
      const intersection = compatVals.filter((v) => userVals.includes(v));
      mergedFilter[key] = { $in: intersection };
    } else {
      // Otherwise just apply the user filter
      mergedFilter[key] = Array.isArray(value) ? { $in: value } : value;
    }
  }

  return mergedFilter;
}

const buildService = {
  getComponentModel: (type) => {
    const model = componentModels[type.toLowerCase()];
    if (!model) throw new Error(`Invalid component type: ${type}`);
    return model;
  },

  getAvailableFilters: async (selectedComponents, targetType, filters) => {
    const allowed = ALLOWED_FILTERS[targetType] || [];
    const fieldMap = FILTER_FIELD_MAP[targetType] || {};

    // Get all compatible components for current selection/filters
    const compatibleComponents = await buildService.getCompatibleComponents(
      selectedComponents,
      targetType,
      filters
    );

    // For each allowed filter, get unique values from compatibleComponents
    const availableFilters = {};
    for (const filterKey of allowed) {
      const dbField = fieldMap[filterKey] || filterKey;
      const values = [
        ...new Set(
          compatibleComponents
            .map((c) => c[dbField])
            .flat()
            .filter(Boolean)
        ),
      ];
      if (values.length > 0) {
        availableFilters[filterKey] = values;
      }
    }
    return availableFilters;
  },

  getCompatibleComponents: async (
    selectedComponents,
    targetType,
    filters = {},
    sortBy = null
  ) => {
    try {
      let compatibilityFilter = {};
      let selectFields = "title image_source price product_name rating";

      // Add specific fields needed for filtering
      switch (targetType.toLowerCase()) {
        case "cpu":
          selectFields += " manfacturer socket cores threads";
          break;
        case "gpu":
          selectFields += " manfacturer brand";
          break;
        case "motherboard":
          selectFields += " brand MB_socket supported_memory MB_form chipset";
          break;
        case "case":
          selectFields += " brand case_type color supported_motherboards";
          break;
        case "cooler":
          selectFields += " brand cooling_method compatible_cpu_sockets";
          break;
        case "memory":
          selectFields += " brand DDR_generation memory_size";
          break;
        case "storage":
          selectFields += " brand size";
          break;
        case "psu":
          selectFields += " brand";
          break;
      }

      // Compatibility logic
      switch (targetType.toLowerCase()) {
        case "gpu":
          // No specific compatibility requirements for GPU
          break;

        case "cpu":
          // No specific compatibility requirements for CPU
          break;

        case "motherboard":
          if (!selectedComponents.cpu) {
            throw new Error("Please select CPU first");
          }
          const cpu = await CPU.findById(selectedComponents.cpu);
          if (!cpu) throw new Error("Invalid CPU selection");
          compatibilityFilter = {
            MB_socket: cpu.socket,
            chipset: { $in: cpu.MB_chipsets },
          };
          break;

        case "case":
          if (!selectedComponents.motherboard) {
            throw new Error("Please select motherboard first");
          }
          const motherboard = await Motherboard.findById(
            selectedComponents.motherboard
          );
          if (!motherboard) throw new Error("Invalid motherboard selection");
          compatibilityFilter = {
            supported_motherboards: { $in: [motherboard.MB_form] },
          };
          break;

        case "memory":
          if (!selectedComponents.motherboard) {
            throw new Error("Please select motherboard first");
          }
          const mbForMemory = await Motherboard.findById(
            selectedComponents.motherboard
          );
          if (!mbForMemory) throw new Error("Invalid motherboard selection");
          compatibilityFilter = {
            DDR_generation: mbForMemory.supported_memory,
          };
          break;

        case "storage":
          // No specific compatibility requirements for storage
          break;

        case "psu":
          if (
            !selectedComponents.motherboard ||
            !selectedComponents.gpu ||
            !selectedComponents.cpu
          ) {
            throw new Error("Please select motherboard, GPU, and CPU first");
          }
          // Add PSU compatibility checks if needed
          break;

        case "cooler":
          if (!selectedComponents.cpu) {
            throw new Error("Please select CPU first");
          }
          const cpuForCooling = await CPU.findById(selectedComponents.cpu);
          if (!cpuForCooling) throw new Error("Invalid CPU selection");
          compatibilityFilter = {
            compatible_cpu_sockets: cpuForCooling.socket,
          };
          break;

        default:
          throw new Error(`Invalid component type: ${targetType}`);
      }

      // Filter and merge user filters
      const filteredUserFilters = filterUserFiltersForType(
        targetType.toLowerCase(),
        filters
      );
      const mergedFilter = mergeFilters(
        compatibilityFilter,
        filteredUserFilters
      );

      // Execute query
      const Model = componentModels[targetType.toLowerCase()];
      let query = Model.find(mergedFilter).select(selectFields);

      if (sortBy) {
        const [field, order] = sortBy.split(":");
        query = query.sort({ [field]: order === "desc" ? -1 : 1 });
      }

      return await query.exec();
    } catch (err) {
      throw new Error(`Error getting components: ${err.message}`);
    }
  },

  checkCompatibility: async (componentIds) => {
    try {
      const components = await buildService.getComponentsByIds(componentIds);

      const compatibilityChecks = {
        cpu_motherboard: buildService.checkCpuMotherboard(
          components.cpu,
          components.motherboard
        ),
        motherboard_case: buildService.checkMotherboardCase(
          components.motherboard,
          components.case
        ),
        memory_motherboard: buildService.checkMemoryMotherboard(
          components.memory,
          components.motherboard
        ),
        cooling_cpu: buildService.checkCoolingCpu(
          components.cooler,
          components.cpu
        ),
      };

      const isValid = Object.values(compatibilityChecks).every(
        (check) => check.valid
      );

      return {
        valid: isValid,
        checks: compatibilityChecks,
      };
    } catch (err) {
      throw new Error(`Build validation failed: ${err.message}`);
    }
  },

  // getComponentsByIds: async (componentIds) => {
  //   const components = {};

  //   await Promise.all(
  //     Object.entries(componentIds).map(async ([type, id]) => {
  //       const Model = componentModels[type];
  //       if (!Model) throw new Error(`Invalid component type: ${type}`);

  //       const component = await Model.findById(id);
  //       if (!component) throw new Error(`Invalid ${type} ID: ${id}`);

  //       components[type] = component;
  //     })
  //   );

  //   return components;
  // },
  // getComponentsByIds: async (componentIds) => {
  //   const components = {};

  //   await Promise.all(
  //     Object.entries(componentIds).map(async ([type, id]) => {
  //       const Model = componentModels[type];
  //       if (!Model) throw new Error(`Invalid component type: ${type}`);

  //       const component = await Model.findById(id);
  //       if (!component) {
  //         console.error(`Component not found: type=${type}, id=${id}`); // <--- ADD THIS
  //         throw new Error(`Invalid ${type} ID: ${id}`);
  //       }

  //       components[type] = component;
  //     })
  //   );

  //   return components;
  // },
  getComponentsByIds: async (componentIds) => {
    const components = {};

    await Promise.all(
      Object.entries(componentIds).map(async ([type, id]) => {
        console.log("DEBUG: getComponentsByIds type:", type, "id:", id);
        const Model = componentModels[type];
        if (!Model) throw new Error(`Invalid component type: ${type}`);

        const component = await Model.findById(id);
        if (!component) {
          console.error(`Component not found: type=${type}, id=${id}`);
          throw new Error(`Invalid ${type} ID: ${id}`);
        }

        components[type] = component;
      })
    );

    return components;
  },
  checkCpuMotherboard: (cpu, motherboard) => {
    if (!cpu || !motherboard) {
      return { valid: false, message: "Missing CPU or motherboard" };
    }

    const mbsocket = motherboard.MB_socket;
    const cpuchipset = cpu.MB_chipsets;
    const mbchipset = motherboard.chipset;
    const cpusocket = cpu.socket;

    const socketCompatible = cpusocket === mbsocket;
    
    const chipsetCompatible = !cpuchipset || cpuchipset.length === 0 || cpuchipset.includes(mbchipset);

    // Special case for AMD AM4 socket - all AM4 CPUs are compatible with AM4 motherboards
    const isAM4Compatible = (cpusocket === 'AM4' && mbsocket === 'AM4');

    const isValid = socketCompatible && (chipsetCompatible || isAM4Compatible);

    return {
      valid: isValid,
      message: isValid
        ? "CPU Compatible with motherboard"
        : "CPU incompatible with motherboard",
    };
  },

  // checkMotherboardCase: (motherboard, pCcase) => {
  //   if (!motherboard || !pCcase) {
  //     return { valid: false, message: "Missing motherboard or case" };
  //   }

  //   const supportedMotherboards = pCcase.supported_motherboards;
  //   const isValid = supportedMotherboards.includes(motherboard.MB_form);
  //   return {
  //     valid: isValid,
  //     message: isValid
  //       ? "Case Compatible with Motherboard"
  //       : "Case incompatible with Motherboard",
  //   };
  // },
  checkMotherboardCase: (motherboard, pCcase) => {
    if (!motherboard || !pCcase) {
      return { valid: false, message: "Missing motherboard or case" };
    }

    const supportedMotherboards = pCcase.supported_motherboards;
    // console.log("DEBUG: supportedMotherboards:", supportedMotherboards);
    // console.log("DEBUG: motherboard:", motherboard);
    // console.log("DEBUG: motherboard.MB_form:", motherboard.MB_form);

    if (!Array.isArray(supportedMotherboards)) {
      return {
        valid: false,
        message: "Case does not specify supported motherboards",
      };
    }

    const isValid = supportedMotherboards.includes(motherboard.MB_form);
    return {
      valid: isValid,
      message: isValid
        ? "Case Compatible with Motherboard"
        : "Case incompatible with Motherboard",
    };
  },
  checkMemoryMotherboard: (memory, motherboard) => {
    if (!memory || !motherboard) {
      return { valid: false, message: "Missing memory or motherboard" };
    }

    const memoryGeneration = memory.DDR_generation;
    const motherboardMemory = motherboard.supported_memory;
    // Normalize memory types for comparison
    const normalizeMemoryType = (type) => {
      if (!type) return '';
      return type.toString().toUpperCase().trim();
    };

    const normalizedMemoryGen = normalizeMemoryType(memoryGeneration);
    const normalizedMBMemory = normalizeMemoryType(motherboardMemory);

    // Check for exact match
    if (normalizedMemoryGen === normalizedMBMemory) {
      return {
        valid: true,
        message: "Memory compatible with motherboard"
      };
    }

    // Handle DDR4/DDR5 compatibility
    // Some motherboards support both DDR4 and DDR5
    if (Array.isArray(motherboardMemory)) {
      const isCompatible = motherboardMemory.some(mbMem => 
        normalizeMemoryType(mbMem) === normalizedMemoryGen
      );
      return {
        valid: isCompatible,
        message: isCompatible 
          ? "Memory compatible with motherboard" 
          : "Memory incompatible with motherboard"
      };
    }

    // Handle backward compatibility cases
    // Some motherboards support both DDR4 and DDR5
    if (normalizedMBMemory.includes('DDR4') && normalizedMemoryGen === 'DDR4') {
      return {
        valid: true,
        message: "Memory compatible with motherboard"
      };
    }
    if (normalizedMBMemory.includes('DDR5') && normalizedMemoryGen === 'DDR5') {
      return {
        valid: true,
        message: "Memory compatible with motherboard"
      };
    }

    return {
      valid: false,
      message: "Memory incompatible with motherboard"
    };
  },

  checkCoolingCpu: (cooler, cpu) => {
    if (!cooler || !cpu) {
      return { valid: false, message: "Missing cooler or CPU" };
    }

    const socketTypes = cooler.compatible_cpu_sockets;
    const isValid = socketTypes.includes(cpu.socket);

    return {
      valid: isValid,
      message: isValid
        ? "Cooler compatible with CPU"
        : "Cooler incompatible with CPU",
    };
  },
};

module.exports = buildService;
