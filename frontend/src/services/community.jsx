import axios from "axios";

const API_URL = "http://localhost:4000/api";

const authAPI = () => {
  return axios.create({
    baseURL: `${API_URL}/community`,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
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

  getSavedPosts: async (userId) => {
    const response = await authAPI().get(`user/${userId}/saved-posts`);
    return response.data;
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
    const response = await authAPI().post(`/${postId}/rate`, { value });
    return response.data;
  },

  // Save (bookmark) a post
  savePost: async (postId) => {
    const response = await authAPI().post(`/${postId}/save`);
    return response.data;
  },

  // Remove (unbookmark) a post
  removeSavedPost: async (postId) => {
    const response = await authAPI().delete(`/${postId}/unsave`);
    return response.data;
  },

  // Share
  sharePost: async (postId) => {
    const response = await authAPI().post(`/${postId}/share`);
    return response.data;
  },
};

export default communityAPI;
