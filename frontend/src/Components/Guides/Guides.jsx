import React, { useState, useCallback, useEffect } from "react";
import "./Guides.css";
import GuidesFilters from "../Filters/GuidesFilters";
import { Spin, notification } from "antd";
import GuidesNavbar from "./GuidesNavbar";

function Guides() {
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({});
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch guides when filters or sort changes
  useEffect(() => {}, [sortBy, filters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    setSortBy(sortValue);
    setPage(1);
  }, []);

  return (
    <div className="guides_container">
      <div className="guides_filters">
        <GuidesFilters
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          initialFilters={filters}
          initialSort={sortBy}
        />
      </div>
      <div className="guides_main">
        <div className="browsecomponents_nav">
          <GuidesNavbar />
        </div>
      </div>
    </div>
  );
}

export default Guides;
