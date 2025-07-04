import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { MdFilterAlt } from "react-icons/md";
import { Menu, Checkbox, Tag, Slider, message } from "antd";
import axios from "axios";
import "./Filters.css";

const COMPONENT_FILTERS = {
  cpu: {
    Manufacturer: ["Intel", "AMD"],
    "Socket Type": ["LGA1700", "AM5", "LGA1200", "AM4"],
    "Number of Cores": [
      "4",
      "6",
      "8",
      "10",
      "12",
      "14",
      "16",
      "18",
      "20",
      "22",
      "24",
    ],
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
      "Sparkle Computer",
      "PNY",
    ],
  },
  motherboard: {
    Brand: ["MSI", "ASUS", "Gigabyte"],
    "Supported Socket": ["LGA 1700", "AM5", "LGA 1200", "AM4"],
    "Supported Memory": ["DDR4", "DDR5"],
    "Form Factor": ["ATX", "Micro-ATX", "Extended-ATX"],
  },
  case: {
    Brand: [
      "NZXT",
      "Gigabyte",
      "Cooler Master",
      "HOOD",
      "ARKTEK",
      "Techno Zone",
      "Redragon",
      "ASUS",
      "XANDER",
      "Fractal Design",
      "SilverStone",
      "Antec",
      "Xigmatek",
      "Lian Li",
      "be quiet!",
    ],
    "Case Size": ["Full Tower", "Mid Tower"],
    Color: ["Black", "White", "Grey", "Green", "Orange"],
  },
  cooler: {
    Brand: [
      "Cooler Master",
      "Redragon",
      "ASUS",
      "MSI",
      "Fractal Design",
      "Gigabyte",
    ],
    Type: ["Air", "Liquid"],
  },
  memory: {
    Brand: [
      "Crucial",
      "Kingston",
      "TeamGroup",
      "TwinMOS",
      "CORSAIR",
      "Rasalas",
      "G.Skill",
      "SK Hynix",
      "Hynix",
      "XPG",
      "A-Tech",
      "Hikvision",
      "Micron",
      "Patriot",
    ],
    "Memory Size": [
      "4GB",
      "8GB",
      "16GB",
      "32GB",
      "64GB",
      "96GB",
      "128GB",
      "256GB",
    ],
    "Memory Type": ["DDR4", "DDR5", "DDR3"],
  },
  storage: {
    Brand: [
      "ADATA",
      "Crucial",
      "Fikwot",
      "Hikvision",
      "Kingston",
      "Lexar",
      "MSI",
      "ORICO",
      "Seagate",
      "Samsung",
      "SanDisk",
      "TeamGroup",
      "Toshiba",
      "TwinMOS",
      "Western Digital",
    ],
    Capacity: [
      "128GB",
      "240GB",
      "250GB",
      "256GB",
      "480GB",
      "500GB",
      "512GB",
      "960GB",
      "1TB",
      "2TB",
      "4TB",
      "16TB",
      "18TB",
    ],
    Storage: ["HDD", "SSD"],
  },
};

const sortingCategories = {
  Price: ["Low to High", "High to Low"],
  Rating: ["Low to High", "High to Low"],
};

function Filters({
  onSortChange,
  onFilterChange,
  initialFilters = {},
  initialSort = null,
}) {
  const { type } = useParams();
  const [filterCategories, setFilterCategories] = useState({});
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]); // Default EGP range
  const [maxPrice, setMaxPrice] = useState(50000); // Default max price in EGP
  const [loading, setLoading] = useState(false);

  // Use refs to keep track of the current values without triggering re-renders
  const selectedFiltersRef = useRef(selectedFilters);
  const priceRangeRef = useRef(priceRange);

  // Update refs when values change
  useEffect(() => {
    selectedFiltersRef.current = selectedFilters;
  }, [selectedFilters]);

  useEffect(() => {
    priceRangeRef.current = priceRange;
  }, [priceRange]);

  const fetchMaxPrice = useCallback(async () => {
    if (!type || type === "all") {
      return;
    }

    try {
      setLoading(true);
      console.log(`Fetching max price for type: ${type}`);

      const { data } = await axios.get(
        `http://localhost:4000/api/components/${type}/max-price`
      );

      console.log("Max price response:", data);

      // Ensure we have a valid number, default to 50000 EGP if not
      const fetchedMaxPrice =
        data.maxPrice && !isNaN(data.maxPrice)
          ? Math.ceil(data.maxPrice)
          : 50000;

      console.log(`Setting max price to: ${fetchedMaxPrice}`);

      setMaxPrice(fetchedMaxPrice);
      setPriceRange([0, fetchedMaxPrice]);
    } catch (error) {
      console.error("Error fetching max price:", error);
      message.error("Failed to fetch price range, using default values");

      // Set default values on error
      const defaultMax = 50000;
      setMaxPrice(defaultMax);
      setPriceRange([0, defaultMax]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const clearAllFilters = useCallback(() => {
    setSelectedFilters([]);
    setSelectedSort(null);
    setPriceRange([0, maxPrice]);
    onFilterChange({});
    onSortChange(null);
  }, [onFilterChange, onSortChange, maxPrice]);

  const updateAPIFilters = useCallback(() => {
    // Get current values from refs to avoid dependency issues
    const filtersList = selectedFiltersRef.current;
    const priceRangeVal = priceRangeRef.current;

    const apiParams = {};

    // Handle standard filters
    const filtersByCategory = filtersList.reduce((acc, filter) => {
      if (!acc[filter.category]) acc[filter.category] = [];
      acc[filter.category].push(filter.value);
      return acc;
    }, {});

    Object.entries(filtersByCategory).forEach(([category, values]) => {
      switch (category) {
        case "Manufacturer":
          apiParams.manfacturer = values;
          break;
        case "Brand":
          apiParams.brand = values;
          break;
        case "Socket Type":
          apiParams.socket = values;
          break;
        case "Number of Cores":
          apiParams.cores = values;
          break;
        case "Number of Threads":
          apiParams.threads = values;
          break;
        case "Supported Socket":
          apiParams.MB_socket = values;
          break;
        case "Supported Memory":
          apiParams.supported_memory = values;
          break;
        case "Form Factor":
          apiParams.MB_form = values;
          break;
        case "Case Size":
          apiParams.case_type = values;
          break;
        case "Color":
          apiParams.color = values;
          break;
        case "Type":
          apiParams.cooling_method = values;
          break;
        case "Memory Type":
          apiParams.DDR_generation = values;
          break;
        case "Memory Size":
          apiParams.memory_size = values;
          break;
        case "Capacity":
          apiParams.size = values;
          break;
        case "Storage":
          apiParams.storage_type = values;
          break;
      }
    });

    // Handle price range - ensure we send valid numbers
    if (
      priceRangeVal &&
      Array.isArray(priceRangeVal) &&
      priceRangeVal.length === 2
    ) {
      const [minPrice, maxPriceVal] = priceRangeVal;

      // Only send price filters if they're different from the full range
      if (minPrice > 0 || maxPriceVal < maxPrice) {
        apiParams.minPrice = Math.max(0, minPrice);
        apiParams.maxPrice = Math.min(maxPrice, maxPriceVal);
      }
    }

    console.log("Sending API params:", apiParams);
    onFilterChange(apiParams);
  }, [onFilterChange, maxPrice]);

  const handleCheckboxChange = useCallback(
    (category, value, checked) => {
      setSelectedFilters((prev) => {
        const updated = checked
          ? [...prev, { category, value }]
          : prev.filter((f) => !(f.category === category && f.value === value));

        // Schedule updateAPIFilters to run on next tick
        setTimeout(updateAPIFilters, 0);
        return updated;
      });
    },
    [updateAPIFilters]
  );

  const handlePriceSliderChange = useCallback(
    (range) => {
      console.log("Price slider changed to:", range);

      // Ensure range is valid
      if (!Array.isArray(range) || range.length !== 2) {
        console.error("Invalid price range:", range);
        return;
      }

      const [min, max] = range;

      // Validate the range values
      if (isNaN(min) || isNaN(max) || min < 0 || max > maxPrice || min > max) {
        console.error("Invalid price range values:", { min, max, maxPrice });
        return;
      }

      setPriceRange(range);
      // Use a small timeout to break potential update loops
      setTimeout(updateAPIFilters, 100);
    },
    [updateAPIFilters, maxPrice]
  );

  const handleRemoveFilter = useCallback(
    (category, value) => {
      handleCheckboxChange(category, value, false);
    },
    [handleCheckboxChange]
  );

  const handleRemovePriceFilter = useCallback(() => {
    console.log("Removing price filter, resetting to:", [0, maxPrice]);
    setPriceRange([0, maxPrice]);
    // Schedule updateAPIFilters to run on next tick
    setTimeout(updateAPIFilters, 100);
  }, [maxPrice, updateAPIFilters]);

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

  // Initialize max price when component mounts or type changes
  useEffect(() => {
    console.log("Type changed to:", type);
    if (type && type !== "all") {
      fetchMaxPrice();
    } else {
      // Reset to defaults for "all" type
      const defaultMax = 50000;
      setMaxPrice(defaultMax);
      setPriceRange([0, defaultMax]);
    }
  }, [type, fetchMaxPrice]);

  useEffect(() => {
    const componentType = type?.toLowerCase();
    if (componentType === "all") {
      setFilterCategories({});
    } else {
      setFilterCategories(COMPONENT_FILTERS[componentType] || {});
    }
    clearAllFilters();
  }, [type, clearAllFilters]);

  useEffect(() => {
    if (Object.keys(initialFilters).length === 0) {
      setSelectedFilters([]);
      setPriceRange([0, maxPrice]);
    }
    if (!initialSort) {
      setSelectedSort(null);
    }
  }, [initialFilters, initialSort, maxPrice]);

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
              className={`sort-option ${isSelected ? "selected" : ""}`}
              onClick={() => handleSortChange(category, option)}
            >
              {option}
            </div>
          ),
        };
      }),
    })
  );

  const isPriceFilterActive =
    Array.isArray(priceRange) &&
    priceRange.length === 2 &&
    (priceRange[0] > 0 || priceRange[1] < maxPrice);

  return (
    <div className="filter_container">
      <div className="filter_main">
        <div className="filters_headers">
          <div className="filter_firstHeader">
            <MdFilterAlt />
            <h3>Filters</h3>
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
                    Price: EGP {priceRange[0]?.toLocaleString() || 0} - EGP{" "}
                    {priceRange[1]?.toLocaleString() || maxPrice}
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
          {type?.toLowerCase() !== "all" && (
            <Menu mode="inline" items={filterItems} />
          )}
          <div className="filter_divider" />
          <div className="filter_sorting">
            <h3>Sort By</h3>
            <Menu mode="inline" items={sortingItems} />
          </div>
          <div className="filter_divider" />
          <div className="filter_price_slider">
            <h4>Price Range </h4>

            <Slider
              range
              step={100} // Increased step for EGP
              min={0}
              max={maxPrice}
              value={priceRange}
              onChange={handlePriceSliderChange}
              className="custom-slider"
              disabled={loading}
              tooltip={{
                formatter: (value) => `EGP ${value?.toLocaleString() || 0}`,
              }}
            />
            {loading && (
              <div className="price-loader">Loading price range...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filters;
