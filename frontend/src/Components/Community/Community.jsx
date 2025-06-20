import React, { useCallback, useState, useContext, useEffect } from "react";
import "./Community.css";
import Filters from "../Filters/Filters";
import { useNavigate, useLocation } from "react-router-dom";
import { UserOutlined, LoadingOutlined } from "@ant-design/icons";
import { IoIosAdd } from "react-icons/io";
import postImage from "../../assets/images/postBuild_dummy.png";
import { SavedComponentsContext } from "../../Context/SavedComponentContext";
import {
  FaTimes,
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
} from "react-icons/fa";
import { Rate, Spin, notification, message, Input, Button } from "antd";
import { RiShare2Line } from "react-icons/ri";
import communityAPI from "../../services/community";
import { UserContext } from "../../Context/UserContext";
import { SavedPostsContext } from "../../Context/SavedPostsContext";
import CreatePostModal from "./CreatePostModal";
import "./CreatePostModal.css";
import CommentModal from "./CommentSidebar";
import axios from "axios";
import CommunityFilters from "../Filters/CommunityFilters";
import BuildCarousel from "./BuildCarousel";
import PostCard from "./PostCard";
const { TextArea } = Input;

function Community() {
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({});
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [commentSidebarVisible, setCommentSidebarVisible] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [preSelectedBuild, setPreSelectedBuild] = useState(null);

  const { savedComponents } = useContext(SavedComponentsContext);
  const { user, authToken } = useContext(UserContext) || {
    user: null,
    authToken: false,
  };
  const {
    savedPosts,
    fetchSavedPosts,
    addSavedPost,
    removeSavedPost,
    isPostSaved,
  } = useContext(SavedPostsContext);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    fetchSavedPosts();
  }, [user?._id, fetchSavedPosts]);

  // Handle incoming build share from FullBuildSummary
  useEffect(() => {
    if (location.state?.openCreateModal && location.state?.selectedBuild) {
      console.log("Received build to share:", location.state.selectedBuild);

      // Set the pre-selected build
      setPreSelectedBuild(location.state.selectedBuild);

      // Open the create post modal
      setIsCreatingPost(true);

      // Clear the location state to prevent re-triggering
      navigate("/community", { replace: true });

      // Show a helpful message
      message.info("Build ready to share! Add your thoughts and post.");
    }
  }, [location.state, navigate]);

  const genres = [
    "Gaming",
    "Workstation",
    "Streaming",
    "Editing",
    "Budget",
    "High-End",
    "Custom",
    "Office",
    "Home Theater",
  ];

  const fetchPosts = async (newPage = 1) => {
    try {
      setLoading(true);
      const params = {
        page: newPage,
        limit: 5,
        ...filters, // Include any filters
      };

      // Apply sorting
      switch (sortBy) {
        case "newest":
          params.sortBy = "-createdAt";
          break;
        case "oldest":
          params.sortBy = "createdAt";
          break;
        case "rating-desc":
          params.sortBy = "-averageRating";
          break;
        case "rating-asc":
          params.sortBy = "averageRating";
          break;
        default:
          params.sortBy = "-createdAt";
      }

      const response = await communityAPI.getPosts(params);

      const postsWithData = response.posts.map((post) => {
        const userRatingObj = post.ratings?.find(
          (r) => r.user && r.user._id === user?._id
        );
        const userRating = userRatingObj ? userRatingObj.value : null;

        return {
          ...post,
          savesCount: post.savesCount || 0,
          isBookmarked: isPostSaved(post._id),
          userRating: userRating,
          averageRating: post.averageRating || 0,
          ratingsCount: post.ratings?.length || 0,
        };
      });

      if (newPage === 1) {
        setPosts(postsWithData);
      } else {
        setPosts((prev) => [...prev, ...postsWithData]);
      }

      setHasMore(response.page < response.pages);
      setPage(response.page);
    } catch (error) {
      notification.error({
        message: "Failed to load posts",
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Add a new effect to handle the initial load sequence
  useEffect(() => {
    // Only fetch posts after saved posts have been fetched
    if (user && authToken) {
      // Wait a bit for saved posts context to be populated
      const timer = setTimeout(() => {
        fetchPosts();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // For non-authenticated users, fetch immediately
      fetchPosts();
    }
  }, [sortBy, filters, user, authToken]);

  // 3. Keep the existing effect but make it more robust
  useEffect(() => {
    // Only update if we have posts and the savedPosts context has been loaded
    if (posts.length > 0) {
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          isBookmarked: isPostSaved(post._id),
        }))
      );
    }
  }, [savedPosts]);

  const handleSavePost = async (postId) => {
    if (!authToken) {
      notification.warning({
        message: "Login Required",
        description: "Please login to save posts",
      });
      return;
    }

    // Optimistic update - update UI immediately
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              isBookmarked: true,
              savesCount: (post.savesCount || 0) + 1,
            }
          : post
      )
    );

    try {
      const response = await communityAPI.savePost(postId);
      if (response.success) {
        // Update with actual server response
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  savesCount: response.savesCount,
                  isBookmarked: true,
                }
              : post
          )
        );
        // Update context in background
        await addSavedPost(postId); // Use context method instead of fetchSavedPosts
        message.success("Post saved successfully!");
      }
    } catch (error) {
      // Revert optimistic update on error
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                isBookmarked: false,
                savesCount: Math.max((post.savesCount || 1) - 1, 0),
              }
            : post
        )
      );

      notification.error({
        message: "Save Failed",
        description: error.response?.data?.message || "Please try again later",
      });
    }
  };

  const handleRemoveSavedPost = async (postId) => {
    if (!authToken) {
      notification.warning({
        message: "Login Required",
        description: "Please login to remove saved posts",
      });
      return;
    }

    // Optimistic update - update UI immediately
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              isBookmarked: false,
              savesCount: Math.max((post.savesCount || 1) - 1, 0),
            }
          : post
      )
    );

    try {
      const response = await communityAPI.removeSavedPost(postId);
      if (response.success) {
        // Update with actual server response
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  savesCount: response.savesCount,
                  isBookmarked: false,
                }
              : post
          )
        );
        // Update context in background
        await removeSavedPost(postId); // Use context method instead of fetchSavedPosts
        message.success("Post removed from saved!");
      }
    } catch (error) {
      // Revert optimistic update on error
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                isBookmarked: true,
                savesCount: (post.savesCount || 0) + 1,
              }
            : post
        )
      );

      notification.error({
        message: "Remove Failed",
        description: error.response?.data?.message || "Please try again later",
      });
    }
  };

  const isPostSavedByUser = (postId) => {
    return isPostSaved(postId);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  const getAllSavedBuilds = () => {
    const savedBuilds = [];
    if (savedComponents?.folders) {
      if (savedComponents.folders[1]) {
        savedComponents.folders[1].forEach((folder) => {
          if (folder.profileBuilds && folder.profileBuilds.length > 0) {
            savedBuilds.push(
              ...folder.profileBuilds.map((build) => ({
                ...build,
                folderName: folder.name,
                folderType: "Completed Builds",
              }))
            );
          }
        });
      }
      if (savedComponents.folders[2]) {
        savedComponents.folders[2].forEach((folder) => {
          if (folder.profileBuilds && folder.profileBuilds.length > 0) {
            savedBuilds.push(
              ...folder.profileBuilds.map((build) => ({
                ...build,
                folderName: folder.name,
                folderType: "Saved Builds",
              }))
            );
          }
        });
      }
    }
    return savedBuilds;
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    setSortBy(sortValue);
    setPage(1);
  }, []);

  const [createPostLoading, setCreatePostLoading] = useState(false);

  const handleOpenCreatePost = () => {
    if (authChecked && !authToken) {
      notification.warning({
        message: "Login Required",
        description: "Please login to create a post",
      });
      return;
    }
    setIsCreatingPost(true);
  };

  const handleCloseCreatePost = () => {
    setIsCreatingPost(false);
    // Clear the pre-selected build when closing
    setPreSelectedBuild(null);
  };

  const handleCreatePostSubmit = async ({
    postText,
    imageFiles,
    selectedBuild,
  }) => {
    if (
      !postText &&
      !selectedBuild &&
      (!imageFiles || imageFiles.length === 0)
    ) {
      message.error("Post must have text, images, or a build");
      return;
    }

    if (!authToken) {
      notification.warning({
        message: "Login Required",
        description: "Please login to create a post",
      });
      return;
    }

    try {
      setCreatePostLoading(true);

      const formData = new FormData();
      formData.append("text", postText || "");

      if (selectedBuild) {
        formData.append("buildId", selectedBuild._id);
      }

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      const response = await axios.post(
        "http://localhost:4000/api/posts/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        message.success("Post created successfully!");
        setIsCreatingPost(false);
        setPreSelectedBuild(null); // Clear pre-selected build
        fetchPosts(1);
      } else {
        throw new Error(response.data.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      notification.error({
        message: "Failed to create post",
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setCreatePostLoading(false);
    }
  };

  const handleAddRating = async (postId, value) => {
    if (!authToken) {
      notification.warning({
        message: "Login Required",
        description: "Please login to rate posts",
      });
      return;
    }

    try {
      const roundedValue = Math.round(value * 2) / 2;

      const response = await communityAPI.addRating(postId, roundedValue);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                averageRating: response.averageRating,
                userRating: roundedValue, // Make sure this is set
                ratingsCount: response.ratingsCount,
                ratings: response.ratings || [],
              }
            : post
        )
      );

      message.success(`Rated ${roundedValue} stars!`);
    } catch (error) {
      console.error("Rating error:", error);
      notification.error({
        message: "Rating Failed",
        description: error.response?.data?.message || "Please try again later",
      });
    }
  };

  const handleSharePost = async (postId) => {
    try {
      const response = await communityAPI.sharePost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, shareCount: response.shares } : post
        )
      );
      message.success("Post shared!");
    } catch (error) {
      notification.error({
        message: "Share Failed",
        description: error.message || "Please try again later",
      });
    }
  };

  const fetchComments = async (postId) => {
    try {
      setCommentLoading(true);
      const response = await communityAPI.getPostComments(postId);
      setComments(response.comments || []);
    } catch (error) {
      notification.error({
        message: "Failed to load comments",
        description: error.message || "Please try again later",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCommentClick = async (post) => {
    setCurrentPost(post);
    setCommentSidebarVisible(true);
    fetchComments(post._id);
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) {
      message.error("Comment cannot be empty");
      return;
    }
    if (!authToken) {
      notification.warning({
        message: "Login Required",
        description: "Please login to add comments",
      });
      return;
    }

    try {
      setCommentLoading(true);
      const response = await communityAPI.addComment(postId, {
        text: newComment,
      });

      setComments((prev) => [...prev, response.comment]);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), response.comment._id],
                commentsCount: (post.commentsCount || 0) + 1,
              }
            : post
        )
      );

      setNewComment("");
      message.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      notification.error({
        message: "Failed to add comment",
        description: error.response?.data?.message || "Please try again later",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="Community_Container">
      <div className="community_filter">
        <CommunityFilters
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          initialFilters={filters}
          initialSort={sortBy}
        />
      </div>
      <div className="community_main">
        <div className="create-post-button" onClick={handleOpenCreatePost}>
          <IoIosAdd size={25} /> Create Post
        </div>
        <CreatePostModal
          visible={isCreatingPost}
          onClose={handleCloseCreatePost}
          onSubmit={handleCreatePostSubmit}
          genres={genres}
          savedBuilds={getAllSavedBuilds()}
          loading={createPostLoading}
          preSelectedBuild={preSelectedBuild}
        />
        {loading && posts.length === 0 && (
          <div className="loading-container">
            <Spin size="medium" className="community_spin" />
            <p>Loading posts...</p>
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="no-posts-message">
            <p>No posts found. Be the first to create a post!</p>
          </div>
        )}
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onSavePost={handleSavePost}
            onRemoveSavedPost={handleRemoveSavedPost}
            onAddRating={handleAddRating}
            onSharePost={handleSharePost}
            onCommentClick={handleCommentClick}
            isPostSaved={isPostSavedByUser}
          />
        ))}
        {hasMore && posts.length > 0 && (
          <div className="load-more-container">
            <button
              className="load-more-button"
              onClick={loadMore}
              disabled={loading}
            >
              {loading && (
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{ color: "white", fontSize: 18 }}
                      spin
                    />
                  }
                  style={{ marginRight: 8 }}
                />
              )}
              Load More Posts
            </button>
          </div>
        )}
      </div>

      {commentSidebarVisible && currentPost && (
        <CommentModal
          visible={commentSidebarVisible}
          onClose={() => setCommentSidebarVisible(false)}
          comments={comments}
          commentLoading={commentLoading}
          newComment={newComment}
          setNewComment={setNewComment}
          handleAddComment={handleAddComment}
          authToken={authToken}
          post={currentPost}
        />
      )}
    </div>
  );
}

export default Community;
