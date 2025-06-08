// hooks/usePageNavigation.js
import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigation } from "../Context/NavigationContext";

/**
 * Hook to handle page navigation state management
 * @param {string} pageName - The name of the current page (e.g., 'favorites', 'community', 'guides')
 * @param {Object} options - Configuration options
 * @returns {Object} Navigation utilities
 */
export const usePageNavigation = (pageName, options = {}) => {
  const location = useLocation();
  const {
    saveCurrentPageState,
    navigateToComponentDetail,
    restoreScrollPosition,
    handleReturnFromNavigation,
  } = useNavigation();

  const {
    enableScrollRestoration = true,
    enableStateRestoration = true,
    autoSaveInterval = 30000, // 30 seconds
  } = options;

  const autoSaveIntervalRef = useRef(null);
  const currentPageDataRef = useRef({});

  // Update current page data reference
  const updateCurrentPageData = useCallback((data) => {
    currentPageDataRef.current = { ...currentPageDataRef.current, ...data };
  }, []);

  // Save current page state
  const saveCurrentState = useCallback(
    (customData = {}) => {
      const stateData = {
        scrollPosition: window.pageYOffset,
        ...currentPageDataRef.current,
        ...customData,
      };

      return saveCurrentPageState(pageName, stateData);
    },
    [pageName, saveCurrentPageState]
  );

  // Handle component click navigation
  const handleComponentClick = useCallback(
    (component, additionalData = {}) => {
      const currentState = {
        scrollPosition: window.pageYOffset,
        ...currentPageDataRef.current,
        ...additionalData,
      };

      navigateToComponentDetail(component, {
        sourcePage: pageName,
        ...currentState,
      });
    },
    [navigateToComponentDetail, pageName]
  );

  // Handle return from navigation
  useEffect(() => {
    if (enableScrollRestoration) {
      handleReturnFromNavigation(location);
    }
  }, [location, enableScrollRestoration, handleReturnFromNavigation]);

  // Auto-save state periodically
  useEffect(() => {
    if (autoSaveInterval > 0) {
      autoSaveIntervalRef.current = setInterval(() => {
        saveCurrentState();
      }, autoSaveInterval);

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [autoSaveInterval, saveCurrentState]);

  // Save state when component unmounts
  useEffect(() => {
    return () => {
      saveCurrentState();
    };
  }, [saveCurrentState]);

  // Save state when page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveCurrentState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [saveCurrentState]);

  return {
    handleComponentClick,
    saveCurrentState,
    updateCurrentPageData,
    restoreScrollPosition,
  };
};

export default usePageNavigation;
