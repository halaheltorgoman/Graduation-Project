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

  async getCompatibleComponents(
    selectedComponents,
    targetType,
    filters = {},
    sortBy = null
  ) {
    try {
      let compatibilityFilter = {};
      let selectFields = "title image_source price product_name rating";

      // Add component-specific fields needed for compatibility checks
      switch (targetType.toLowerCase()) {
        case "cpu":
          selectFields += " manfacturer socket cores threads MB_chipsets";
          break;
        case "gpu":
          selectFields += " manfacturer brand length power_requirements";
          break;
        case "motherboard":
          selectFields +=
            " brand MB_socket supported_memory MB_form chipset pcie_slots dimensions storage_interfaces";
          break;
        case "case":
          selectFields +=
            " brand case_type color supported_motherboards max_gpu_length psu_support dimensions cooler_height drive_bays";
          break;
        case "cooler":
          selectFields += " brand cooling_method compatible_cpu_sockets height";
          break;
        case "memory":
          selectFields += " brand DDR_generation memory_size modules";
          break;
        case "storage":
          selectFields += " brand size form_factor interface";
          break;
        case "psu":
          selectFields += " brand wattage form_factor modular";
          break;
      }

      // Enhanced two-way compatibility logic for all components
      const components = await this.getComponentsByIds(selectedComponents);

      switch (targetType.toLowerCase()) {
        case "cpu":
          if (components.motherboard) {
            compatibilityFilter = {
              socket: components.motherboard.MB_socket,
              MB_chipsets: components.motherboard.chipset,
            };
          }
          break;

        case "motherboard":
          if (components.cpu) {
            compatibilityFilter = {
              MB_socket: components.cpu.socket,
              chipset: { $in: components.cpu.MB_chipsets },
            };
          }
          if (components.case) {
            compatibilityFilter = {
              ...compatibilityFilter,
              MB_form: { $in: components.case.supported_motherboards },
            };
          }
          if (components.memory) {
            compatibilityFilter = {
              ...compatibilityFilter,
              supported_memory: components.memory.DDR_generation,
            };
          }
          break;

        case "gpu":
          if (components.case && components.case.max_gpu_length) {
            compatibilityFilter = {
              length: { $lte: components.case.max_gpu_length },
            };
          }
          if (components.psu && components.psu.wattage) {
            compatibilityFilter = {
              ...compatibilityFilter,
              power_requirements: { $lte: components.psu.wattage * 0.8 }, // 80% of PSU capacity
            };
          }
          break;

        case "case":
          if (components.motherboard) {
            compatibilityFilter = {
              supported_motherboards: components.motherboard.MB_form,
            };
          }
          if (components.gpu && components.gpu.length) {
            compatibilityFilter = {
              ...compatibilityFilter,
              max_gpu_length: { $gte: components.gpu.length },
            };
          }
          if (components.psu) {
            compatibilityFilter = {
              ...compatibilityFilter,
              psu_support: components.psu.form_factor,
            };
          }
          if (components.cooler && components.cooler.height) {
            compatibilityFilter = {
              ...compatibilityFilter,
              cooler_height: { $gte: components.cooler.height },
            };
          }
          break;

        case "memory":
          if (components.motherboard) {
            compatibilityFilter = {
              DDR_generation: components.motherboard.supported_memory,
            };
          }
          break;

        case "storage":
          if (
            components.motherboard &&
            components.motherboard.storage_interfaces
          ) {
            compatibilityFilter = {
              interface: { $in: components.motherboard.storage_interfaces },
            };
          }
          if (components.case && components.case.drive_bays) {
            compatibilityFilter = {
              ...compatibilityFilter,
              form_factor: { $in: components.case.drive_bays },
            };
          }
          break;

        case "psu":
          if (components.case) {
            compatibilityFilter = {
              form_factor: components.case.psu_support,
            };
          }
          if (components.gpu && components.gpu.power_requirements) {
            compatibilityFilter = {
              ...compatibilityFilter,
              wattage: { $gte: components.gpu.power_requirements * 1.5 }, // 50% headroom
            };
          }
          break;

        case "cooler":
          if (components.cpu) {
            compatibilityFilter = {
              compatible_cpu_sockets: components.cpu.socket,
            };
          }
          if (components.case && components.case.cooler_height) {
            compatibilityFilter = {
              ...compatibilityFilter,
              height: { $lte: components.case.cooler_height },
            };
          }
          break;
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
        cooling_case: buildService.checkCoolingCase(
          components.cooler,
          components.case
        ),
        gpu_case: buildService.checkGpuCase(components.gpu, components.case),
        gpu_psu: buildService.checkGpuPsu(components.gpu, components.psu),
        storage_motherboard: buildService.checkStorageMotherboard(
          components.storage,
          components.motherboard
        ),
        psu_case: buildService.checkPsuCase(components.psu, components.case),
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

  getComponentsByIds: async (componentIds) => {
    const components = {};

    // Handle case where componentIds might be an array of component types
    if (Array.isArray(componentIds)) {
      console.log("[DEBUG] componentIds is an array:", componentIds);
      return components; // Return empty object for array case
    }

    await Promise.all(
      Object.entries(componentIds).map(async ([type, id]) => {
        console.log("DEBUG: getComponentsByIds type:", type, "id:", id);

        // Skip if id is null, undefined, or empty
        if (!id) {
          console.log(`[DEBUG] Skipping ${type} - no ID provided`);
          return;
        }

        const Model = componentModels[type];
        if (!Model) throw new Error(`Invalid component type: ${type}`);

        try {
          const component = await Model.findById(id);
          if (!component) {
            console.error(`Component not found: type=${type}, id=${id}`);
            throw new Error(`Invalid ${type} ID: ${id}`);
          }
          components[type] = component;
        } catch (error) {
          console.error(`Error fetching ${type} with ID ${id}:`, error);
          throw error;
        }
      })
    );

    return components;
  },

  // Enhanced compatibility check functions
  checkGpuCase: (gpu, pCcase) => {
    if (!gpu || !pCcase) return { valid: true };

    const isValid =
      !gpu.length ||
      !pCcase.max_gpu_length ||
      gpu.length <= pCcase.max_gpu_length;
    return {
      valid: isValid,
      message: isValid
        ? "GPU fits in case"
        : `GPU (${gpu.length}mm) too long for case (max ${pCcase.max_gpu_length}mm)`,
    };
  },

  checkGpuPsu: (gpu, psu) => {
    if (!gpu || !psu) return { valid: true };

    const isValid =
      !gpu.power_requirements ||
      !psu.wattage ||
      gpu.power_requirements <= psu.wattage * 0.8;
    return {
      valid: isValid,
      message: isValid
        ? "PSU sufficient for GPU"
        : `PSU (${psu.wattage}W) insufficient for GPU (needs ${gpu.power_requirements}W)`,
    };
  },

  checkCoolingCase: (cooler, pCcase) => {
    if (!cooler || !pCcase) return { valid: true };

    const isValid =
      !cooler.height ||
      !pCcase.cooler_height ||
      cooler.height <= pCcase.cooler_height;
    return {
      valid: isValid,
      message: isValid
        ? "Cooler fits in case"
        : `Cooler (${cooler.height}mm) too tall for case (max ${pCcase.cooler_height}mm)`,
    };
  },

  checkStorageMotherboard: (storage, motherboard) => {
    if (!storage || !motherboard) return { valid: true };

    const isValid =
      !storage.interface ||
      !motherboard.storage_interfaces ||
      !Array.isArray(motherboard.storage_interfaces) ||
      motherboard.storage_interfaces.includes(storage.interface);
    return {
      valid: isValid,
      message: isValid
        ? "Storage compatible with motherboard"
        : `Storage interface (${storage.interface}) not supported by motherboard`,
    };
  },

  checkPsuCase: (psu, pCcase) => {
    if (!psu || !pCcase) return { valid: true };

    const isValid =
      !psu.form_factor ||
      !pCcase.psu_support ||
      (Array.isArray(pCcase.psu_support)
        ? pCcase.psu_support.includes(psu.form_factor)
        : pCcase.psu_support === psu.form_factor);
    return {
      valid: isValid,
      message: isValid
        ? "PSU fits in case"
        : `PSU form factor (${psu.form_factor}) not supported by case`,
    };
  },

  checkCpuMotherboard: (cpu, motherboard) => {
    if (!cpu || !motherboard) {
      return { valid: false, message: "Missing CPU or motherboard" };
    }

    const mbsocket = motherboard.MB_socket;
    const cpuchipset = cpu.MB_chipsets;
    const mbchipset = motherboard.chipset;
    const cpusocket = cpu.socket;

    // Basic validation
    if (!cpusocket || !mbsocket) {
      return { valid: false, message: "Missing socket information" };
    }

    const socketCompatible = cpusocket === mbsocket;

    // Enhanced chipset compatibility check
    let chipsetCompatible = false;
    if (!cpuchipset || cpuchipset.length === 0) {
      // If CPU doesn't specify chipsets, assume socket compatibility is enough
      chipsetCompatible = true;
    } else if (Array.isArray(cpuchipset)) {
      chipsetCompatible = cpuchipset.includes(mbchipset);
    } else {
      chipsetCompatible = cpuchipset === mbchipset;
    }

    // Special case for AMD AM4 socket - enhanced from friend's version
    const isAM4Compatible = cpusocket === "AM4" && mbsocket === "AM4";

    const isValid = socketCompatible && (chipsetCompatible || isAM4Compatible);

    return {
      valid: isValid,
      message: isValid
        ? "CPU Compatible with motherboard"
        : `CPU incompatible with motherboard (Socket: ${cpusocket} vs ${mbsocket}, Chipset: ${cpuchipset} vs ${mbchipset})`,
    };
  },

  checkMotherboardCase: (motherboard, pCcase) => {
    if (!motherboard || !pCcase) {
      return { valid: false, message: "Missing motherboard or case" };
    }

    const supportedMotherboards = pCcase.supported_motherboards;

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
        : `Case incompatible with Motherboard (${motherboard.MB_form} not supported)`,
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
      if (!type) return "";
      return type.toString().toUpperCase().trim();
    };

    const normalizedMemoryGen = normalizeMemoryType(memoryGeneration);
    const normalizedMBMemory = normalizeMemoryType(motherboardMemory);

    // Check for exact match
    if (normalizedMemoryGen === normalizedMBMemory) {
      return {
        valid: true,
        message: "Memory compatible with motherboard",
      };
    }

    // Handle DDR4/DDR5 compatibility
    // Some motherboards support both DDR4 and DDR5
    if (Array.isArray(motherboardMemory)) {
      const isCompatible = motherboardMemory.some(
        (mbMem) => normalizeMemoryType(mbMem) === normalizedMemoryGen
      );
      return {
        valid: isCompatible,
        message: isCompatible
          ? "Memory compatible with motherboard"
          : `Memory incompatible with motherboard (${normalizedMemoryGen} not in ${motherboardMemory})`,
      };
    }

    // Handle backward compatibility cases
    if (normalizedMBMemory.includes("DDR4") && normalizedMemoryGen === "DDR4") {
      return {
        valid: true,
        message: "Memory compatible with motherboard",
      };
    }
    if (normalizedMBMemory.includes("DDR5") && normalizedMemoryGen === "DDR5") {
      return {
        valid: true,
        message: "Memory compatible with motherboard",
      };
    }

    return {
      valid: false,
      message: `Memory incompatible with motherboard (${normalizedMemoryGen} vs ${normalizedMBMemory})`,
    };
  },

  checkCoolingCpu: (cooler, cpu) => {
    if (!cooler || !cpu) {
      return { valid: false, message: "Missing cooler or CPU" };
    }

    const socketTypes = cooler.compatible_cpu_sockets;
    const isValid = Array.isArray(socketTypes)
      ? socketTypes.includes(cpu.socket)
      : socketTypes === cpu.socket;

    return {
      valid: isValid,
      message: isValid
        ? "Cooler compatible with CPU"
        : `Cooler incompatible with CPU (${cpu.socket} not in ${socketTypes})`,
    };
  },
};

module.exports = buildService;
