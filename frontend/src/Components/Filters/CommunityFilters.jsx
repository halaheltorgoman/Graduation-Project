import React, { useState, useCallback } from "react";
import { MdFilterAlt } from "react-icons/md";
import { Menu, Tag } from "antd";
import "./Filters.css";

const sortingCategories = {
  Date: ["newest", "oldest"],
  Rating: ["rating-desc", "rating-asc"],
};

function CommunityFilters({
  onSortChange,
  onFilterChange,
  initialFilters = {},
  initialSort = "newest",
}) {
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedFilters, setSelectedFilters] = useState(
    Object.entries(initialFilters).map(([type, value]) => ({ type, value }))
  );

  const clearAllFilters = useCallback(() => {
    setSelectedFilters([]);
    setSelectedSort("newest");
    onFilterChange({});
    onSortChange("newest");
  }, [onFilterChange, onSortChange]);

  const handleSortChange = useCallback(
    (value) => {
      setSelectedSort(value);
      onSortChange(value);
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
          option === "newest"
            ? "Newest First"
            : option === "oldest"
            ? "Oldest First"
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
                    {selectedSort === "oldest" && "Oldest First"}
                    {selectedSort === "rating-desc" && "Highest Rated"}
                    {selectedSort === "rating-asc" && "Lowest Rated"}
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

export default CommunityFilters;
