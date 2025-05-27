// import React, { useCallback, useState, useContext, useEffect } from "react";
// import "./Community.css";
// import Filters from "../Filters/Filters";
// import { useNavigate } from "react-router-dom";
// import { UserOutlined, LoadingOutlined } from "@ant-design/icons";
// import { IoIosAdd } from "react-icons/io";
// import postImage from "../../assets/images/postBuild_dummy.png";
// import { SavedComponentsContext } from "../../Context/SavedComponentContext";
// import {
//   FaTimes,
//   FaRegComment,
//   FaRegBookmark,
//   FaBookmark,
// } from "react-icons/fa";
// import { Rate, Spin, notification, message, Input, Button } from "antd";
// import { RiShare2Line } from "react-icons/ri";
// import communityAPI from "../../services/community";
// import { UserContext } from "../../Context/UserContext";
// import { SavedPostsContext } from "../../Context/SavedPostsContext";
// import CreatePostModal from "./CreatePostModal";
// import "../CreatePostModal/CreatePostModal.css";
// import CommentModal from "../CommentSidebar/CommentSidebar";
// import axios from "axios";
// import CommunityFilters from "../Filters/CommunityFilters";
// import BuildCarousel from "./BuildCarousel";

// const { TextArea } = Input;

// function Community() {
//   const [sortBy, setSortBy] = useState("newest");
//   const [filters, setFilters] = useState({});
//   const [isCreatingPost, setIsCreatingPost] = useState(false);
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [commentSidebarVisible, setCommentSidebarVisible] = useState(false);
//   const [currentPostId, setCurrentPostId] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState("");
//   const [commentLoading, setCommentLoading] = useState(false);
//   const [authChecked, setAuthChecked] = useState(false);
//   // Update the state to track the current post for the modal
//   const [currentPost, setCurrentPost] = useState(null);
//   const { savedComponents } = useContext(SavedComponentsContext);
//   const { user, authToken } = useContext(UserContext) || {
//     user: null,
//     authToken: false,
//   };
//   const {
//     savedPosts,
//     fetchSavedPosts,
//     addSavedPost,
//     removeSavedPost,
//     isPostSaved,
//   } = useContext(SavedPostsContext);

//   const navigate = useNavigate();

//   useEffect(() => {
//     setAuthChecked(true);
//   }, []);

//   useEffect(() => {
//     fetchSavedPosts();
//   }, [user?._id, fetchSavedPosts]);

//   const genres = [
//     "Gaming",
//     "Workstation",
//     "Streaming",
//     "Editing",
//     "Budget",
//     "High-End",
//     "Custom",
//     "Office",
//     "Home Theater",
//   ];

//   useEffect(() => {
//     fetchPosts();
//   }, [sortBy, filters]);

//   const fetchPosts = async (newPage = 1) => {
//     try {
//       setLoading(true);
//       const params = {
//         page: newPage,
//         limit: 5,
//         sortBy: sortBy,
//         ...filters,
//       };
//       const response = await communityAPI.getPosts(params);

//       const postsWithData = response.posts.map((post) => {
//         const userRating = post.ratings?.find(
//           (r) => r.user === user?._id
//         )?.value;

//         return {
//           ...post,
//           savesCount: post.savesCount || 0,
//           isBookmarked: isPostSaved(post._id),
//           userRating: userRating || null,
//           averageRating: post.averageRating || 0,
//           ratingsCount: post.ratings?.length || 0,
//         };
//       });

//       if (newPage === 1) {
//         setPosts(postsWithData);
//       } else {
//         setPosts((prev) => [...prev, ...postsWithData]);
//       }

//       setHasMore(response.page < response.pages);
//       setPage(response.page);
//     } catch (error) {
//       notification.error({
//         message: "Failed to load posts",
//         description: error.message || "Please try again later",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSavePost = async (postId) => {
//     if (!authToken) {
//       notification.warning({
//         message: "Login Required",
//         description: "Please login to save posts",
//       });
//       return;
//     }

//     try {
//       const response = await communityAPI.savePost(postId);
//       if (response.success) {
//         setPosts((prevPosts) =>
//           prevPosts.map((post) =>
//             post._id === postId
//               ? { ...post, savesCount: response.savesCount }
//               : post
//           )
//         );
//         fetchSavedPosts();
//         message.success("Post saved successfully!");
//       }
//     } catch (error) {
//       notification.error({
//         message: "Save Failed",
//         description: error.response?.data?.message || "Please try again later",
//       });
//     }
//   };

//   const handleRemoveSavedPost = async (postId) => {
//     if (!authToken) {
//       notification.warning({
//         message: "Login Required",
//         description: "Please login to remove saved posts",
//       });
//       return;
//     }

//     try {
//       const response = await communityAPI.removeSavedPost(postId);
//       if (response.success) {
//         setPosts((prevPosts) =>
//           prevPosts.map((post) =>
//             post._id === postId
//               ? { ...post, savesCount: response.savesCount }
//               : post
//           )
//         );
//         fetchSavedPosts();
//         message.success("Post removed from saved!");
//       }
//     } catch (error) {
//       notification.error({
//         message: "Remove Failed",
//         description: error.response?.data?.message || "Please try again later",
//       });
//     }
//   };

//   const isPostSavedByUser = (postId) => {
//     return isPostSaved(postId);
//   };

//   const loadMore = () => {
//     if (!loading && hasMore) {
//       fetchPosts(page + 1);
//     }
//   };

//   const getAllSavedBuilds = () => {
//     const savedBuilds = [];
//     if (savedComponents?.folders) {
//       if (savedComponents.folders[1]) {
//         savedComponents.folders[1].forEach((folder) => {
//           if (folder.profileBuilds && folder.profileBuilds.length > 0) {
//             savedBuilds.push(
//               ...folder.profileBuilds.map((build) => ({
//                 ...build,
//                 folderName: folder.name,
//                 folderType: "Completed Builds",
//               }))
//             );
//           }
//         });
//       }
//       if (savedComponents.folders[2]) {
//         savedComponents.folders[2].forEach((folder) => {
//           if (folder.profileBuilds && folder.profileBuilds.length > 0) {
//             savedBuilds.push(
//               ...folder.profileBuilds.map((build) => ({
//                 ...build,
//                 folderName: folder.name,
//                 folderType: "Saved Builds",
//               }))
//             );
//           }
//         });
//       }
//     }
//     return savedBuilds;
//   };

//   const handleFilterChange = useCallback((newFilters) => {
//     setFilters(newFilters);
//     setPage(1);
//   }, []);

//   const handleSortChange = useCallback((sortValue) => {
//     setSortBy(sortValue);
//     setPage(1);
//   }, []);

//   const [createPostLoading, setCreatePostLoading] = useState(false);

//   const handleOpenCreatePost = () => {
//     if (authChecked && !authToken) {
//       notification.warning({
//         message: "Login Required",
//         description: "Please login to create a post",
//       });
//       return;
//     }
//     setIsCreatingPost(true);
//   };

//   const handleCloseCreatePost = () => {
//     setIsCreatingPost(false);
//   };

//   const handleCreatePostSubmit = async ({
//     postText,
//     imageFiles,
//     selectedBuild,
//   }) => {
//     if (
//       !postText &&
//       !selectedBuild &&
//       (!imageFiles || imageFiles.length === 0)
//     ) {
//       message.error("Post must have text, images, or a build");
//       return;
//     }

//     if (!authToken) {
//       notification.warning({
//         message: "Login Required",
//         description: "Please login to create a post",
//       });
//       return;
//     }

//     try {
//       setCreatePostLoading(true);

//       const formData = new FormData();
//       formData.append("text", postText || "");

//       if (selectedBuild) {
//         formData.append("buildId", selectedBuild._id);
//       }

//       if (imageFiles && imageFiles.length > 0) {
//         imageFiles.forEach((file) => {
//           formData.append("images", file);
//         });
//       }

//       const response = await axios.post(
//         "http://localhost:4000/api/posts/create",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//           withCredentials: true,
//         }
//       );

//       if (response.data.success) {
//         message.success("Post created successfully!");
//         setIsCreatingPost(false);
//         fetchPosts(1);
//       } else {
//         throw new Error(response.data.message || "Failed to create post");
//       }
//     } catch (error) {
//       console.error("Error creating post:", error);
//       notification.error({
//         message: "Failed to create post",
//         description: error.response?.data?.message || error.message,
//       });
//     } finally {
//       setCreatePostLoading(false);
//     }
//   };

//   const handleAddRating = async (postId, value) => {
//     if (!authToken) {
//       notification.warning({
//         message: "Login Required",
//         description: "Please login to rate posts",
//       });
//       return;
//     }

//     try {
//       const roundedValue = Math.round(value * 2) / 2;

//       const response = await communityAPI.addRating(postId, roundedValue);

//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post._id === postId
//             ? {
//                 ...post,
//                 averageRating: response.averageRating,
//                 userRating: roundedValue, // Always set the user's rating
//                 ratingsCount: response.ratingsCount,
//                 ratings: response.ratings || [],
//               }
//             : post
//         )
//       );

//       message.success(`Rated ${roundedValue} stars!`);
//     } catch (error) {
//       console.error("Rating error:", error);
//       notification.error({
//         message: "Rating Failed",
//         description: error.response?.data?.message || "Please try again later",
//       });
//     }
//   };

//   const handleSharePost = async (postId) => {
//     try {
//       const response = await communityAPI.sharePost(postId);
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post._id === postId ? { ...post, shareCount: response.shares } : post
//         )
//       );
//       message.success("Post shared!");
//     } catch (error) {
//       notification.error({
//         message: "Share Failed",
//         description: error.message || "Please try again later",
//       });
//     }
//   };

//   // const handleCommentClick = async (postId) => {
//   //   setCurrentPostId(postId);
//   //   setCommentSidebarVisible(true);
//   //   fetchComments(postId);
//   // };

//   const fetchComments = async (postId) => {
//     try {
//       setCommentLoading(true);
//       const response = await communityAPI.getPostComments(postId);
//       setComments(response.comments || []);
//     } catch (error) {
//       notification.error({
//         message: "Failed to load comments",
//         description: error.message || "Please try again later",
//       });
//     } finally {
//       setCommentLoading(false);
//     }
//   };
//   // Update the handleCommentClick function
//   const handleCommentClick = async (post) => {
//     setCurrentPost(post);
//     setCommentSidebarVisible(true);
//     fetchComments(post._id);
//   };
//   // Update the handleAddComment function in your Community component
//   const handleAddComment = async (postId) => {
//     if (!newComment.trim()) {
//       message.error("Comment cannot be empty");
//       return;
//     }
//     if (!authToken) {
//       notification.warning({
//         message: "Login Required",
//         description: "Please login to add comments",
//       });
//       return;
//     }

//     try {
//       setCommentLoading(true);
//       const response = await communityAPI.addComment(postId, {
//         text: newComment,
//       });

//       // Update comments list
//       setComments((prev) => [...prev, response.comment]);

//       // Update posts list to reflect new comment count
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post._id === postId
//             ? {
//                 ...post,
//                 comments: [...(post.comments || []), response.comment._id],
//                 commentsCount: (post.commentsCount || 0) + 1,
//               }
//             : post
//         )
//       );

//       // Clear the comment input
//       setNewComment("");
//       message.success("Comment added successfully!");
//     } catch (error) {
//       console.error("Error adding comment:", error);
//       notification.error({
//         message: "Failed to add comment",
//         description: error.response?.data?.message || "Please try again later",
//       });
//     } finally {
//       setCommentLoading(false);
//     }
//   };

//   return (
//     <div className="Community_Container">
//       <div className="community_filter">
//         <CommunityFilters
//           onFilterChange={handleFilterChange}
//           onSortChange={handleSortChange}
//           initialFilters={filters}
//           initialSort={sortBy}
//         />
//       </div>
//       <div className="community_main">
//         <div className="create-post-button" onClick={handleOpenCreatePost}>
//           <IoIosAdd size={25} /> Create Post
//         </div>
//         <CreatePostModal
//           visible={isCreatingPost}
//           onClose={handleCloseCreatePost}
//           onSubmit={handleCreatePostSubmit}
//           genres={genres}
//           savedBuilds={getAllSavedBuilds()}
//           loading={createPostLoading}
//         />
//         {loading && posts.length === 0 && (
//           <div className="loading-container">
//             <Spin size="large" />
//             <p>Loading posts...</p>
//           </div>
//         )}
//         {!loading && posts.length === 0 && (
//           <div className="no-posts-message">
//             <p>No posts found. Be the first to create a post!</p>
//           </div>
//         )}
//         {posts.map((post) => (
//           <div className="community_post" key={post._id}>
//             <div className="community_post_header">
//               <div className="postHeader_userInfo">
//                 <div className="postHeader_userInfo_firstpart">
//                   {post.user?.avatar ? (
//                     <img
//                       src={post.user.avatar}
//                       alt="User avatar"
//                       className="user-avatar"
//                     />
//                   ) : (
//                     <UserOutlined className="community_default-avatar-icon" />
//                   )}
//                   <p className="post_userName">
//                     {post.user?.username || "Unknown User"}
//                   </p>
//                   <p className="post_timeposted">
//                     {new Date(post.createdAt).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <div className="postHeader_userInfo_secondpart">
//                   {post.user?._id !== user?._id && (
//                     <button className="community_follow_button">
//                       <IoIosAdd />
//                       <p>Follow</p>
//                     </button>
//                   )}
//                 </div>
//               </div>
//               <div className="postHeader_desc">
//                 <p className="post-text-content">{post.text}</p>
//               </div>
//             </div>
//             <div className="community_post_first">
//               <div className="community_post_content">
//                 <div className="community_post_image_sec">
//                   {post.images && post.images.length > 0 ? (
//                     <div className="post-images-container">
//                       {post.images.map((image, index) => (
//                         <div key={index} className="post-image-wrapper">
//                           <img
//                             src={image.url}
//                             alt={`Post content ${index}`}
//                             className="post-image"
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   ) : post.build ? (
//                     <BuildCarousel components={post.build.components} />
//                   ) : (
//                     <div className="post_buildImage">
//                       <img src={postImage} alt="Default post" />
//                     </div>
//                   )}
//                 </div>
//                 <div className="community_post_info_sec">
//                   <div className="post_averageRating">
//                     • Avg: {post.averageRating?.toFixed(1) || 0}
//                   </div>
//                   <div className="post_buildUser_Rate">
//                     <Rate
//                       allowHalf
//                       value={post.userRating || 0}
//                       onChange={(value) => handleAddRating(post._id, value)}
//                       className="post_rate_stars"
//                     />
//                     <p>
//                       | {post.ratingsCount || 0} Reviews
//                       {post.averageRating?.toFixed(1) || 0}
//                     </p>
//                   </div>
//                   {post.build && (
//                     <div className="post_buildContent">
//                       <p className="post_buildTitle">
//                         <span style={{ color: "#bf30d9" }}>Build Title : </span>
//                         {post.build.title}
//                       </p>
//                       <p className="post_buildDesc">
//                         <span style={{ color: "#bf30d9" }}>Description : </span>
//                         {post.build.description}
//                         {/* {`Build description : ${post.build.description}`} */}
//                       </p>
//                       <p className="post_buildPrice">
//                         <span style={{ color: "#bf30d9" }}>
//                           {" "}
//                           Total Price :{" "}
//                         </span>
//                         {`EGP ${post.build.totalPrice}`}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="community_post_second">
//               <div className="community_post_footer">
//                 <div className="community_post_icons">
//                   <FaRegComment
//                     size={18}
//                     className="post-icon"
//                     onClick={() => handleCommentClick(post)}
//                   />
//                   {isPostSavedByUser(post._id) ? (
//                     <FaBookmark
//                       size={18}
//                       className="post-icon bookmarked"
//                       onClick={() => handleRemoveSavedPost(post._id)}
//                     />
//                   ) : (
//                     <FaRegBookmark
//                       size={18}
//                       className="post-icon"
//                       onClick={() => handleSavePost(post._id)}
//                     />
//                   )}
//                   <RiShare2Line
//                     size={22}
//                     className="post-icon"
//                     onClick={() => handleSharePost(post._id)}
//                   />
//                   <span className="post-metrics">
//                     {post.comments?.length || 0} comments ·{" "}
//                     {post.savesCount || 0} saves · {post.shareCount || 0} shares
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//         {hasMore && posts.length > 0 && (
//           <div className="load-more-container">
//             <button
//               className="load-more-button"
//               onClick={loadMore}
//               disabled={loading}
//             >
//               {loading && (
//                 <Spin
//                   indicator={
//                     <LoadingOutlined
//                       style={{ color: "white", fontSize: 18 }}
//                       spin
//                     />
//                   }
//                   style={{ marginRight: 8 }}
//                 />
//               )}
//               Load More Posts
//             </button>
//           </div>
//         )}
//       </div>

//       {commentSidebarVisible && currentPost && (
//         <CommentModal
//           visible={commentSidebarVisible}
//           onClose={() => setCommentSidebarVisible(false)}
//           comments={comments}
//           commentLoading={commentLoading}
//           newComment={newComment}
//           setNewComment={setNewComment}
//           handleAddComment={handleAddComment}
//           authToken={authToken}
//           post={currentPost} // Pass the current post to the modal
//         />
//       )}
//     </div>
//   );
// }

// export default Community;
import React, { useCallback, useState, useContext, useEffect } from "react";
import "./Community.css";
import Filters from "../Filters/Filters";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    fetchSavedPosts();
  }, [user?._id, fetchSavedPosts]);

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

  useEffect(() => {
    fetchPosts();
  }, [sortBy, filters]);

  const fetchPosts = async (newPage = 1) => {
    try {
      setLoading(true);
      const params = {
        page: newPage,
        limit: 5,
        sortBy: sortBy,
        ...filters,
      };
      const response = await communityAPI.getPosts(params);

      const postsWithData = response.posts.map((post) => {
        const userRating = post.ratings?.find(
          (r) => r.user === user?._id
        )?.value;

        return {
          ...post,
          savesCount: post.savesCount || 0,
          isBookmarked: isPostSaved(post._id),
          userRating: userRating || null,
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

  const handleSavePost = async (postId) => {
    if (!authToken) {
      notification.warning({
        message: "Login Required",
        description: "Please login to save posts",
      });
      return;
    }

    try {
      const response = await communityAPI.savePost(postId);
      if (response.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, savesCount: response.savesCount }
              : post
          )
        );
        fetchSavedPosts();
        message.success("Post saved successfully!");
      }
    } catch (error) {
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

    try {
      const response = await communityAPI.removeSavedPost(postId);
      if (response.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? { ...post, savesCount: response.savesCount }
              : post
          )
        );
        fetchSavedPosts();
        message.success("Post removed from saved!");
      }
    } catch (error) {
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
                userRating: roundedValue, // Always set the user's rating
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
        />
        {loading && posts.length === 0 && (
          <div className="loading-container">
            <Spin size="large" />
            <p>Loading posts...</p>
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="no-posts-message">
            <p>No posts found. Be the first to create a post!</p>
          </div>
        )}
        {posts.map((post) => {
          const hasImages = post.images && post.images.length > 0;
          const hasBuild = !!post.build;
          const isTextOnly = !hasImages && !hasBuild;

          return (
            <div className="community_post" key={post._id}>
              {/* Show rating at top if text-only */}

              <div className="community_post_header">
                <div className="postHeader_userInfo">
                  <div className="postHeader_userInfo_firstpart">
                    {post.user?.avatar ? (
                      <img
                        src={post.user.avatar}
                        alt="User avatar"
                        className="user-avatar"
                      />
                    ) : (
                      <UserOutlined className="community_default-avatar-icon" />
                    )}
                    <p className="post_userName">
                      {post.user?.username || "Unknown User"}
                    </p>
                    <p className="post_timeposted">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {isTextOnly && (
                    <div className="community_post_info_sec">
                      <div className="post_averageRating">
                        • Avg: {post.averageRating?.toFixed(1) || 0}
                      </div>
                      <div className="post_buildUser_Rate">
                        <Rate
                          allowHalf
                          value={post.userRating || 0}
                          onChange={(value) => handleAddRating(post._id, value)}
                          className="post_rate_stars"
                        />
                        <p>
                          | {post.ratingsCount || 0} Reviews
                          {post.averageRating?.toFixed(1) || 0}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="postHeader_userInfo_secondpart">
                    {post.user?._id !== user?._id && (
                      <button className="community_follow_button">
                        <IoIosAdd />
                        <p>Follow</p>
                      </button>
                    )}
                  </div>
                </div>
                <div className="postHeader_desc">
                  <p className="post-text-content">{post.text}</p>
                </div>
              </div>

              {/* Only show image/build section if images or build exist */}
              {(hasImages || hasBuild) && (
                <div className="community_post_first">
                  <div className="community_post_content">
                    <div className="community_post_image_sec">
                      {hasImages ? (
                        <div className="post-images-container">
                          {post.images.map((image, index) => (
                            <div key={index} className="post-image-wrapper">
                              <img
                                src={image.url}
                                alt={`Post content ${index}`}
                                className="post-image"
                              />
                            </div>
                          ))}
                        </div>
                      ) : hasBuild ? (
                        <BuildCarousel components={post.build.components} />
                      ) : null}
                    </div>
                    <div className="community_post_info_sec">
                      <div className="post_averageRating">
                        • Avg: {post.averageRating?.toFixed(1) || 0}
                      </div>
                      <div className="post_buildUser_Rate">
                        <Rate
                          allowHalf
                          value={post.userRating || 0}
                          onChange={(value) => handleAddRating(post._id, value)}
                          className="post_rate_stars"
                        />
                        <p>
                          | {post.ratingsCount || 0} Reviews
                          {post.averageRating?.toFixed(1) || 0}
                        </p>
                      </div>
                      {hasBuild && (
                        <div className="post_buildContent">
                          <p className="post_buildTitle">
                            <span style={{ color: "#bf30d9" }}>
                              Build Title :{" "}
                            </span>
                            {post.build.title}
                          </p>
                          <p className="post_buildDesc">
                            <span style={{ color: "#bf30d9" }}>
                              Description :{" "}
                            </span>
                            {post.build.description}
                          </p>
                          <p className="post_buildPrice">
                            <span style={{ color: "#bf30d9" }}>
                              {" "}
                              Total Price :{" "}
                            </span>
                            {`EGP ${post.build.totalPrice}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="community_post_second">
                <div className="community_post_footer">
                  <div className="community_post_icons">
                    <FaRegComment
                      size={18}
                      className="post-icon"
                      onClick={() => handleCommentClick(post)}
                    />
                    {isPostSavedByUser(post._id) ? (
                      <FaBookmark
                        size={18}
                        className="post-icon bookmarked"
                        onClick={() => handleRemoveSavedPost(post._id)}
                      />
                    ) : (
                      <FaRegBookmark
                        size={18}
                        className="post-icon"
                        onClick={() => handleSavePost(post._id)}
                      />
                    )}
                    <RiShare2Line
                      size={22}
                      className="post-icon"
                      onClick={() => handleSharePost(post._id)}
                    />
                    <span className="post-metrics">
                      {post.comments?.length || 0} comments ·{" "}
                      {post.savesCount || 0} saves · {post.shareCount || 0}{" "}
                      shares
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
