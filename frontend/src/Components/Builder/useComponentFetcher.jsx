import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

function useComponentFetcher(type, selectedComponents, filters, sortBy) {
  const [components, setComponents] = useState([]);
  const [availableFilters, setAvailableFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchComponents = useCallback(async () => {
    // Logging for debugging
    console.log("[DEBUG] Fetching Components:", {
      type,
      selectedComponents,
      filters,
      sortBy,
    });

    // Early exit for full-build
    if (type === "full-build") {
      setIsLoading(false);
      return;
    }

    // Reset state before fetching
    setIsLoading(true);
    setComponents([]);
    setAvailableFilters({});
    setFetchError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

      // Ensure selectedComponents is an object
      const sanitizedSelectedComponents = selectedComponents || {};

      // Payload for API request
      const payload = {
        targetType: type,
        selectedComponents: sanitizedSelectedComponents,
        filters: filters || {},
        sortBy: sortBy || null,
      };

      console.log("[DEBUG] Payload being sent:", payload);

      const { data } = await axios.post(
        "http://localhost:4000/api/build/next-components",
        payload,
        {
          withCredentials: true,
          signal: controller.signal,
          timeout: 10000,
        }
      );

      // Clear timeout
      clearTimeout(timeoutId);

      // Log received data
      console.log("[DEBUG] Received Data:", data);

      // Validate and set components
      const validComponents = (data.components || []).filter(
        (comp) => comp.type === type
      );

      if (validComponents.length > 0) {
        setComponents(validComponents);
        setAvailableFilters(data.availableFilters || {});
        console.log(
          `[DEBUG] Set ${validComponents.length} components for ${type}`
        );
      } else {
        console.warn(`No components found for type: ${type}`);
        setComponents([]);
      }
    } catch (error) {
      // Detailed error logging
      console.error("[DEBUG] Full Error Object:", error);

      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("[DEBUG] Response Error:", {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers,
        });
        setFetchError(error.response.data.message || "An error occurred");
      } else if (error.request) {
        // The request was made but no response was received
        console.error("[DEBUG] Request Error:", error.request);
        setFetchError("No response received from server");
      } else {
        // Something happened in setting up the request
        console.error("[DEBUG] Error Message:", error.message);
        setFetchError(error.message || "An unexpected error occurred");
      }

      setComponents([]);
      setAvailableFilters({});
    } finally {
      setIsLoading(false);
    }
  }, [type, selectedComponents, filters, sortBy]);

  // Trigger fetch on dependency changes
  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  return {
    components,
    availableFilters,
    isLoading,
    fetchError,
    refetch: fetchComponents,
  };
}

export default useComponentFetcher;
