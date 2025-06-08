import axios from "axios";

const API_URL = "http://localhost:4000/api";

const debug = console.debug; // Or use a proper debug library

const authAPI = () => {
  const instance = axios.create({
    baseURL: `${API_URL}/community`,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Add request interceptor to log outgoing requests
  instance.interceptors.request.use((config) => {
    console.log("Sending request to:", config.url);
    console.log("With credentials:", config.withCredentials);
    console.log("Full config:", config);
    return config;
  });

  return instance;
};

const fileAPI = () => {
  return axios.create({
    baseURL: `${API_URL}/community`,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
};

const communityAPI = {
  getPosts: async (filters = {}) => {
    const response = await authAPI().get("/", { params: filters });
    return {
      posts: response.data.posts,
      page: response.data.currentPage,
      pages: response.data.totalPages,
    };
  },

  getPost: async (postId) => {
    const response = await authAPI().get(`/${postId}`);
    return response.data;
  },

  // getSavedPosts: async () => {
  //   try {
  //     console.log("Attempting to fetch saved posts...");
  //     console.log("Current cookies:", document.cookie); // Verify cookies exist

  //     const response = await authAPI().get("/saved-posts");
  //     return response.data.savedPosts || [];
  //   } catch (error) {
  //     console.error("Error fetching saved posts:", {
  //       status: error.response?.status,
  //       data: error.response?.data,
  //       message: error.message,
  //     });
  //     throw error;
  //   }
  // },
  getSavedPosts: async () => {
    try {
      console.log("Attempting to fetch saved posts...");
      console.log("Current cookies:", document.cookie);

      const response = await authAPI().get("/saved-posts");
      console.log("getSavedPosts API response:", response.data);

      // Make sure we return the correct structure
      return response.data.savedPosts || response.data || [];
    } catch (error) {
      console.error("Error fetching saved posts:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
  createPost: async (postData, images = []) => {
    const formData = new FormData();
    Object.keys(postData).forEach((key) => {
      if (key !== "components" && key !== "tags") {
        formData.append(key, postData[key]);
      }
    });
    if (postData.components) {
      formData.append("components", JSON.stringify(postData.components));
    }
    if (postData.tags) {
      formData.append("tags", JSON.stringify(postData.tags));
    }
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }
    const response = await fileAPI().post(
      "http://localhost:4000/api/posts/create"
    );
    return response.data;
  },

  // Comments
  getPostComments: async (postId) => {
    const response = await authAPI().get(`/${postId}/getcomments`);
    return response.data;
  },
  addComment: async (postId, { text }) => {
    const response = await authAPI().post(`/${postId}/comment`, { text });
    return response.data;
  },

  // Ratings
  addRating: async (postId, value) => {
    try {
      const response = await authAPI().post(`/${postId}/rate`, { value });
      return response.data;
    } catch (error) {
      console.error("Rating API error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  savePost: async (postId) => {
    try {
      console.log("Saving post with ID:", postId); // Debug log
      if (!postId) {
        throw new Error("Post ID is required");
      }

      const response = await axios.post(
        `http://localhost:4000/api/community/${postId}/save`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Save post error:", error);
      throw error;
    }
  },

  removeSavedPost: async (postId) => {
    try {
      console.log("Removing saved post with ID:", postId); // Debug log
      if (!postId) {
        throw new Error("Post ID is required");
      }

      const response = await axios.delete(
        `http://localhost:4000/api/community/${postId}/unsave`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Remove saved post error:", error);
      throw error;
    }
  },
  // Share
  sharePost: async (postId) => {
    const response = await authAPI().post(`/${postId}/share`);
    return response.data;
  },
};

export default communityAPI;
