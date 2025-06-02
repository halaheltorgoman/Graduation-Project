import React, { useState, useEffect, useCallback } from "react";
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

    // "Memory Type": ["GDDR5", "GDDR6", "GDDR6X"],
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
  },
};

const sortingCategories = {
  Price: ["Low to High", "High to Low"],
  Rating: ["Low to High", "High to Low"],
};

function BrowseFilters({
  onSortChange,
  onFilterChange,
  initialFilters = {},
  initialSort = null,
}) {
  const { type } = useParams();
  const [filterCategories, setFilterCategories] = useState({});
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [loading, setLoading] = useState(false);

  const fetchMaxPrice = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:4000/api/components/${type}/max-price`
      );
      setMaxPrice(data.maxPrice || 1000);
      setPriceRange([0, data.maxPrice || 1000]);
    } catch (error) {
      message.error("Failed to fetch price range");
      console.error("Error fetching max price:", error);
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

  const updateAPIFilters = useCallback(
    (filtersList, priceRangeVal) => {
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
            apiParams.manufacturer = values;
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
        }
      });

      // Handle price range
      if (priceRangeVal && Array.isArray(priceRangeVal)) {
        apiParams.minPrice = priceRangeVal[0];
        apiParams.maxPrice = priceRangeVal[1];
      }

      onFilterChange(apiParams);
    },
    [onFilterChange]
  );

  const handleCheckboxChange = useCallback(
    (category, value, checked) => {
      setSelectedFilters((prev) => {
        const updated = checked
          ? [...prev, { category, value }]
          : prev.filter((f) => !(f.category === category && f.value === value));
        updateAPIFilters(updated, priceRange);
        return updated;
      });
    },
    [priceRange, updateAPIFilters]
  );

  const handlePriceSliderChange = useCallback(
    (range) => {
      setPriceRange(range);
      updateAPIFilters(selectedFilters, range);
    },
    [selectedFilters, updateAPIFilters]
  );

  const handleRemoveFilter = useCallback(
    (category, value) => {
      handleCheckboxChange(category, value, false);
    },
    [handleCheckboxChange]
  );

  const handleRemovePriceFilter = useCallback(() => {
    setPriceRange([0, maxPrice]);
    updateAPIFilters(selectedFilters, [0, maxPrice]);
  }, [maxPrice, selectedFilters, updateAPIFilters]);

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

  useEffect(() => {
    if (type && type !== "all") {
      fetchMaxPrice();
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

export default BrowseFilters;