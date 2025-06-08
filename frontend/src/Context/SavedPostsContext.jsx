// import React, { createContext, useState, useContext, useEffect } from "react";
// import communityAPI from "../services/community";
// import { UserContext } from "./UserContext";

// export const SavedPostsContext = createContext();

// export const SavedPostsProvider = ({ children }) => {
//   const [savedPosts, setSavedPosts] = useState([]);
//   const { user } = useContext(UserContext);

//   useEffect(() => {
//     fetchSavedPosts();
//     // eslint-disable-next-line
//   }, [user?._id]);

//   const fetchSavedPosts = async () => {
//     if (!user?._id) {
//       setSavedPosts([]);
//       return;
//     }
//     try {
//       const response = await communityAPI.getSavedPosts(user._id);
//       setSavedPosts(response.builds || []);
//     } catch (error) {
//       setSavedPosts([]);
//     }
//   };

//   const addSavedPost = (post) => {
//     setSavedPosts((prev) => [...prev, post]);
//   };

//   const removeSavedPost = (postId) => {
//     setSavedPosts((prev) => prev.filter((post) => post._id !== postId));
//   };

//   const isPostSaved = (postId) => {
//     return savedPosts.some((post) => post._id === postId);
//   };

//   return (
//     <SavedPostsContext.Provider
//       value={{
//         savedPosts,
//         fetchSavedPosts,
//         addSavedPost,
//         removeSavedPost,
//         isPostSaved,
//       }}
//     >
//       {children}
//     </SavedPostsContext.Provider>
//   );
// };
// import React, { createContext, useState, useContext, useEffect } from "react";
// import communityAPI from "../services/community";
// import { UserContext } from "./UserContext";

// export const SavedPostsContext = createContext();

// export const SavedPostsProvider = ({ children }) => {
//   const [savedPosts, setSavedPosts] = useState([]);
//   const { user } = useContext(UserContext);

//   useEffect(() => {
//     if (user?._id) {
//       fetchSavedPosts();
//     } else {
//       setSavedPosts([]);
//     }
//   }, [user?._id]);

//   const fetchSavedPosts = async () => {
//     try {
//       const response = await communityAPI.getSavedPosts(user._id);
//       setSavedPosts(response.savedPosts || []);
//     } catch (error) {
//       console.error("Failed to fetch saved posts:", error);
//       setSavedPosts([]);
//     }
//   };

//   const addSavedPost = (post) => {
//     setSavedPosts((prev) => [...prev, post]);
//   };

//   const removeSavedPost = (postId) => {
//     setSavedPosts((prev) => prev.filter((post) => post._id !== postId));
//   };

//   const isPostSaved = (postId) => {
//     return savedPosts.some((post) => post._id === postId);
//   };

//   return (
//     <SavedPostsContext.Provider
//       value={{
//         savedPosts,
//         fetchSavedPosts,
//         addSavedPost,
//         removeSavedPost,
//         isPostSaved,
//       }}
//     >
//       {children}
//     </SavedPostsContext.Provider>
//   );
// };
// import React, { createContext, useState, useContext, useEffect } from "react";
// import communityAPI from "../services/community";
// import { UserContext } from "./UserContext";

// export const SavedPostsContext = createContext();

// export const SavedPostsProvider = ({ children }) => {
//   const [savedPosts, setSavedPosts] = useState([]);
//   const { user } = useContext(UserContext);

//   useEffect(() => {
//     if (user?._id) {
//       fetchSavedPosts();
//     } else {
//       setSavedPosts([]);
//     }
//   }, [user?._id]);

//   const fetchSavedPosts = async () => {
//     try {
//       const response = await communityAPI.getSavedPosts(user._id);
//       setSavedPosts(response.savedPosts || []);
//     } catch (error) {
//       console.error("Failed to fetch saved posts:", error);
//       setSavedPosts([]);
//     }
//   };

//   const addSavedPost = (post) => {
//     setSavedPosts((prev) => [...prev, post]);
//     fetchSavedPosts(); // Refresh the list after adding
//   };

//   const removeSavedPost = (postId) => {
//     setSavedPosts((prev) => prev.filter((post) => post._id !== postId));
//     fetchSavedPosts(); // Refresh the list after removing
//   };

//   const isPostSaved = (postId) => {
//     return savedPosts.some((post) => post._id === postId);
//   };

//   return (
//     <SavedPostsContext.Provider
//       value={{
//         savedPosts,
//         fetchSavedPosts,
//         addSavedPost,
//         removeSavedPost,
//         isPostSaved,
//       }}
//     >
//       {children}
//     </SavedPostsContext.Provider>
//   );
// };
// contexts/SavedPostsContext.js

//latest 6/2/2025
// import React, { createContext, useState, useContext, useEffect } from "react";
// import communityAPI from "../services/community";
// import { UserContext } from "./UserContext";

// export const SavedPostsContext = createContext();

// export const SavedPostsProvider = ({ children }) => {
//   const [savedPosts, setSavedPosts] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const { userId, authToken } = useContext(UserContext); // Use userId instead of user

//   useEffect(() => {
//     if (userId && authToken) {
//       fetchSavedPosts();
//     } else {
//       setSavedPosts([]);
//     }
//   }, [userId, authToken]); // Watch both userId and authToken

//   const fetchSavedPosts = async () => {
//     try {
//       setIsLoading(true);
//       const response = await communityAPI.getSavedPosts(userId);
//       setSavedPosts(response.savedPosts || []);
//     } catch (error) {
//       console.error("Failed to fetch saved posts:", error);
//       setSavedPosts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const addSavedPost = async (post) => {
//     if (!userId) return;

//     setSavedPosts((prev) => [...prev, post]);
//     try {
//       await communityAPI.savePost(post._id);
//     } catch (error) {
//       console.error("Failed to save post:", error);
//       setSavedPosts((prev) => prev.filter((p) => p._id !== post._id));
//     }
//   };

//   const removeSavedPost = async (postId) => {
//     if (!userId) return;

//     setSavedPosts((prev) => prev.filter((post) => post._id !== postId));
//     try {
//       await communityAPI.removeSavedPost(postId);
//     } catch (error) {
//       console.error("Failed to remove saved post:", error);
//       fetchSavedPosts();
//     }
//   };

//   const isPostSaved = (postId) => {
//     return savedPosts.some((post) => post._id === postId);
//   };

//   return (
//     <SavedPostsContext.Provider
//       value={{
//         savedPosts,
//         fetchSavedPosts,
//         addSavedPost,
//         removeSavedPost,
//         isPostSaved,
//         isLoading,
//       }}
//     >
//       {children}
//     </SavedPostsContext.Provider>
//   );
// };
// ===== 6. SAVED POSTS CONTEXT (SavedPostsContext.js) =====
// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useCallback,
// } from "react";
// import communityAPI from "../services/community";
// import { UserContext } from "./UserContext";

// export const SavedPostsContext = createContext();

// export const SavedPostsProvider = ({ children }) => {
//   const [savedPosts, setSavedPosts] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const { user, authToken } = useContext(UserContext);

//   // Fetch saved posts when user changes
//   const fetchSavedPosts = useCallback(async () => {
//     if (!user?._id || !authToken) {
//       setSavedPosts([]);
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const response = await communityAPI.getSavedPosts(user._id);
//       setSavedPosts(response.savedPosts || []);
//     } catch (error) {
//       console.error("Failed to fetch saved posts:", error);
//       setSavedPosts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [user?._id, authToken]);

//   // Effect to fetch saved posts when user changes
//   useEffect(() => {
//     fetchSavedPosts();
//   }, [fetchSavedPosts]);

//   // In your SavedPostsContext.jsx, update these functions:

//   const addSavedPost = async (postId) => {
//     try {
//       console.log("Context addSavedPost called with:", postId);

//       if (!postId) {
//         console.error("No postId provided to addSavedPost context");
//         return;
//       }

//       // DON'T call the API here - just update the context state
//       // The API call should already be done in the component
//       setSavedPosts((prevSaved) => {
//         if (prevSaved.some((saved) => saved._id === postId)) {
//           return prevSaved; // Already saved
//         }
//         return [...prevSaved, { _id: postId }];
//       });
//     } catch (error) {
//       console.error("Error in addSavedPost context:", error);
//     }
//   };

//   const removeSavedPost = async (postId) => {
//     try {
//       console.log("Context removeSavedPost called with:", postId);

//       if (!postId) {
//         console.error("No postId provided to removeSavedPost context");
//         return;
//       }

//       // DON'T call the API here - just update the context state
//       // The API call should already be done in the component
//       setSavedPosts((prevSaved) =>
//         prevSaved.filter((saved) => saved._id !== postId)
//       );
//     } catch (error) {
//       console.error("Error in removeSavedPost context:", error);
//     }
//   };

//   // Check if post is saved
//   const isPostSaved = (postId) => {
//     return savedPosts.some((post) => post._id === postId);
//   };

//   const value = {
//     savedPosts,
//     isLoading,
//     fetchSavedPosts,
//     addSavedPost,
//     removeSavedPost,
//     isPostSaved,
//   };

//   return (
//     <SavedPostsContext.Provider value={value}>
//       {children}
//     </SavedPostsContext.Provider>
//   );
// };
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import communityAPI from "../services/community";
import { UserContext } from "./UserContext";

export const SavedPostsContext = createContext();

export const SavedPostsProvider = ({ children }) => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Add this flag
  const { user, authToken } = useContext(UserContext);

  // Fetch saved posts when user changes
  const fetchSavedPosts = useCallback(async () => {
    if (!user?._id || !authToken) {
      setSavedPosts([]);
      setIsInitialized(true); // Mark as initialized even for non-auth users
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching saved posts for user:", user._id);
      const response = await communityAPI.getSavedPosts();
      console.log("Saved posts response:", response);
      setSavedPosts(Array.isArray(response) ? response : []);
      setIsInitialized(true); // Mark as initialized after first fetch
    } catch (error) {
      console.error("Failed to fetch saved posts:", error);
      setSavedPosts([]);
      setIsInitialized(true); // Still mark as initialized to prevent blocking
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, authToken]);

  // Effect to fetch saved posts when user changes
  useEffect(() => {
    setIsInitialized(false); // Reset initialization flag when user changes
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  const addSavedPost = async (postId) => {
    try {
      console.log("Context addSavedPost called with:", postId);
      if (!postId) {
        console.error("No postId provided to addSavedPost context");
        return;
      }

      setSavedPosts((prevSaved) => {
        // Check if post is already saved
        const alreadySaved = prevSaved.some((saved) => saved._id === postId);
        if (alreadySaved) {
          return prevSaved;
        }
        return [...prevSaved, { _id: postId }];
      });
    } catch (error) {
      console.error("Error in addSavedPost context:", error);
    }
  };

  const removeSavedPost = async (postId) => {
    try {
      console.log("Context removeSavedPost called with:", postId);
      if (!postId) {
        console.error("No postId provided to removeSavedPost context");
        return;
      }

      setSavedPosts((prevSaved) =>
        prevSaved.filter((saved) => saved._id !== postId)
      );
    } catch (error) {
      console.error("Error in removeSavedPost context:", error);
    }
  };

  // Check if post is saved
  const isPostSaved = useCallback(
    (postId) => {
      const result = savedPosts.some((post) => post._id === postId);
      console.log(
        `Checking if post ${postId} is saved:`,
        result,
        savedPosts.length
      );
      return result;
    },
    [savedPosts]
  );

  const value = {
    savedPosts,
    isLoading,
    isInitialized, // Expose this to components
    fetchSavedPosts,
    addSavedPost,
    removeSavedPost,
    isPostSaved,
  };

  return (
    <SavedPostsContext.Provider value={value}>
      {children}
    </SavedPostsContext.Provider>
  );
};
