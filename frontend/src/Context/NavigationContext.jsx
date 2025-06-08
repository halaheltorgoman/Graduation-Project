// Context/NavigationContext.js
import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationHistory, setNavigationHistory] = useState(new Map());

  // Save current page state with enhanced data
  const savePageState = useCallback(
    (pageKey, state) => {
      setNavigationHistory((prev) => {
        const newHistory = new Map(prev);
        newHistory.set(pageKey, {
          ...state,
          timestamp: Date.now(),
          pathname: location.pathname,
          search: location.search,
        });
        return newHistory;
      });
    },
    [location.pathname, location.search]
  );

  // Get saved page state
  const getPageState = useCallback(
    (pageKey) => {
      return navigationHistory.get(pageKey) || null;
    },
    [navigationHistory]
  );

  // Clear old states (older than 30 minutes)
  const clearOldStates = useCallback(() => {
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    setNavigationHistory((prev) => {
      const newHistory = new Map();
      prev.forEach((value, key) => {
        if (value.timestamp > thirtyMinutesAgo) {
          newHistory.set(key, value);
        }
      });
      return newHistory;
    });
  }, []);

  // Generate a unique state key based on the source page
  const generateStateKey = useCallback((sourcePage, additionalData = {}) => {
    switch (sourcePage) {
      case "search":
        return "navbar-search";
      case "browse":
        return `browse-${additionalData.type || "all"}`;
      case "favorites":
        return "favorites-page";
      case "community":
        return "community-page";
      case "guides":
        return "guides-page";
      case "home":
        return "home-page";
      case "builder":
        return "builder-page";
      default:
        return `generic-${sourcePage}`;
    }
  }, []);

  // Enhanced navigation to component detail
  const navigateToComponentDetail = useCallback(
    (component, sourcePageData) => {
      const {
        sourcePage,
        currentPage,
        filters,
        sortBy,
        searchTerm,
        scrollPosition,
        additionalState,
      } = sourcePageData;

      // Generate appropriate state key
      const stateKey = generateStateKey(sourcePage, sourcePageData);

      // Save comprehensive state
      savePageState(stateKey, {
        sourcePage,
        currentPage: currentPage || 1,
        filters: filters || {},
        sortBy: sortBy || null,
        searchTerm: searchTerm || "",
        scrollPosition: scrollPosition || window.pageYOffset,
        type: sourcePageData.type,
        ...additionalState, // Allow for additional custom state
      });

      // Determine the correct component detail path
      let componentPath;
      if (component.category) {
        componentPath = `/browsecomponents/${component.category.toLowerCase()}/${
          component._id
        }`;
      } else if (component.type) {
        componentPath = `/components/${component.type}/${component._id}`;
      } else {
        componentPath = `/components/all/${component._id}`;
      }

      // Navigate with state information
      navigate(componentPath, {
        state: {
          fromNavigation: true,
          sourceStateKey: stateKey,
          componentData: component,
          sourcePageData,
        },
      });
    },
    [navigate, savePageState, generateStateKey]
  );

  // Handle back navigation from component detail
  const handleBackFromDetail = useCallback(
    (stateKey) => {
      const savedState = getPageState(stateKey);

      if (!savedState) {
        // Fallback to home if no saved state
        navigate("/");
        return { type: "fallback", redirected: true };
      }

      switch (savedState.sourcePage) {
        case "search":
          // Return to home with search restoration flag
          navigate("/", {
            state: {
              restoreSearch: true,
              searchData: {
                searchTerm: savedState.searchTerm,
                scrollPosition: savedState.scrollPosition,
              },
            },
          });
          return {
            type: "search",
            searchTerm: savedState.searchTerm,
            scrollPosition: savedState.scrollPosition,
          };

        case "browse":
          // Return to browse components with preserved state
          const browsePath =
            savedState.type && savedState.type !== "all"
              ? `/browsecomponents/${savedState.type}`
              : "/browsecomponents";

          navigate(browsePath, {
            state: {
              browseState: {
                filters: savedState.filters,
                sortBy: savedState.sortBy,
              },
              fromPage: savedState.currentPage,
              scrollPosition: savedState.scrollPosition,
              fromNavigation: true,
            },
          });
          return { type: "browse", restored: true };

        case "favorites":
          navigate("/favorites", {
            state: {
              scrollPosition: savedState.scrollPosition,
              fromNavigation: true,
            },
          });
          return { type: "favorites", restored: true };

        case "community":
          navigate("/community", {
            state: {
              scrollPosition: savedState.scrollPosition,
              fromNavigation: true,
            },
          });
          return { type: "community", restored: true };

        case "guides":
          navigate("/guides", {
            state: {
              scrollPosition: savedState.scrollPosition,
              fromNavigation: true,
            },
          });
          return { type: "guides", restored: true };

        case "home":
          navigate("/", {
            state: {
              scrollPosition: savedState.scrollPosition,
              fromNavigation: true,
            },
          });
          return { type: "home", restored: true };

        case "builder":
          navigate("/builder", {
            state: {
              scrollPosition: savedState.scrollPosition,
              fromNavigation: true,
            },
          });
          return { type: "builder", restored: true };

        default:
          // Use saved pathname if available, otherwise fallback to home
          const fallbackPath = savedState.pathname || "/";
          navigate(fallbackPath, {
            state: {
              scrollPosition: savedState.scrollPosition,
              fromNavigation: true,
            },
          });
          return { type: "generic", restored: true };
      }
    },
    [getPageState, navigate]
  );

  // Save current page state for any page (utility function)
  const saveCurrentPageState = useCallback(
    (sourcePage, customState = {}) => {
      const stateKey = generateStateKey(sourcePage, customState);
      savePageState(stateKey, {
        sourcePage,
        scrollPosition: window.pageYOffset,
        ...customState,
      });
      return stateKey;
    },
    [generateStateKey, savePageState]
  );

  // Restore scroll position utility
  const restoreScrollPosition = useCallback((scrollPosition, delay = 100) => {
    if (scrollPosition && scrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }, delay);
    }
  }, []);

  // Check if coming from navigation and handle accordingly
  const handleReturnFromNavigation = useCallback(
    (currentLocation) => {
      if (currentLocation.state?.fromNavigation) {
        const { scrollPosition } = currentLocation.state;
        restoreScrollPosition(scrollPosition);

        // Clear the navigation state to prevent repeated restoration
        window.history.replaceState(
          { ...currentLocation.state, fromNavigation: false },
          ""
        );
      }
    },
    [restoreScrollPosition]
  );

  // Clean up old states periodically
  useEffect(() => {
    const interval = setInterval(clearOldStates, 5 * 60 * 1000); // Clean every 5 minutes
    return () => clearInterval(interval);
  }, [clearOldStates]);

  // Handle page visibility to save state when user leaves
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Save current state when user is about to leave
        const currentPath = location.pathname;
        if (currentPath.includes("/browsecomponents")) {
          // This will be handled by the BrowseComponents component itself
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname]);

  const value = {
    navigateToComponentDetail,
    handleBackFromDetail,
    savePageState,
    getPageState,
    saveCurrentPageState,
    restoreScrollPosition,
    handleReturnFromNavigation,
    generateStateKey,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
