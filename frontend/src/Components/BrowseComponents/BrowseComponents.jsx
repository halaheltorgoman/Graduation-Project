import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Pagination, Alert } from "antd";
import NestedNavBar from "../NestedNavBar/NestedNavBar";
import Filters from "../Filters/BrowseFilters";
import axios from "axios";
import "./BrowseComponents.css";
import { SavedComponentsContext } from "../../Context/SavedComponentContext";
import ComponentList from "../BrowseComponentList/BrowseComponentList";
import ComparsionModal from "../ComparisonModal/ComparisonModal.jsx";

function BrowseComponents() {
  const { type = "all" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [components, setComponents] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [productsToCompare, setProductsToCompare] = useState([]);
  const { savedComponents } = useContext(SavedComponentsContext);

  const pageSize = 15;
  const currentPage = parseInt(searchParams.get("page")) || 1;

  // Auto-dismiss alert after 5 seconds
  useEffect(() => {
    let timer;
    if (showAlert) {
      timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showAlert]);

  const getComponents = useCallback(
    async (componentType) => {
      setIsLoading(true);
      try {
        const params = {
          page: currentPage,
          pageSize,
          ...filters,
        };
        if (sortBy) params.sortBy = sortBy;

        const { data } = await axios.get(
          `http://localhost:4000/api/components/${componentType}`,
          { params }
        );
        setComponents(data);
      } catch (error) {
        console.error("Error fetching components:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, filters, sortBy]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      navigate(`/browsecomponents/${type}?page=1`);
    },
    [navigate, type]
  );

  const handleSortChange = useCallback(
    (sortValue) => {
      setSortBy(sortValue);
      navigate(`/browsecomponents/${type}?page=1`);
    },
    [navigate, type]
  );

  const toggleCompare = useCallback(
    (id) => {
      setCompareList((prev) => {
        let newList;
        if (prev.includes(id)) {
          newList = prev.filter((comp) => comp !== id);
          setShowAlert(false);
        } else {
          newList = [...prev, id];

          if (newList.length === 1) {
            setShowAlert(true);
          } else {
            setShowAlert(false);
          }
        }

        if (newList.length === 2) {
          const product1 = components.find((c) => c._id === newList[0]);
          const product2 = components.find((c) => c._id === newList[1]);
          if (product1 && product2) {
            setProductsToCompare([product1, product2]);
            setShowComparison(true);
          }
        }

        return newList;
      });
    },
    [components]
  );

  const closeComparisonModal = useCallback(() => {
    setShowComparison(false);
    setCompareList([]);
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      navigate(`/browsecomponents/${type}?page=${page}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate, type]
  );

  const handleComponentClick = useCallback(
    (component) => {
      navigate(
        `/browsecomponents/${type}/${component._id}?page=${currentPage}`
      );
    },
    [navigate, type, currentPage]
  );

  useEffect(() => {
    setFilters({});
    setSortBy(null);
    navigate(`/browsecomponents/${type}?page=1`);
  }, [type, navigate]);

  useEffect(() => {
    getComponents(type);
  }, [type, getComponents]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedComponents = components.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className="browsecomponents_container">
      <div className="browsecomponents_filter">
        <Filters
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          initialFilters={filters}
          initialSort={sortBy}
        />
      </div>
      <div className="browsecomponents_main">
        <div className="browsecomponents_nav">
          <NestedNavBar />
        </div>
        <div className="browsecomponents_products">
          <ComponentList
            components={paginatedComponents}
            compareList={compareList}
            toggleCompare={toggleCompare}
            isLoading={isLoading}
            onComponentClick={handleComponentClick}
          />
        </div>
        <div className="browsecomponents_pagination">
          <Pagination
            align="end"
            current={currentPage}
            pageSize={pageSize}
            total={components.length}
            onChange={handlePageChange}
            showSizeChanger={false}
            disabled={isLoading}
          />
        </div>
      </div>

      {showComparison && (
        <ComparsionModal
          products={productsToCompare}
          onClose={closeComparisonModal}
        />
      )}

      {showAlert && (
        <div className="alert-bottom">
          <Alert
            message="Please select a second component to compare with"
            type="info"
            showIcon
            closable
            onClose={() => setShowAlert(false)}
            style={{
              position: "relative",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              minWidth: "300px",
            }}
          />
          <div className="alert-progress" />
        </div>
      )}
    </div>
  );
}

export default BrowseComponents;