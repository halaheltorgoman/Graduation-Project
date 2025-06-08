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

  // Filter and sort state
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(null);

  // Comparison state
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [productsToCompare, setProductsToCompare] = useState([]);

  const { savedComponents } = useContext(SavedComponentsContext);

  // Get current page from URL
  const currentPage = Math.max(1, parseInt(searchParams.get("page")) || 1);

  // Refs to prevent infinite loops and track state
  const prevTypeRef = useRef(type);
  const prevFiltersRef = useRef(filters);
  const prevSortByRef = useRef(sortBy);
  const hasInitialized = useRef(false);
  const currentRequestRef = useRef(null);

  // Fetch components function with request cancellation
  const fetchComponents = useCallback(
    async (page, currentFilters, currentSort) => {
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

        // Create cancellation token
        const cancelTokenSource = axios.CancelToken.source();
        currentRequestRef.current = cancelTokenSource;

        const { data } = await axios.get(
          `http://localhost:4000/api/components/${type}`,
          {
            params,
            cancelToken: cancelTokenSource.token,
          }
        );

        // Clear the request reference after successful completion
        currentRequestRef.current = null;

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

        // Save current state to sessionStorage
        const stateToSave = {
          filters: currentFilters,
          sortBy: currentSort,
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
      setCompareList([]);
      setComponents([]);
      hasInitialized.current = false;

      // Reset to page 1
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

        // Update URL if needed
        if (returnPage !== currentPage) {
          const newSearchParams = new URLSearchParams();
          newSearchParams.set("page", returnPage.toString());
          setSearchParams(newSearchParams, { replace: true });
        }

        // Restore scroll position after data loads
        if (scrollPosition) {
          setTimeout(() => {
            window.scrollTo({ top: scrollPosition, behavior: "smooth" });
          }, 100);
        }
      } else {
        // Try to restore from sessionStorage
        const savedState = sessionStorage.getItem(`browseState-${type}`);
        if (savedState) {
          try {
            const parsedState = JSON.parse(savedState);
            setFilters(parsedState.filters || {});
            setSortBy(parsedState.sortBy || null);

            // Update URL if needed
            if (
              parsedState.currentPage &&
              parsedState.currentPage !== currentPage
            ) {
              const newSearchParams = new URLSearchParams();
              newSearchParams.set("page", parsedState.currentPage.toString());
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
  }, [type, currentPage, location.state, setSearchParams]);

  // Main data fetching effect
  useEffect(() => {
    if (hasInitialized.current) {
      // Check if filters or sort actually changed
      const filtersChanged =
        JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
      const sortChanged = sortBy !== prevSortByRef.current;

      if (filtersChanged || sortChanged) {
        // Reset to page 1 if filters or sort changed
        if (currentPage !== 1) {
          const newSearchParams = new URLSearchParams();
          newSearchParams.set("page", "1");
          setSearchParams(newSearchParams, { replace: true });
          return; // Don't fetch yet, wait for page change
        }
      }

      fetchComponents(currentPage, filters, sortBy);
      prevFiltersRef.current = filters;
      prevSortByRef.current = sortBy;
    }
  }, [currentPage, filters, sortBy, fetchComponents, setSearchParams]);

  // Cleanup effect to cancel requests when component unmounts
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.cancel?.();
      }
    };
  }, []);

  // Handle page changes
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage === currentPage) return;

      // Update URL
      const newSearchParams = new URLSearchParams();
      newSearchParams.set("page", newPage.toString());
      setSearchParams(newSearchParams);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentPage, setSearchParams]
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
        scrollPosition: window.pageYOffset,
      });
    },
    [navigateToComponentDetail, type, currentPage, filters, sortBy]
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
        <div className="browsecomponents_search-container">
          <input
            type="text"
            placeholder="Search components..."
            className="browsecomponents_search-input"
          />
          <button className="browsecomponents_search-button">
            <CiSearch size={20} />
          </button>
        </div>
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
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} components`
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
