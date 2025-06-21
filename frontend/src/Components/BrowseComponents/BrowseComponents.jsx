// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useRef,
// } from "react";
// import {
//   useParams,
//   useSearchParams,
//   useNavigate,
//   useLocation,
// } from "react-router-dom";
// import { Pagination, Alert } from "antd";
// import NestedNavBar from "../NestedNavBar/NestedNavBar";
// import Filters from "../Filters/BrowseFilters";
// import axios from "axios";
// import "./BrowseComponents.css";
// import { SavedComponentsContext } from "../../Context/SavedComponentContext";
// import ComponentList from "../BrowseComponentList/BrowseComponentList";
// import ComparsionModal from "../ComparisonModal/ComparisonModal.jsx";

// function BrowseComponents() {
//   const { type = "all" } = useParams();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Core state
//   const [components, setComponents] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     pageSize: 15,
//     totalCount: 0,
//     totalPages: 0,
//     hasNextPage: false,
//     hasPrevPage: false,
//   });

//   // Filter and sort state
//   const [filters, setFilters] = useState({});
//   const [sortBy, setSortBy] = useState(null);

//   // Comparison state
//   const [compareList, setCompareList] = useState([]);
//   const [showComparison, setShowComparison] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);
//   const [productsToCompare, setProductsToCompare] = useState([]);

//   const { savedComponents } = useContext(SavedComponentsContext);

//   // Get current page from URL
//   const currentPage = Math.max(1, parseInt(searchParams.get("page")) || 1);

//   // Refs to prevent infinite loops and track state
//   const prevTypeRef = useRef(type);
//   const prevFiltersRef = useRef(filters);
//   const prevSortByRef = useRef(sortBy);
//   const hasInitialized = useRef(false);
//   const currentRequestRef = useRef(null);

//   // Fetch components function with request cancellation
//   const fetchComponents = useCallback(
//     async (page, currentFilters, currentSort) => {
//       // Cancel previous request if it exists
//       if (currentRequestRef.current) {
//         currentRequestRef.current.cancel?.();
//       }

//       setIsLoading(true);

//       try {
//         const params = {
//           page: page,
//           pageSize: 15,
//           ...currentFilters,
//         };

//         if (currentSort) {
//           params.sortBy = currentSort;
//         }

//         // Create cancellation token
//         const cancelTokenSource = axios.CancelToken.source();
//         currentRequestRef.current = cancelTokenSource;

//         const { data } = await axios.get(
//           `http://localhost:4000/api/components/${type}`,
//           {
//             params,
//             cancelToken: cancelTokenSource.token,
//           }
//         );

//         // Clear the request reference after successful completion
//         currentRequestRef.current = null;

//         if (data.components && data.pagination) {
//           setComponents(data.components);
//           setPagination(data.pagination);
//         } else if (Array.isArray(data)) {
//           // Fallback for old API response format
//           setComponents(data);
//           setPagination({
//             currentPage: page,
//             pageSize: 15,
//             totalCount: data.length,
//             totalPages: Math.ceil(data.length / 15),
//             hasNextPage: page < Math.ceil(data.length / 15),
//             hasPrevPage: page > 1,
//           });
//         }

//         // Save current state to sessionStorage
//         const stateToSave = {
//           filters: currentFilters,
//           sortBy: currentSort,
//           currentPage: page,
//         };
//         sessionStorage.setItem(
//           `browseState-${type}`,
//           JSON.stringify(stateToSave)
//         );
//       } catch (error) {
//         // Clear the request reference
//         currentRequestRef.current = null;

//         if (axios.isCancel(error)) {
//           return; // Don't update state for cancelled requests
//         }

//         console.error("Error fetching components:", error);
//         setComponents([]);
//         setPagination({
//           currentPage: page,
//           pageSize: 15,
//           totalCount: 0,
//           totalPages: 0,
//           hasNextPage: false,
//           hasPrevPage: false,
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [type]
//   );

//   // Handle type changes
//   useEffect(() => {
//     if (prevTypeRef.current !== type) {
//       // Reset all state when type changes
//       setFilters({});
//       setSortBy(null);
//       setCompareList([]);
//       setComponents([]);
//       hasInitialized.current = false;

//       // Reset to page 1
//       const newSearchParams = new URLSearchParams();
//       newSearchParams.set("page", "1");
//       setSearchParams(newSearchParams, { replace: true });

//       prevTypeRef.current = type;
//     }
//   }, [type, setSearchParams]);

//   // Initialize state when component mounts or returns from detail view
//   useEffect(() => {
//     if (!hasInitialized.current) {
//       const returnState = location.state?.browseState;
//       const returnPage = location.state?.fromPage;

//       if (returnState && returnPage) {
//         // Restore from navigation state
//         setFilters(returnState.filters || {});
//         setSortBy(returnState.sortBy || null);

//         // Update URL if needed
//         if (returnPage !== currentPage) {
//           const newSearchParams = new URLSearchParams();
//           newSearchParams.set("page", returnPage.toString());
//           setSearchParams(newSearchParams, { replace: true });
//         }
//       } else {
//         // Try to restore from sessionStorage
//         const savedState = sessionStorage.getItem(`browseState-${type}`);
//         if (savedState) {
//           try {
//             const parsedState = JSON.parse(savedState);
//             setFilters(parsedState.filters || {});
//             setSortBy(parsedState.sortBy || null);

//             // Update URL if needed
//             if (
//               parsedState.currentPage &&
//               parsedState.currentPage !== currentPage
//             ) {
//               const newSearchParams = new URLSearchParams();
//               newSearchParams.set("page", parsedState.currentPage.toString());
//               setSearchParams(newSearchParams, { replace: true });
//             }
//           } catch (error) {
//             console.error("Error parsing saved state:", error);
//             sessionStorage.removeItem(`browseState-${type}`);
//           }
//         }
//       }

//       hasInitialized.current = true;
//     }
//   }, [type, currentPage, location.state, setSearchParams]);

//   // Main data fetching effect
//   useEffect(() => {
//     if (hasInitialized.current) {
//       // Check if filters or sort actually changed
//       const filtersChanged =
//         JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
//       const sortChanged = sortBy !== prevSortByRef.current;

//       if (filtersChanged || sortChanged) {
//         // Reset to page 1 if filters or sort changed
//         if (currentPage !== 1) {
//           const newSearchParams = new URLSearchParams();
//           newSearchParams.set("page", "1");
//           setSearchParams(newSearchParams, { replace: true });
//           return; // Don't fetch yet, wait for page change
//         }
//       }

//       fetchComponents(currentPage, filters, sortBy);
//       prevFiltersRef.current = filters;
//       prevSortByRef.current = sortBy;
//     }
//   }, [currentPage, filters, sortBy, fetchComponents, setSearchParams]);

//   // Cleanup effect to cancel requests when component unmounts
//   useEffect(() => {
//     return () => {
//       if (currentRequestRef.current) {
//         currentRequestRef.current.cancel?.();
//       }
//     };
//   }, []);

//   // Handle page changes
//   const handlePageChange = useCallback(
//     (newPage) => {
//       if (newPage === currentPage) return;

//       // Update URL
//       const newSearchParams = new URLSearchParams();
//       newSearchParams.set("page", newPage.toString());
//       setSearchParams(newSearchParams);

//       // Scroll to top
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     },
//     [currentPage, setSearchParams]
//   );

//   // Handle filter changes
//   const handleFilterChange = useCallback((newFilters) => {
//     setFilters(newFilters);
//   }, []);

//   // Handle sort changes
//   const handleSortChange = useCallback((newSort) => {
//     setSortBy(newSort);
//   }, []);

//   // Handle component click
//   const handleComponentClick = useCallback(
//     (component) => {
//       const currentState = {
//         filters,
//         sortBy,
//       };

//       navigate(`/components/${type}/${component._id}`, {
//         state: {
//           fromPage: currentPage,
//           browseState: currentState,
//         },
//       });
//     },
//     [navigate, type, currentPage, filters, sortBy]
//   );

//   // Comparison functions
//   const toggleCompare = useCallback(
//     (id) => {
//       setCompareList((prev) => {
//         let newList;
//         if (prev.includes(id)) {
//           newList = prev.filter((comp) => comp !== id);
//           setShowAlert(false);
//         } else {
//           newList = [...prev, id];
//           if (newList.length === 1) {
//             setShowAlert(true);
//           } else {
//             setShowAlert(false);
//           }
//         }

//         if (newList.length === 2) {
//           const product1 = components.find((c) => c._id === newList[0]);
//           const product2 = components.find((c) => c._id === newList[1]);
//           if (product1 && product2) {
//             setProductsToCompare([product1, product2]);
//             setShowComparison(true);
//           }
//         }

//         return newList;
//       });
//     },
//     [components]
//   );

//   const closeComparisonModal = useCallback(() => {
//     setShowComparison(false);
//     setCompareList([]);
//   }, []);

//   // Auto-dismiss alert
//   useEffect(() => {
//     let timer;
//     if (showAlert) {
//       timer = setTimeout(() => setShowAlert(false), 5000);
//     }
//     return () => clearTimeout(timer);
//   }, [showAlert]);

//   return (
//     <div className="browsecomponents_container">
//       <div className="browsecomponents_filter">
//         <Filters
//           onSortChange={handleSortChange}
//           onFilterChange={handleFilterChange}
//           initialFilters={filters}
//           initialSort={sortBy}
//         />
//       </div>

//       <div className="browsecomponents_main">
//         <div className="browsecomponents_nav">
//           <NestedNavBar />
//         </div>

//         <div className="browsecomponents_products">
//           <ComponentList
//             components={components}
//             compareList={compareList}
//             toggleCompare={toggleCompare}
//             isLoading={isLoading}
//             onComponentClick={handleComponentClick}
//           />
//         </div>

//         <div className="browsecomponents_pagination">
//           <Pagination
//             align="end"
//             current={currentPage}
//             pageSize={pagination.pageSize}
//             total={pagination.totalCount}
//             onChange={handlePageChange}
//             showSizeChanger={false}
//             disabled={isLoading}
//             showQuickJumper
//             showTotal={(total, range) =>
//               `${range[0]}-${range[1]} of ${total} components`
//             }
//           />
//         </div>
//       </div>

//       {showComparison && (
//         <ComparsionModal
//           products={productsToCompare}
//           onClose={closeComparisonModal}
//         />
//       )}

//       {showAlert && (
//         <div className="alert-bottom">
//           <Alert
//             message="Please select a second component to compare with"
//             type="info"
//             showIcon
//             closable
//             onClose={() => setShowAlert(false)}
//             style={{
//               position: "relative",
//               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
//               minWidth: "300px",
//             }}
//           />
//           <div className="alert-progress" />
//         </div>
//       )}
//     </div>
//   );
// }

// export default BrowseComponents;
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Pagination, Alert } from "antd";
import NestedNavBar from "../NestedNavBar/NestedNavBar";
import Filters from "../Filters/BrowseFilters";
import axios from "axios";
import "./BrowseComponents.css";
import { SavedComponentsContext } from "../../Context/SavedComponentContext";
import { useNavigation } from "../../Context/NavigationContext";
import ComponentList from "../BrowseComponentList/BrowseComponentList";
import ComparsionModal from "../ComparisonModal/ComparisonModal.jsx";
import { CiSearch } from "react-icons/ci";

function BrowseComponents() {
  const { type = "all" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateToComponentDetail } = useNavigation();

  // Core state
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 15,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter, sort, and search state
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Comparison state
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [productsToCompare, setProductsToCompare] = useState([]);

  const { savedComponents } = useContext(SavedComponentsContext);

  // Get current page and search from URL
  const currentPage = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const urlSearchQuery = searchParams.get("q") || "";

  // Refs to prevent infinite loops and track state
  const prevTypeRef = useRef(type);
  const prevFiltersRef = useRef(filters);
  const prevSortByRef = useRef(sortBy);
  const prevSearchQueryRef = useRef(searchQuery);
  const hasInitialized = useRef(false);
  const currentRequestRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Fetch components function with search support
  const fetchComponents = useCallback(
    async (page, currentFilters, currentSort, currentSearchQuery) => {
      // Cancel previous request if it exists
      if (currentRequestRef.current) {
        currentRequestRef.current.cancel?.();
      }

      setIsLoading(true);

      try {
        const params = {
          page: page,
          pageSize: 15,
          ...currentFilters,
        };

        if (currentSort) {
          params.sortBy = currentSort;
        }

        // Add search query parameter
        if (currentSearchQuery && currentSearchQuery.trim()) {
          params.q = currentSearchQuery.trim();
        }

        // Create cancellation token
        const cancelTokenSource = axios.CancelToken.source();
        currentRequestRef.current = cancelTokenSource;

        // Use search endpoint instead of regular browse endpoint
        const endpoint =
          currentSearchQuery && currentSearchQuery.trim()
            ? `http://localhost:4000/api/search/${type}`
            : `http://localhost:4000/api/components/${type}`;

        const { data } = await axios.get(endpoint, {
          params,
          cancelToken: cancelTokenSource.token,
        });

        // Clear the request reference after successful completion
        currentRequestRef.current = null;

        // Handle search API response format
        if (currentSearchQuery && currentSearchQuery.trim()) {
          if (data.success && data.components) {
            setComponents(data.components);
            // Create pagination for search results
            const totalResults = data.totalResults || data.components.length;
            setPagination({
              currentPage: page,
              pageSize: 15,
              totalCount: totalResults,
              totalPages: Math.ceil(totalResults / 15),
              hasNextPage: page < Math.ceil(totalResults / 15),
              hasPrevPage: page > 1,
            });
          } else {
            setComponents([]);
            setPagination({
              currentPage: page,
              pageSize: 15,
              totalCount: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: false,
            });
          }
        } else {
          // Handle regular browse API response
          if (data.components && data.pagination) {
            setComponents(data.components);
            setPagination(data.pagination);
          } else if (Array.isArray(data)) {
            // Fallback for old API response format
            setComponents(data);
            setPagination({
              currentPage: page,
              pageSize: 15,
              totalCount: data.length,
              totalPages: Math.ceil(data.length / 15),
              hasNextPage: page < Math.ceil(data.length / 15),
              hasPrevPage: page > 1,
            });
          }
        }

        // Save current state to sessionStorage
        const stateToSave = {
          filters: currentFilters,
          sortBy: currentSort,
          searchQuery: currentSearchQuery,
          currentPage: page,
        };
        sessionStorage.setItem(
          `browseState-${type}`,
          JSON.stringify(stateToSave)
        );
      } catch (error) {
        // Clear the request reference
        currentRequestRef.current = null;

        if (axios.isCancel(error)) {
          return; // Don't update state for cancelled requests
        }

        console.error("Error fetching components:", error);
        setComponents([]);
        setPagination({
          currentPage: page,
          pageSize: 15,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [type]
  );

  // Handle type changes
  useEffect(() => {
    if (prevTypeRef.current !== type) {
      // Reset all state when type changes
      setFilters({});
      setSortBy(null);
      setSearchQuery("");
      setSearchInput("");
      setCompareList([]);
      setComponents([]);
      hasInitialized.current = false;

      // Reset to page 1 and clear search
      const newSearchParams = new URLSearchParams();
      newSearchParams.set("page", "1");
      setSearchParams(newSearchParams, { replace: true });

      prevTypeRef.current = type;
    }
  }, [type, setSearchParams]);

  // Initialize state when component mounts or returns from detail view
  useEffect(() => {
    if (!hasInitialized.current) {
      const returnState = location.state?.browseState;
      const returnPage = location.state?.fromPage;
      const scrollPosition = location.state?.scrollPosition;

      if (returnState && returnPage) {
        // Restore from navigation state
        setFilters(returnState.filters || {});
        setSortBy(returnState.sortBy || null);
        setSearchQuery(returnState.searchQuery || "");
        setSearchInput(returnState.searchQuery || "");

        // Update URL if needed
        if (returnPage !== currentPage) {
          const newSearchParams = new URLSearchParams();
          newSearchParams.set("page", returnPage.toString());
          if (returnState.searchQuery) {
            newSearchParams.set("q", returnState.searchQuery);
          }
          setSearchParams(newSearchParams, { replace: true });
        }

        // Restore scroll position after data loads
        if (scrollPosition) {
          setTimeout(() => {
            window.scrollTo({ top: scrollPosition, behavior: "smooth" });
          }, 100);
        }
      } else {
        // Initialize from URL parameters
        if (urlSearchQuery) {
          setSearchQuery(urlSearchQuery);
          setSearchInput(urlSearchQuery);
        }

        // Try to restore from sessionStorage
        const savedState = sessionStorage.getItem(`browseState-${type}`);
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            setFilters(parsedState.filters || {});
            setSortBy(parsedState.sortBy || null);

            // Only restore search if not already set from URL
            if (!urlSearchQuery && parsedState.searchQuery) {
              setSearchQuery(parsedState.searchQuery);
              setSearchInput(parsedState.searchQuery);
            }

            // Update URL if needed
            if (
              parsedState.currentPage &&
              parsedState.currentPage !== currentPage
            ) {
              const newSearchParams = new URLSearchParams();
              newSearchParams.set("page", parsedState.currentPage.toString());
              if (parsedState.searchQuery) {
                newSearchParams.set("q", parsedState.searchQuery);
              }
              setSearchParams(newSearchParams, { replace: true });
            }
          } catch (error) {
            console.error("Error parsing saved state:", error);
            sessionStorage.removeItem(`browseState-${type}`);
          }
        }
      }

      hasInitialized.current = true;
    }
  }, [type, currentPage, urlSearchQuery, location.state, setSearchParams]);

  // Main data fetching effect
  useEffect(() => {
    if (hasInitialized.current) {
      // Check if filters, sort, or search actually changed
      const filtersChanged =
        JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
      const sortChanged = sortBy !== prevSortByRef.current;
      const searchChanged = searchQuery !== prevSearchQueryRef.current;

      if (filtersChanged || sortChanged || searchChanged) {
        // Reset to page 1 if filters, sort, or search changed
        if (currentPage !== 1) {
          const newSearchParams = new URLSearchParams();
          newSearchParams.set("page", "1");
          if (searchQuery) {
            newSearchParams.set("q", searchQuery);
          }
          setSearchParams(newSearchParams, { replace: true });
          return; // Don't fetch yet, wait for page change
        }
      }

      fetchComponents(currentPage, filters, sortBy, searchQuery);
      prevFiltersRef.current = filters;
      prevSortByRef.current = sortBy;
      prevSearchQueryRef.current = searchQuery;
    }
  }, [
    currentPage,
    filters,
    sortBy,
    searchQuery,
    fetchComponents,
    setSearchParams,
  ]);

  // Cleanup effect to cancel requests when component unmounts
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.cancel?.();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle search input changes with debouncing
  const handleSearchInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchInput(value);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search for 500ms
      searchTimeoutRef.current = setTimeout(() => {
        setSearchQuery(value);

        // Update URL with search query
        const newSearchParams = new URLSearchParams();
        newSearchParams.set("page", "1");
        if (value.trim()) {
          newSearchParams.set("q", value.trim());
        }
        setSearchParams(newSearchParams);
      }, 500);
    },
    [setSearchParams]
  );

  // Handle search button click
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Clear timeout if user clicks search button
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      setSearchQuery(searchInput);

      // Update URL with search query
      const newSearchParams = new URLSearchParams();
      newSearchParams.set("page", "1");
      if (searchInput.trim()) {
        newSearchParams.set("q", searchInput.trim());
      }
      setSearchParams(newSearchParams);
    },
    [searchInput, setSearchParams]
  );

  // Handle page changes
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage === currentPage) return;

      // Update URL
      const newSearchParams = new URLSearchParams();
      newSearchParams.set("page", newPage.toString());
      if (searchQuery) {
        newSearchParams.set("q", searchQuery);
      }
      setSearchParams(newSearchParams);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentPage, searchQuery, setSearchParams]
  );

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Handle sort changes
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
  }, []);

  // Handle component click using navigation context
  const handleComponentClick = useCallback(
    (component) => {
      navigateToComponentDetail(component, {
        sourcePage: "browse",
        type: type,
        currentPage: currentPage,
        filters: filters,
        sortBy: sortBy,
        searchQuery: searchQuery,
        scrollPosition: window.pageYOffset,
      });
    },
    [navigateToComponentDetail, type, currentPage, filters, sortBy, searchQuery]
  );

  // Comparison functions
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

  // Auto-dismiss alert
  useEffect(() => {
    let timer;
    if (showAlert) {
      timer = setTimeout(() => setShowAlert(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [showAlert]);

  return (
    <div className="browsecomponents_container">
      <div className="browsecomponents_filter">
        <Filters
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          initialSort={sortBy}
        />
      </div>

      <div className="browsecomponents_main">
        <div className="browsecomponents_nav">
          <NestedNavBar />
        </div>

        <form
          className="browsecomponents_search-container"
          onSubmit={handleSearchSubmit}
        >
          <input
            type="text"
            placeholder={`Search ${type === "all" ? "components" : type}...`}
            className="browsecomponents_search-input"
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          <button type="submit" className="browsecomponents_search-button">
            <CiSearch size={20} />
          </button>
        </form>

        {searchQuery && (
          <div className="browsecomponents_search-info">
            <p>
              Showing results for "{searchQuery}"
              {components.length > 0 && ` (${pagination.totalCount} found)`}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchInput("");
                  const newSearchParams = new URLSearchParams();
                  newSearchParams.set("page", "1");
                  setSearchParams(newSearchParams);
                }}
                className="clear-search-btn"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        <div className="browsecomponents_products">
          <ComponentList
            components={components}
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
            pageSize={pagination.pageSize}
            total={pagination.totalCount}
            onChange={handlePageChange}
            showSizeChanger={false}
            disabled={isLoading}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} ${
                searchQuery ? "results" : "components"
              }`
            }
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
