import React, { useState, useCallback } from "react";
import { MdFilterAlt } from "react-icons/md";
import { Menu, Tag } from "antd";
import "./Filters.css";

const sortingCategories = {
  Rating: ["rating-desc", "rating-asc"],
  Price: ["price-desc", "price-asc"],
};

function GuidesFilters({
  onSortChange,
  onFilterChange,
  initialFilters = {},
  initialSort = "newest", // Default to newest
}) {
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedFilters, setSelectedFilters] = useState(
    Object.entries(initialFilters).map(([type, value]) => ({ type, value }))
  );

  const clearAllFilters = useCallback(() => {
    setSelectedFilters([]);
    setSelectedSort("newest"); // Reset to default
    onFilterChange({});
    onSortChange("newest");
  }, [onFilterChange, onSortChange]);

  const handleSortChange = useCallback(
    (value) => {
      setSelectedSort(value);

      // FIXED: Map frontend sort values to backend expected values
      let backendSortValue;
      switch (value) {
        case "rating-desc":
          backendSortValue = "rating"; // Backend expects "rating" for highest rated
          break;
        case "rating-asc":
          backendSortValue = "rating-asc"; // Add support for ascending rating
          break;
        case "price-desc":
          backendSortValue = "price-desc";
          break;
        case "price-asc":
          backendSortValue = "price-asc";
          break;
        default:
          backendSortValue = "newest";
      }

      console.log("Frontend sort value:", value);
      console.log("Backend sort value:", backendSortValue);

      onSortChange(backendSortValue);
    },
    [onSortChange]
  );

  const handleFilterChange = useCallback(
    (filterType, value) => {
      setSelectedFilters((prev) => {
        const updated = [...prev];
        const existingIndex = updated.findIndex((f) => f.type === filterType);

        if (existingIndex >= 0) {
          updated[existingIndex].value = value;
        } else {
          updated.push({ type: filterType, value });
        }

        const filtersObj = updated.reduce((acc, curr) => {
          acc[curr.type] = curr.value;
          return acc;
        }, {});

        onFilterChange(filtersObj);
        return updated;
      });
    },
    [onFilterChange]
  );

  const handleRemoveFilter = useCallback(
    (filterType) => {
      setSelectedFilters((prev) => {
        const updated = prev.filter((f) => f.type !== filterType);
        const filtersObj = updated.reduce((acc, curr) => {
          acc[curr.type] = curr.value;
          return acc;
        }, {});

        onFilterChange(filtersObj);
        return updated;
      });
    },
    [onFilterChange]
  );

  const sortingItems = Object.entries(sortingCategories).map(
    ([category, options]) => ({
      key: category,
      label: category,
      children: options.map((option) => {
        const isSelected = selectedSort === option;
        const labelText =
          option === "price-desc"
            ? "Highest Price"
            : option === "price-asc"
            ? "Lowest Price"
            : option === "rating-desc"
            ? "Highest Rated"
            : "Lowest Rated";

        return {
          key: option,
          label: (
            <div
              className={`sort-option ${isSelected ? "selected" : ""}`}
              onClick={() => handleSortChange(option)}
            >
              {labelText}
            </div>
          ),
        };
      }),
    })
  );

  const getSortDisplayText = (sortValue) => {
    switch (sortValue) {
      case "rating-desc":
        return "Highest Rated";
      case "rating-asc":
        return "Lowest Rated";
      case "price-desc":
        return "Highest Price";
      case "price-asc":
        return "Lowest Price";
      default:
        return "Newest";
    }
  };

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
            {selectedFilters.length === 0 && selectedSort === "newest" ? (
              <p>All</p>
            ) : (
              <>
                {selectedFilters.map(({ type, value }) => (
                  <Tag
                    key={`${type}-${value}`}
                    closable
                    onClose={() => handleRemoveFilter(type)}
                  >
                    {`${type}: ${value}`}
                  </Tag>
                ))}

                {selectedSort && selectedSort !== "newest" && (
                  <Tag
                    closable
                    onClose={() => {
                      setSelectedSort("newest");
                      onSortChange("newest");
                    }}
                  >
                    {getSortDisplayText(selectedSort)}
                  </Tag>
                )}
              </>
            )}
          </div>
        </div>

        <div className="filter_secondary">
          <div className="filter_sorting">
            <h3>Sort By</h3>
            <Menu mode="inline" items={sortingItems} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuidesFilters;
