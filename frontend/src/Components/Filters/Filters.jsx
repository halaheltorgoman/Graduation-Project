import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { MdFilterAlt } from "react-icons/md";
import { Menu, Checkbox, Tag, Slider, message } from "antd";
import axios from "axios";
import "./Filters.css";

// Mapping between backend keys and display names
const FILTER_DISPLAY_MAP = {
  cpu: {
    manfacturer: "Manufacturer",
    socket: "Socket Type",
    cores: "Number of Cores",
    threads: "Number of Threads",
  },
  gpu: {
    manfacturer: "Manufacturer",
    brand: "Brand",
  },
  motherboard: {
    brand: "Brand",
    MB_socket: "Supported Socket",
    supported_memory: "Supported Memory",
    MB_form: "Form Factor",
  },
  case: {
    brand: "Brand",
    case_type: "Case Size",
    color: "Color",
  },
  cooler: {
    brand: "Brand",
    cooling_method: "Type",
  },
  memory: {
    brand: "Brand",
    DDR_generation: "Memory Type",
    memory_size: "Memory Size",
  },
  storage: {
    brand: "Brand",
    size: "Capacity",
  },
  psu: {
    brand: "Brand",
    wattage: "Wattage",
    efficiency: "Efficiency Rating",
  },
};

// Reverse mapping for API calls
const DISPLAY_TO_BACKEND_MAP = {};
Object.entries(FILTER_DISPLAY_MAP).forEach(([type, mapping]) => {
  DISPLAY_TO_BACKEND_MAP[type] = {};
  Object.entries(mapping).forEach(([backend, display]) => {
    DISPLAY_TO_BACKEND_MAP[type][display] = backend;
  });
});

// Define components that should not use compatibility filtering
const NO_COMPATIBILITY_COMPONENTS = ["cpu", "gpu", "psu", "storage"];

// Define component dependency order - which components depend on which
const COMPONENT_DEPENDENCIES = {
  motherboard: ["cpu"],
  case: ["motherboard"],
  memory: ["motherboard"],
  cooler: ["cpu"],
  psu: ["motherboard", "gpu", "cpu"],
};

const sortingCategories = {
  Price: ["Low to High", "High to Low"],
  Rating: ["Low to High", "High to Low"],
};

// List of valid component types for which max price should be fetched
const VALID_COMPONENT_TYPES = [
  "cpu",
  "gpu",
  "motherboard",
  "case",
  "cooler",
  "memory",
  "storage",
  "psu",
];

function Filters({
  onSortChange,
  onFilterChange,
  initialFilters = {},
  initialSort = null,
  availableFilters = {},
  selectedComponents = {}, // Add this prop to receive selected components
}) {
  const { type } = useParams();
  const componentType = type?.toLowerCase();
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [compatibleFilterOptions, setCompatibleFilterOptions] = useState({});

  // Use refs to keep track of the current values without triggering re-renders
  const selectedFiltersRef = useRef(selectedFilters);
  const priceRangeRef = useRef(priceRange);
  const selectedComponentsRef = useRef(selectedComponents);
  const initializedRef = useRef(false);
  const typeRef = useRef(componentType);
  useEffect(() => {
    if (!initializedRef.current) return;

    if (Object.keys(initialFilters).length === 0) {
      setSelectedFilters([]);
      setPriceRange([0, maxPrice]);
    }
    if (!initialSort) {
      setSelectedSort(null);
    }
  }, [initialFilters, initialSort, maxPrice]);
  // Update refs when values change
  useEffect(() => {
    selectedFiltersRef.current = selectedFilters;
  }, [selectedFilters]);

  useEffect(() => {
    priceRangeRef.current = priceRange;
  }, [priceRange]);

  useEffect(() => {
    selectedComponentsRef.current = selectedComponents;
  }, [selectedComponents]);

  useEffect(() => {
    typeRef.current = componentType;
  }, [componentType]);

  // Check if current component type should use compatibility filtering
  const useCompatibilityFilters = useMemo(() => {
    return !NO_COMPATIBILITY_COMPONENTS.includes(typeRef.current);
  }, [typeRef.current]);

  // Fetch compatible filter options based on selected components
  const fetchCompatibleFilters = useCallback(async () => {
    // Get current type from ref to avoid dependency issues
    const currentType = typeRef.current;
    const currentComponents = selectedComponentsRef.current;

    if (
      !currentType ||
      currentType === "all" ||
      !VALID_COMPONENT_TYPES.includes(currentType) ||
      !useCompatibilityFilters
    ) {
      return;
    }

    try {
      setLoading(true);

      // Check if this component type has dependencies
      const dependencies = COMPONENT_DEPENDENCIES[currentType];
      if (!dependencies || dependencies.length === 0) {
        setLoading(false);
        return;
      }

      // Check if all dependencies are satisfied
      const missingDeps = dependencies.filter((dep) => !currentComponents[dep]);
      if (missingDeps.length > 0) {
        // If dependencies are missing, we can't fetch compatible options
        setLoading(false);
        return;
      }

      // Construct query params based on selected components
      const params = new URLSearchParams();
      Object.entries(currentComponents).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // Fetch compatible filter options for this component type
      const { data } = await axios.get(
        `http://localhost:4000/api/components/${currentType}/compatible-filters?${params.toString()}`
      );

      if (data && Object.keys(data).length > 0) {
        setCompatibleFilterOptions(data);
      }
    } catch (error) {
      console.error("Error fetching compatible filters:", error);
    } finally {
      setLoading(false);
    }
  }, [useCompatibilityFilters]); // Removed dependencies that could cause loops

  // Map backend filter keys to display names for rendering
  const filterCategories = useMemo(() => {
    if (!componentType || componentType === "all") return {};

    // Default filters for each component type when API filters aren't available or when we need to show all filters
    const defaultFilters = {
      cpu: {
        Manufacturer: ["Intel", "AMD"],
        "Socket Type": ["LGA1700", "AM5", "LGA1200", "AM4"],
        "Number of Cores": ["4", "6", "8", "10", "12", "14", "16", "24"],
        "Number of Threads": ["8", "12", "16", "20", "24", "28", "32"],
      },
      gpu: {
        Manufacturer: ["NVIDIA", "AMD", "Intel"],
        Brand: [
          "MSI",
          "SAPPHIRE",
          "ZOTAC",
          "ASUS",
          "Gigabyte",
          "GALAX",
          "Palit",
          "PNY",
        ],
      },
      motherboard: {
        Brand: ["MSI", "ASUS", "Gigabyte"],
        "Supported Socket": ["LGA1700", "AM5", "AM4"],
        "Supported Memory": ["DDR4", "DDR5"],
        "Form Factor": ["ATX", "Micro-ATX", "Extended-ATX"],
      },
      case: {
        Brand: [
          "NZXT",
          "Gigabyte",
          "Cooler Master",
          "ASUS",
          "Fractal Design",
          "Lian Li",
        ],
        "Case Size": ["Full Tower", "Mid Tower"],
        Color: ["Black", "White", "Grey", "Green", "Orange"],
      },
      cooler: {
        Brand: ["Cooler Master", "ASUS", "MSI", "Fractal Design", "Gigabyte"],
        Type: ["Air", "Liquid"],
      },
      memory: {
        Brand: ["Crucial", "Kingston", "CORSAIR", "G.Skill", "XPG", "Patriot"],
        "Memory Size": ["4GB", "8GB", "16GB", "32GB", "64GB"],
        "Memory Type": ["DDR4", "DDR5", "DDR3"],
      },
      storage: {
        Brand: ["Samsung", "Western Digital", "Kingston", "Crucial", "Seagate"],
        Capacity: ["128GB", "256GB", "512GB", "1TB", "2TB", "4TB"],
      },
      psu: {
        Brand: ["Cooler Master", "CORSAIR", "EVGA", "Seasonic", "Thermaltake"],
        Wattage: ["450W", "550W", "650W", "750W", "850W", "1000W"],
        "Efficiency Rating": [
          "80+ Bronze",
          "80+ Silver",
          "80+ Gold",
          "80+ Platinum",
          "80+ Titanium",
        ],
      },
    };

    // For components that don't use compatibility filtering, use the default hardcoded filters
    if (NO_COMPATIBILITY_COMPONENTS.includes(componentType)) {
      return defaultFilters[componentType] || {};
    }

    // For components with compatibility filtering, check if we have compatible options
    if (Object.keys(compatibleFilterOptions).length > 0) {
      const mapping = FILTER_DISPLAY_MAP[componentType] || {};
      const result = {};

      // Map backend keys to display names and populate options
      Object.entries(compatibleFilterOptions).forEach(
        ([backendKey, options]) => {
          if (
            backendKey === "price" ||
            backendKey === "minPrice" ||
            backendKey === "maxPrice"
          )
            return;

          const displayName = mapping[backendKey] || backendKey;
          result[displayName] = options;
        }
      );

      // If result is empty, fall back to default filters
      return Object.keys(result).length > 0
        ? result
        : defaultFilters[componentType] || {};
    }

    // If we don't have compatible options yet, use default filters
    // but check for specific compatibility constraints based on selected components
    if (Object.keys(selectedComponents).length > 0) {
      const result = { ...defaultFilters[componentType] };

      // Apply specific compatibility logic based on the component type
      switch (componentType) {
        case "motherboard":
          if (selectedComponents.cpu) {
            // Simulate filtering socket types based on CPU (in real app would come from API)
            // This is just a placeholder, the real filtering would happen via API
          }
          break;

        case "case":
          if (selectedComponents.motherboard) {
            // Simulate filtering case sizes based on motherboard (in real app would come from API)
          }
          break;

        case "memory":
          if (selectedComponents.motherboard) {
            // If motherboard supports only one memory type, only show that type
            // In a real app, this would come from the API
            // For now, simulate with a placeholder check
            const mockedMemoryType = "DDR5"; // Simulated memory type from selected motherboard
            if (mockedMemoryType) {
              result["Memory Type"] = [mockedMemoryType];
            }
          }
          break;

        case "cooler":
          if (selectedComponents.cpu) {
            // Simulate filtering cooler types based on CPU socket
          }
          break;

        default:
          break;
      }

      return result;
    }

    return defaultFilters[componentType] || {};
  }, [componentType, compatibleFilterOptions, selectedComponents]);

  // Fetch max price for slider
  const fetchMaxPrice = useCallback(async () => {
    const currentType = typeRef.current;

    if (loading || !currentType) return; // Prevent concurrent fetches

    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:4000/api/components/${currentType}/max-price`
      );
      const newMaxPrice = data.maxPrice || 1000;
      setMaxPrice(newMaxPrice);
      setPriceRange([0, newMaxPrice]);
    } catch (error) {
      message.error("Failed to fetch price range");
      console.error("Error fetching max price:", error);
    } finally {
      setLoading(false);
    }
  }, [loading]); // Removed type dependency

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedFilters([]);
    setSelectedSort(null);
    setPriceRange([0, maxPrice]);
    onFilterChange({});
    onSortChange(null);
  }, [onFilterChange, onSortChange, maxPrice]);

  // Convert selected filters to backend API params without dependencies that cause loops
  const updateAPIFilters = useCallback(() => {
    // Get current values from refs to avoid dependency issues
    const filtersList = selectedFiltersRef.current;
    const priceRangeVal = priceRangeRef.current;
    const currentType = typeRef.current;
    const currentComponents = selectedComponentsRef.current;

    const apiParams = {};
    const displayToBackend = DISPLAY_TO_BACKEND_MAP[currentType] || {};

    // Handle standard filters
    const filtersByCategory = filtersList.reduce((acc, filter) => {
      if (!acc[filter.category]) acc[filter.category] = [];
      acc[filter.category].push(filter.value);
      return acc;
    }, {});

    Object.entries(filtersByCategory).forEach(([displayCategory, values]) => {
      // Map display category name to backend field name
      let backendKey = displayToBackend[displayCategory];

      // Common mappings fallback for initial load
      if (!backendKey) {
        // Handle common mappings that might not be in the DISPLAY_TO_BACKEND_MAP yet
        if (displayCategory === "Manufacturer") backendKey = "manufacturer";
        else if (displayCategory === "Brand") backendKey = "brand";
        else if (displayCategory === "Socket Type") backendKey = "socket";
        else if (displayCategory === "Number of Cores") backendKey = "cores";
        else if (displayCategory === "Number of Threads")
          backendKey = "threads";
        else if (displayCategory === "Supported Socket")
          backendKey = "MB_socket";
        else if (displayCategory === "Supported Memory")
          backendKey = "supported_memory";
        else if (displayCategory === "Form Factor") backendKey = "MB_form";
        else if (displayCategory === "Case Size") backendKey = "case_type";
        else if (displayCategory === "Type") backendKey = "cooling_method";
        else if (displayCategory === "Memory Type")
          backendKey = "DDR_generation";
        else if (displayCategory === "Memory Size") backendKey = "memory_size";
        else if (displayCategory === "Capacity") backendKey = "size";
        else if (displayCategory === "Wattage") backendKey = "wattage";
        else if (displayCategory === "Efficiency Rating")
          backendKey = "efficiency";
        else backendKey = displayCategory.toLowerCase();
      }

      apiParams[backendKey] = values;
    });

    // Handle price range
    if (priceRangeVal && Array.isArray(priceRangeVal)) {
      apiParams.minPrice = priceRangeVal[0];
      apiParams.maxPrice = priceRangeVal[1];
    }

    // For special components (CPU, GPU, PSU, Storage), disable compatibility filtering
    if (NO_COMPATIBILITY_COMPONENTS.includes(currentType)) {
      apiParams.ignoreCompatibility = true;
    } else {
      // For components that use compatibility, add selected components to filter params
      Object.entries(currentComponents).forEach(([key, value]) => {
        if (value) {
          apiParams[`selected_${key}`] = value;
        }
      });
    }

    onFilterChange(apiParams);
  }, [onFilterChange]); // Removed dependencies that could cause loops

  // Checkbox change handler
  const handleCheckboxChange = useCallback(
    (category, value, checked) => {
      setSelectedFilters((prev) => {
        const updated = checked
          ? [...prev, { category, value }]
          : prev.filter((f) => !(f.category === category && f.value === value));

        // Call updateAPIFilters outside of state setter to avoid potential loops
        setTimeout(() => {
          updateAPIFilters(updated, priceRange);
        }, 0);

        return updated;
      });
    },
    [priceRange, updateAPIFilters]
  );

  // Price slider change handler
  const handlePriceSliderChange = useCallback(
    (range) => {
      setPriceRange(range);
      // Use a small timeout to break potential update loops
      setTimeout(() => {
        updateAPIFilters(selectedFilters, range);
      }, 0);
    },
    [selectedFilters, updateAPIFilters]
  );

  // Remove filter handler
  const handleRemoveFilter = useCallback(
    (category, value) => {
      handleCheckboxChange(category, value, false);
    },
    [handleCheckboxChange]
  );

  // Remove price filter handler
  const handleRemovePriceFilter = useCallback(() => {
    setPriceRange([0, maxPrice]);
    // Schedule updateAPIFilters to run on next tick
    setTimeout(updateAPIFilters, 0);
  }, [maxPrice, updateAPIFilters]);

  // Sort change handler
  const handleSortChange = useCallback(
    (category, value) => {
      const sortValue =
        category === "Price"
          ? `price:${value === "Low to High" ? "asc" : "desc"}`
          : `rating:${value === "Low to High" ? "asc" : "desc"}`;

      setSelectedSort(sortValue);
      onSortChange(sortValue);
    },
    [onSortChange]
  );

  // Completely rewritten effect structure to prevent update loops
  // Initial setup - only runs once when component mounts
  useEffect(() => {
    const initializeComponent = async () => {
      if (type && type !== "all" && VALID_COMPONENT_TYPES.includes(type)) {
        await fetchMaxPrice();

        if (
          useCompatibilityFilters &&
          Object.keys(selectedComponents).length > 0
        ) {
          await fetchCompatibleFilters();
        }

        // Mark as initialized
        initializedRef.current = true;
      }
    };

    initializeComponent();
  }, []); // Empty dependency array - runs only on mount

  // Handle component type changes
  useEffect(() => {
    if (!type || !initializedRef.current) return;

    const handleTypeChange = async () => {
      // Reset filters, but don't clear them completely
      setSelectedFilters([]);
      setSelectedSort(null);
      setPriceRange([0, maxPrice]);

      // For components that don't need compatibility filtering, pass the flag immediately
      const apiParams = {};
      if (NO_COMPATIBILITY_COMPONENTS.includes(componentType)) {
        apiParams.ignoreCompatibility = true;
      } else if (Object.keys(selectedComponents).length > 0) {
        // Add selected components to the API params for compatibility filtering
        Object.entries(selectedComponents).forEach(([key, value]) => {
          if (value) {
            apiParams[`selected_${key}`] = value;
          }
        });
      }

      // Clear any active filters in the parent component
      onFilterChange(apiParams);
      onSortChange(null);

      // Fetch new data based on type change
      if (VALID_COMPONENT_TYPES.includes(type)) {
        await fetchMaxPrice();
      }
    };

    handleTypeChange();
  }, [type]); // Only depends on type changes

  // Handle selected components changes
  useEffect(() => {
    if (!initializedRef.current || !useCompatibilityFilters) return;

    const handleComponentsChange = async () => {
      await fetchCompatibleFilters();

      // Call updateAPIFilters separately to avoid dependency cycles
      setTimeout(updateAPIFilters, 0);
    };

    if (Object.keys(selectedComponents).length > 0) {
      handleComponentsChange();
    }
  }, [selectedComponents]); // Only depends on selectedComponents

  // Build filter items for Menu
  const filterItems = Object.entries(filterCategories).map(
    ([category, options]) => ({
      key: category,
      label: category,
      children: options.map((option) => ({
        key: `${category}-${option}`,
        label: (
          <Checkbox
            checked={selectedFilters.some(
              (f) => f.category === category && f.value === option
            )}
            onChange={(e) =>
              handleCheckboxChange(category, option, e.target.checked)
            }
          >
            {option}
          </Checkbox>
        ),
      })),
    })
  );

  // Build sorting items for Menu
  const sortingItems = Object.entries(sortingCategories).map(
    ([category, options]) => ({
      key: category,
      label: category,
      children: options.map((option) => {
        const isSelected =
          selectedSort ===
          (category === "Price"
            ? `price:${option === "Low to High" ? "asc" : "desc"}`
            : `rating:${option === "Low to High" ? "asc" : "desc"}`);
        return {
          key: `${category}-${option}`,
          label: (
            <div
              className={`sort-option${isSelected ? " selected" : ""}`}
              onClick={() => handleSortChange(category, option)}
            >
              {option}
            </div>
          ),
        };
      }),
    })
  );

  const isPriceFilterActive = priceRange[0] > 0 || priceRange[1] < maxPrice;

  // Check if we need to display compatibility notice
  const shouldShowCompatibilityNotice = () => {
    if (NO_COMPATIBILITY_COMPONENTS.includes(componentType)) {
      return false;
    }

    // Check if this component type has dependencies
    const dependencies = COMPONENT_DEPENDENCIES[componentType];
    if (!dependencies || dependencies.length === 0) {
      return false;
    }

    // Check if all dependencies are satisfied
    const missingDeps = dependencies.filter((dep) => !selectedComponents[dep]);
    return missingDeps.length > 0;
  };

  return (
    <div className="filter_container">
      <div className="filter_main">
        <div className="filters_headers">
          <div className="filter_firstHeader">
            <MdFilterAlt />
            <h3>Filters</h3>
            {NO_COMPATIBILITY_COMPONENTS.includes(componentType) && (
              <span className="filter-mode-tag">All Products</span>
            )}
            {!NO_COMPATIBILITY_COMPONENTS.includes(componentType) &&
              componentType !== "all" && (
                <span className="filter-mode-tag">Compatible Products</span>
              )}
          </div>

          <div className="filter_secondHeader">
            <p>Applied Filters</p>
            <button className="filter_clearallBtn" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>
          <div className="filter_thirdHeader">
            {selectedFilters.length === 0 &&
            !selectedSort &&
            !isPriceFilterActive ? (
              <p>All</p>
            ) : (
              <>
                {selectedFilters.map(({ category, value }) => (
                  <Tag
                    key={`${category}-${value}`}
                    closable
                    onClose={() => handleRemoveFilter(category, value)}
                  >
                    {value}
                  </Tag>
                ))}
                {isPriceFilterActive && (
                  <Tag closable onClose={handleRemovePriceFilter}>
                    Price: ${priceRange[0].toLocaleString()} - $
                    {priceRange[1].toLocaleString()}
                  </Tag>
                )}
                {selectedSort && (
                  <Tag
                    closable
                    onClose={() => {
                      setSelectedSort(null);
                      onSortChange(null);
                    }}
                  >
                    {selectedSort === "price:asc" && "Price: Low to High"}
                    {selectedSort === "price:desc" && "Price: High to Low"}
                    {selectedSort === "rating:asc" && "Rating: Low to High"}
                    {selectedSort === "rating:desc" && "Rating: High to Low"}
                  </Tag>
                )}
              </>
            )}
          </div>
        </div>

        <div className="filter_secondary">
          {componentType !== "all" && (
            <Menu mode="inline" items={filterItems} />
          )}
          <div className="filter_divider" />
          <div className="filter_sorting">
            <h3>Sort By</h3>
            <Menu mode="inline" items={sortingItems} />
          </div>
          <div className="filter_divider" />
          <div className="filter_price_slider">
            <h4>Price Range</h4>
            <Slider
              range
              step={50}
              min={0}
              max={maxPrice}
              value={priceRange}
              onChange={handlePriceSliderChange}
              className="custom-slider"
              disabled={loading}
              tooltip={{
                formatter: (value) => `$${value.toLocaleString()}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filters;
