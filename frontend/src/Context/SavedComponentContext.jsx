// import React, { createContext, useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { UserContext } from "./UserContext"; // Import your UserContext

// export const SavedComponentsContext = createContext();

// export const SavedComponentsProvider = ({ children }) => {
//   const [savedComponents, setSavedComponents] = useState({});
//   const [favorites, setFavorites] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { userLogin, logout } = useContext(UserContext); // Access user context

//   // Load favorites based on user login state
//   useEffect(() => {
//     if (userLogin) {
//       // User is logged in, fetch favorites from server
//       fetchFavoritesFromServer(userLogin);
//     } else {
//       // No user logged in, use local favorites from localStorage
//       const storedFavorites = localStorage.getItem("favorites");
//       if (storedFavorites) {
//         try {
//           setFavorites(JSON.parse(storedFavorites));
//         } catch (err) {
//           console.error("Error parsing favorites from localStorage:", err);
//           localStorage.removeItem("favorites");
//           setFavorites([]);
//         }
//       } else {
//         setFavorites([]);
//       }
//     }
//   }, [userLogin]); // Re-run whenever login state changes

//   // Fetch favorites from server
//   const fetchFavoritesFromServer = async (token) => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get(
//         "http://localhost:4000/api/components/favorites/user",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Format server favorites to match our local format
//       const serverFavorites = response.data.map((fav) => fav.componentId);

//       setFavorites(serverFavorites);

//       // Update savedComponents with the fetched favorites
//       loadSavedComponentsFromFavorites(serverFavorites);

//       setIsLoading(false);
//     } catch (err) {
//       console.error("Error fetching favorites:", err);
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };

//   // Load saved components based on favorites IDs
//   const loadSavedComponentsFromFavorites = async (favoriteIds) => {
//     if (!favoriteIds.length) {
//       setSavedComponents({});
//       return;
//     }

//     try {
//       // Fetch actual component data for each favorite ID
//       // You might need to adjust this based on your API structure
//       const components = {};
//       components.all = [];

//       // This assumes your API can fetch multiple components in one request
//       // You may need to implement multiple requests based on component types
//       for (const favId of favoriteIds) {
//         // You would need to know the component type for each ID
//         // This is simplified and would need to be adapted to your API
//         try {
//           // This endpoint might need to be updated based on your API
//           const response = await axios.get(
//             `http://localhost:4000/api/components/all/${favId}`,
//             {
//               headers: { Authorization: `Bearer ${userLogin}` },
//             }
//           );

//           if (response.data) {
//             const component = response.data;
//             const category = component.category.toLowerCase();

//             if (!components[category]) components[category] = [];
//             components[category].push({ ...component, type: category });
//             components.all.push({ ...component, type: category });
//           }
//         } catch (componentErr) {
//           console.error(`Error fetching component ${favId}:`, componentErr);
//         }
//       }

//       setSavedComponents(components);
//     } catch (err) {
//       console.error("Error loading saved components:", err);
//     }
//   };

//   // Toggle a component as favorite
//   const toggleFavorite = async (component) => {
//     try {
//       // Ensure we have a valid component with required properties
//       if (!component || !component._id) {
//         console.error("Invalid component:", component);
//         setError("Invalid component data");
//         return;
//       }

//       const componentId = component._id;
//       // Safely access category or default to a fallback type
//       const componentType = (
//         component.category ||
//         component.type ||
//         "unknown"
//       ).toLowerCase();

//       console.log("Toggling favorite for:", { componentId, componentType });

//       // Update local state first for immediate UI feedback
//       let newFavorites;
//       const isFavorited = favorites.includes(componentId);

//       if (isFavorited) {
//         console.log("Removing from favorites");
//         newFavorites = favorites.filter((id) => id !== componentId);

//         // If user is logged in, remove from server
//         if (userLogin) {
//           try {
//             await axios.post(
//               `http://localhost:4000/api/components/favorites/${componentId}`,
//               { componentId, componentType },
//               { headers: { Authorization: `Bearer ${userLogin}` } }
//             );
//             console.log("Successfully removed from server favorites");
//           } catch (apiErr) {
//             console.error("API error removing favorite:", apiErr);
//             // Continue with local state update despite API error
//           }
//         }
//       } else {
//         console.log("Adding to favorites");
//         newFavorites = [...favorites, componentId];

//         // If user is logged in, add to server
//         if (userLogin) {
//           try {
//             await axios.post(
//               "http://localhost:4000/api/components/favorites",
//               { componentId, componentType },
//               { headers: { Authorization: `Bearer ${userLogin}` } }
//             );
//             console.log("Successfully added to server favorites");
//           } catch (apiErr) {
//             console.error("API error adding favorite:", apiErr);
//             // Continue with local state update despite API error
//           }
//         }
//       }

//       // Update state
//       setFavorites(newFavorites);

//       // Only update localStorage for non-logged in users
//       if (!userLogin) {
//         localStorage.setItem("favorites", JSON.stringify(newFavorites));
//       }

//       // Update savedComponents context
//       updateSavedComponentsState(component, newFavorites.includes(componentId));

//       console.log("Favorites updated successfully:", newFavorites);
//     } catch (err) {
//       console.error("Error updating favorites:", err);
//       setError(err.message || "Error updating favorites");
//     }
//   };

//   // Update the saved components state when favorites change
//   const updateSavedComponentsState = (component, isAdding) => {
//     setSavedComponents((prev) => {
//       const updated = { ...prev };
//       const category = component.category.toLowerCase();

//       if (isAdding) {
//         // Adding component to favorites
//         if (!updated.all) updated.all = [];
//         if (!updated[category]) updated[category] = [];

//         // Only add if not already there
//         if (!updated.all.some((item) => item._id === component._id)) {
//           updated.all.push({ ...component, type: category });
//         }

//         if (!updated[category].some((item) => item._id === component._id)) {
//           updated[category].push({ ...component, type: category });
//         }
//       } else {
//         // Removing component from favorites
//         if (updated.all) {
//           updated.all = updated.all.filter(
//             (item) => item._id !== component._id
//           );
//         }

//         if (updated[category]) {
//           updated[category] = updated[category].filter(
//             (item) => item._id !== component._id
//           );
//         }
//       }

//       return updated;
//     });
//   };

//   // Clear favorites - to be called when user logs out
//   const clearFavorites = () => {
//     setFavorites([]);
//     setSavedComponents({});
//   };

//   return (
//     <SavedComponentsContext.Provider
//       value={{
//         savedComponents,
//         setSavedComponents,
//         favorites,
//         toggleFavorite,
//         isLoading,
//         error,
//         clearFavorites, // Expose clearFavorites method
//       }}
//     >
//       {children}
//     </SavedComponentsContext.Provider>
//   );
// };

// import React, { createContext, useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { UserContext } from "./UserContext";

// export const SavedComponentsContext = createContext();

// export const SavedComponentsProvider = ({ children }) => {
//   const [savedComponents, setSavedComponents] = useState({});
//   const [favorites, setFavorites] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { user, authToken } = useContext(UserContext); // Access user context

//   // Load favorites based on user login state
//   useEffect(() => {
//     if (authToken) {
//       // User is logged in, fetch favorites from server
//       fetchFavoritesFromServer();
//     } else {
//       // No user logged in, use local favorites from localStorage
//       const storedFavorites = localStorage.getItem("favorites");
//       if (storedFavorites) {
//         try {
//           setFavorites(JSON.parse(storedFavorites));
//         } catch (err) {
//           console.error("Error parsing favorites from localStorage:", err);
//           localStorage.removeItem("favorites");
//           setFavorites([]);
//         }
//       } else {
//         setFavorites([]);
//       }
//     }
//   }, [authToken]); // Re-run whenever auth token changes

//   // Fetch favorites from server
//   const fetchFavoritesFromServer = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get(
//         "http://localhost:4000/api/components/favorites/user",
//         {
//           withCredentials: true, // Include cookies in the request
//         }
//       );

//       // Format server favorites to match our local format
//       const serverFavorites = response.data.map((fav) => fav.componentId);

//       console.log("Fetched favorites from server:", serverFavorites);
//       setFavorites(serverFavorites);

//       // Update savedComponents with the fetched favorites
//       loadSavedComponentsFromFavorites(serverFavorites);

//       setIsLoading(false);
//     } catch (err) {
//       console.error("Error fetching favorites:", err);
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };

//   // Load saved components based on favorites IDs
//   const loadSavedComponentsFromFavorites = async (favoriteIds) => {
//     if (!favoriteIds.length) {
//       setSavedComponents({});
//       return;
//     }

//     try {
//       const components = {};
//       components.all = [];

//       // Fetch actual component data for each favorite ID
//       for (const favId of favoriteIds) {
//         try {
//           const response = await axios.get(
//             `http://localhost:4000/api/components/all/${favId}`,
//             {
//               withCredentials: true, // Include cookies in the request
//             }
//           );

//           if (response.data) {
//             const component = response.data;
//             const category = component.category.toLowerCase();

//             if (!components[category]) components[category] = [];
//             components[category].push({ ...component, type: category });
//             components.all.push({ ...component, type: category });
//           }
//         } catch (componentErr) {
//           console.error(Error`fetchingcomponent ${favId}:`, componentErr);
//         }
//       }

//       setSavedComponents(components);
//     } catch (err) {
//       console.error("Error loading saved components:", err);
//     }
//   };

//   // Toggle a component as favorite
//   const toggleFavorite = async (component) => {
//     try {
//       // Ensure we have a valid component with required properties
//       if (!component || !component._id) {
//         console.error("Invalid component:", component);
//         setError("Invalid component data");
//         return;
//       }

//       const componentId = component._id;
//       // Safely access category or default to a fallback type
//       const componentType = (
//         component.category ||
//         component.type ||
//         "unknown"
//       ).toLowerCase();

//       console.log("Toggling favorite for:", { componentId, componentType });

//       // Update local state first for immediate UI feedback
//       let newFavorites;
//       const isFavorited = favorites.includes(componentId);

//       if (isFavorited) {
//         console.log("Removing from favorites");
//         newFavorites = favorites.filter((id) => id !== componentId);

//         // If user is logged in, remove from server
//         if (authToken) {
//           try {
//             await axios.post(
//               `http://localhost:4000/api/components/favorites/${componentId}`,
//               { componentId, componentType },
//               { withCredentials: true } // Use cookie-based authentication
//             );
//             console.log("Successfully removed from server favorites");
//           } catch (apiErr) {
//             console.error("API error removing favorite:", apiErr);
//             // Continue with local state update despite API error
//           }
//         }
//       } else {
//         console.log("Adding to favorites");
//         newFavorites = [...favorites, componentId];

//         // If user is logged in, add to server
//         if (authToken) {
//           try {
//             await axios.post(
//               "http://localhost:4000/api/components/favorites",
//               { componentId, componentType },
//               { withCredentials: true } // Use cookie-based authentication
//             );
//             console.log("Successfully added to server favorites");
//           } catch (apiErr) {
//             console.error("API error adding favorite:", apiErr);
//             // Continue with local state update despite API error
//           }
//         }
//       }

//       // Update state
//       setFavorites(newFavorites);

//       // Only update localStorage for non-logged in users
//       if (!authToken) {
//         localStorage.setItem("favorites", JSON.stringify(newFavorites));
//       }

//       // Update savedComponents context
//       updateSavedComponentsState(component, newFavorites.includes(componentId));

//       console.log("Favorites updated successfully:", newFavorites);
//     } catch (err) {
//       console.error("Error updating favorites:", err);
//       setError(err.message || "Error updating favorites");
//     }
//   };

//   // Update the saved components state when favorites change
//   const updateSavedComponentsState = (component, isAdding) => {
//     setSavedComponents((prev) => {
//       const updated = { ...prev };
//       const category = component.category.toLowerCase();

//       if (isAdding) {
//         // Adding component to favorites
//         if (!updated.all) updated.all = [];
//         if (!updated[category]) updated[category] = [];

//         // Only add if not already there
//         if (!updated.all.some((item) => item._id === component._id)) {
//           updated.all.push({ ...component, type: category });
//         }

//         if (!updated[category].some((item) => item._id === component._id)) {
//           updated[category].push({ ...component, type: category });
//         }
//       } else {
//         // Removing component from favorites
//         if (updated.all) {
//           updated.all = updated.all.filter(
//             (item) => item._id !== component._id
//           );
//         }

//         if (updated[category]) {
//           updated[category] = updated[category].filter(
//             (item) => item._id !== component._id
//           );
//         }
//       }

//       return updated;
//     });
//   };

//   // Clear favorites - to be called when user logs out
//   const clearFavorites = () => {
//     setFavorites([]);
//     setSavedComponents({});
//   };

//   return (
//     <SavedComponentsContext.Provider
//       value={{
//         savedComponents,
//         setSavedComponents,
//         favorites,
//         toggleFavorite,
//         isLoading,
//         error,
//         clearFavorites, // Expose clearFavorites method
//       }}
//     >
//       {children}
//     </SavedComponentsContext.Provider>
//   );
// };
// import React, { createContext, useEffect, useState, useContext } from "react";
// import axios from "axios";
// import { UserContext } from "./UserContext";

// export const SavedComponentsContext = createContext();

// export const SavedComponentsProvider = ({ children }) => {
//   const [savedComponents, setSavedComponents] = useState({});
//   const [favorites, setFavorites] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { user, authToken } = useContext(UserContext);

//   // This useEffect will run whenever authentication state changes
//   // or when the component mounts
//   useEffect(() => {
//     console.log("Auth state changed:", { authToken, userId: user?._id });
//     loadFavorites();
//   }, [authToken, user]); // Added user as dependency to ensure it runs when user info is available

//   // Helper function to load favorites based on authentication state
//   const loadFavorites = async () => {
//     if (authToken && user) {
//       // User is logged in, fetch favorites from server
//       console.log("User logged in, fetching favorites from server");
//       await fetchFavoritesFromServer();
//     } else {
//       // No user logged in, use local favorites from localStorage
//       console.log("No user logged in, loading favorites from localStorage");
//       const storedFavorites = localStorage.getItem("favorites");
//       if (storedFavorites) {
//         try {
//           const localFavorites = JSON.parse(storedFavorites);
//           setFavorites(localFavorites);
//           // Load the actual components for these favorites
//           await loadSavedComponentsFromFavorites(localFavorites);
//         } catch (err) {
//           console.error("Error parsing favorites from localStorage:", err);
//           localStorage.removeItem("favorites");
//           setFavorites([]);
//           setSavedComponents({});
//         }
//       } else {
//         setFavorites([]);
//         setSavedComponents({});
//       }
//     }
//   };

// contexts/SavedComponentsContext.js
import React, { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export const SavedComponentsContext = createContext();

export const SavedComponentsProvider = ({ children }) => {
  const [savedComponents, setSavedComponents] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, userId, authToken } = useContext(UserContext);

  useEffect(() => {
    console.log("Auth state changed - user ID:", userId);
    loadFavorites();
  }, [authToken, userId]); // Use userId instead of user

  const loadFavorites = async () => {
    if (authToken && userId) {
      console.log("User logged in, fetching favorites from server");
      await fetchFavoritesFromServer();
    } else {
      console.log("No user logged in, loading favorites from localStorage");
      const storedFavorites = localStorage.getItem("favorites");
      if (storedFavorites) {
        try {
          const localFavorites = JSON.parse(storedFavorites);
          setFavorites(localFavorites);
          await loadSavedComponentsFromFavorites(localFavorites);
        } catch (err) {
          console.error("Error parsing favorites:", err);
          localStorage.removeItem("favorites");
          setFavorites([]);
          setSavedComponents({});
        }
      } else {
        setFavorites([]);
        setSavedComponents({});
      }
    }
  }; // Fetch favorites from server
  const fetchFavoritesFromServer = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:4000/api/components/favorites/user",
        {
          withCredentials: true, // Include cookies in the request
        }
      );

      // Format server favorites to match our local format
      const serverFavorites = response.data.map((fav) => fav.componentId);

      console.log("Fetched favorites from server:", serverFavorites);
      setFavorites(serverFavorites);

      // Update savedComponents with the fetched favorites
      await loadSavedComponentsFromFavorites(serverFavorites);

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Load saved components based on favorites IDs
  const loadSavedComponentsFromFavorites = async (favoriteIds) => {
    if (!favoriteIds || !favoriteIds.length) {
      setSavedComponents({});
      return;
    }

    try {
      const components = {};
      components.all = [];

      // Fetch actual component data for each favorite ID
      for (const favId of favoriteIds) {
        try {
          const response = await axios.get(
            `http://localhost:4000/api/components/all/${favId}`,
            {
              withCredentials: true, // Include cookies in the request
            }
          );

          if (response.data) {
            const component = response.data;
            const category = component.category?.toLowerCase() || "unknown";

            if (!components[category]) components[category] = [];
            components[category].push({ ...component, type: category });
            components.all.push({ ...component, type: category });
          }
        } catch (componentErr) {
          console.error(`Error fetching component ${favId}:`, componentErr);
        }
      }

      setSavedComponents(components);
    } catch (err) {
      console.error("Error loading saved components:", err);
    }
  };
  // Toggle a component as favorite
  const toggleFavorite = async (component) => {
    try {
      // Ensure we have a valid component with required properties
      if (!component || !component._id) {
        console.error("Invalid component:", component);
        setError("Invalid component data");
        return;
      }

      const componentId = component._id;
      // Safely access category or default to a fallback type
      const componentType = (
        component.category ||
        component.type ||
        "unknown"
      ).toLowerCase();

      console.log("Toggling favorite for:", { componentId, componentType });

      // Update local state first for immediate UI feedback
      let newFavorites;
      const isFavorited = favorites.includes(componentId);

      if (isFavorited) {
        console.log("Removing from favorites");
        newFavorites = favorites.filter((id) => id !== componentId);

        // If user is logged in, remove from server
        if (authToken) {
          try {
            await axios.post(
              `http://localhost:4000/api/components/favorites/${componentId}`,
              { componentId, componentType },
              { withCredentials: true } // Use cookie-based authentication
            );
            console.log("Successfully removed from server favorites");
          } catch (apiErr) {
            console.error("API error removing favorite:", apiErr);
            // Continue with local state update despite API error
          }
        }
      } else {
        console.log("Adding to favorites");
        newFavorites = [...favorites, componentId];

        // If user is logged in, add to server
        if (authToken) {
          try {
            await axios.post(
              "http://localhost:4000/api/components/favorites",
              { componentId, componentType },
              { withCredentials: true } // Use cookie-based authentication
            );
            console.log("Successfully added to server favorites");
          } catch (apiErr) {
            console.error("API error adding favorite:", apiErr);
            // Continue with local state update despite API error
          }
        }
      }

      // Update state
      setFavorites(newFavorites);

      // Only update localStorage for non-logged in users
      if (!authToken) {
        localStorage.setItem("favorites", JSON.stringify(newFavorites));
      }

      // Update savedComponents context
      updateSavedComponentsState(component, newFavorites.includes(componentId));

      console.log("Favorites updated successfully:", newFavorites);
    } catch (err) {
      console.error("Error updating favorites:", err);
      setError(err.message || "Error updating favorites");
    }
  };

  // Update the saved components state when favorites change
  const updateSavedComponentsState = (component, isAdding) => {
    setSavedComponents((prev) => {
      const updated = { ...prev };
      // Safely access category or use a default
      const category = component.category?.toLowerCase() || "unknown";

      if (isAdding) {
        // Adding component to favorites
        if (!updated.all) updated.all = [];
        if (!updated[category]) updated[category] = [];

        // Only add if not already there
        if (!updated.all.some((item) => item._id === component._id)) {
          updated.all.push({ ...component, type: category });
        }

        if (!updated[category].some((item) => item._id === component._id)) {
          updated[category].push({ ...component, type: category });
        }
      } else {
        // Removing component from favorites
        if (updated.all) {
          updated.all = updated.all.filter(
            (item) => item._id !== component._id
          );
        }

        if (updated[category]) {
          updated[category] = updated[category].filter(
            (item) => item._id !== component._id
          );
        }
      }

      return updated;
    });
  };

  // Clear favorites - to be called when user logs out
  const clearFavorites = () => {
    setFavorites([]);
    setSavedComponents({});
  };

  return (
    <SavedComponentsContext.Provider
      value={{
        savedComponents,
        setSavedComponents,
        favorites,
        toggleFavorite,
        isLoading,
        error,
        clearFavorites,
        refreshFavorites: loadFavorites, // Expose refresh method for manual refresh if needed
      }}
    >
      {children}
    </SavedComponentsContext.Provider>
  );
};
