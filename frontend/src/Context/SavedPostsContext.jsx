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
import React, { createContext, useState, useContext, useEffect } from "react";
import communityAPI from "../services/community";
import { UserContext } from "./UserContext";

export const SavedPostsContext = createContext();

export const SavedPostsProvider = ({ children }) => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userId, authToken } = useContext(UserContext); // Use userId instead of user

  useEffect(() => {
    if (userId && authToken) {
      fetchSavedPosts();
    } else {
      setSavedPosts([]);
    }
  }, [userId, authToken]); // Watch both userId and authToken

  const fetchSavedPosts = async () => {
    try {
      setIsLoading(true);
      const response = await communityAPI.getSavedPosts(userId);
      setSavedPosts(response.savedPosts || []);
    } catch (error) {
      console.error("Failed to fetch saved posts:", error);
      setSavedPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addSavedPost = async (post) => {
    if (!userId) return;

    setSavedPosts((prev) => [...prev, post]);
    try {
      await communityAPI.savePost(post._id);
    } catch (error) {
      console.error("Failed to save post:", error);
      setSavedPosts((prev) => prev.filter((p) => p._id !== post._id));
    }
  };

  const removeSavedPost = async (postId) => {
    if (!userId) return;

    setSavedPosts((prev) => prev.filter((post) => post._id !== postId));
    try {
      await communityAPI.removeSavedPost(postId);
    } catch (error) {
      console.error("Failed to remove saved post:", error);
      fetchSavedPosts();
    }
  };

  const isPostSaved = (postId) => {
    return savedPosts.some((post) => post._id === postId);
  };

  return (
    <SavedPostsContext.Provider
      value={{
        savedPosts,
        fetchSavedPosts,
        addSavedPost,
        removeSavedPost,
        isPostSaved,
        isLoading,
      }}
    >
      {children}
    </SavedPostsContext.Provider>
  );
};
