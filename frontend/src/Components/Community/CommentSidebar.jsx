import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { UserOutlined } from "@ant-design/icons";
import { Spin, Input, Button } from "antd";
import BuildCarousel from "./BuildCarousel";
import postImage from "../../assets/images/postBuild_dummy.png"; // Make sure to import
import BigImageSlider from "./BigImageSlider";
const { TextArea } = Input;
import "./Comment.css"; // Adjust the path as necessary

function CommentModal({
  visible,
  onClose,
  comments,
  commentLoading,
  newComment,
  setNewComment,
  handleAddComment,
  authToken,
  post,
}) {
  const [avatarErrors, setAvatarErrors] = useState(new Set());
  const [avatarLoading, setAvatarLoading] = useState(new Set());

  if (!visible) return null;

  const handleCommentSubmit = () => {
    handleAddComment(post._id);
  };

  const isTextOnly =
    !post?.build && (!post?.images || post.images.length === 0);

  // Enhanced avatar handling function (same logic as PostCard)
  const getUserAvatar = (user) => {
    console.log("Comment user data for avatar:", {
      userId: user?._id,
      user: user,
      userAvatar: user?.avatar,
      avatarType: typeof user?.avatar,
    });

    // Check if user exists
    if (!user) {
      console.log("No user object found in comment");
      return null;
    }

    // Primary source: user.avatar
    let avatar = user.avatar;

    // Handle different avatar formats
    if (avatar) {
      // If avatar is an object with url property (Cloudinary format)
      if (typeof avatar === "object" && avatar.url) {
        console.log("Using avatar.url:", avatar.url);
        return avatar.url;
      }

      // If avatar is already a string URL
      if (typeof avatar === "string" && avatar.trim() !== "") {
        console.log("Using avatar string:", avatar);
        return avatar;
      }
    }

    // Fallback sources
    const fallbackSources = [
      user.profilePicture,
      user.image,
      user.profile?.avatar,
    ];

    for (let source of fallbackSources) {
      if (source) {
        if (typeof source === "object" && source.url) {
          console.log("Using fallback object avatar:", source.url);
          return source.url;
        }
        if (typeof source === "string" && source.trim() !== "") {
          console.log("Using fallback string avatar:", source);
          return source;
        }
      }
    }

    console.log("No avatar found for user:", user?.username);
    return null;
  };

  const handleAvatarError = (userId) => {
    console.error("Avatar failed to load for user:", userId);
    setAvatarErrors((prev) => new Set([...prev, userId]));
    setAvatarLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const handleAvatarLoad = (userId) => {
    console.log("Avatar loaded successfully for user:", userId);
    setAvatarErrors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
    setAvatarLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const handleAvatarLoadStart = (userId) => {
    setAvatarLoading((prev) => new Set([...prev, userId]));
  };

  // Avatar component for comments
  const CommentAvatarComponent = ({ user }) => {
    const userId = user?._id || user?.username || "anonymous";
    const userAvatar = getUserAvatar(user);
    const hasError = avatarErrors.has(userId);
    const isLoading = avatarLoading.has(userId);

    if (userAvatar && !hasError) {
      return (
        <div className="comment-user-avatar-container">
          {isLoading && (
            <div className="comment-user-avatar-loading">
              <Spin size="small" />
            </div>
          )}
          <img
            src={userAvatar}
            alt={`${user?.username || "User"}'s avatar`}
            className="comment-user-avatar"
            onError={() => handleAvatarError(userId)}
            onLoad={() => handleAvatarLoad(userId)}
            onLoadStart={() => handleAvatarLoadStart(userId)}
            style={{ display: isLoading ? "none" : "block" }}
          />
        </div>
      );
    }

    return (
      <div className="comment-user-avatar-placeholder">
        <UserOutlined className="comment-default-avatar" />
      </div>
    );
  };

  return (
    <div className="comment-modal-overlay">
      <div className={`comment-modal${isTextOnly ? " text-only" : ""}`}>
        <button className="close-modal" onClick={onClose}>
          <FaTimes />
        </button>
        {/* Post Content Section
        {post?.build ? (
          <BigImageSlider components={post.build.components} />
        ) : post?.images && post.images.length > 0 ? (
          <BigImageSlider images={post.images} />
        ) : null} */}
        {/* Comments Section */}
        <div className="modal-comments-section">
          <div className="modal-comments-header">
            <h3>Comments ({comments.length})</h3>
          </div>
          <div className="modal-comments-list">
            {commentLoading && comments.length === 0 ? (
              <Spin size="large" />
            ) : comments.length === 0 ? (
              <p className="no-comments">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-user">
                    <div className="comment-user-info">
                      <CommentAvatarComponent user={comment.user} />
                      <span className="comment-username">
                        {comment.user?.username || "Anonymous"}
                      </span>
                    </div>
                    <span className="comment-time">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="modal-comment-input">
            <TextArea
              rows={3}
              placeholder="Write your comment..."
              style={{ color: "white" }}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!authToken}
            />
            <Button
              type="primary"
              onClick={handleCommentSubmit}
              loading={commentLoading}
              disabled={!newComment.trim() || !authToken}
            >
              Post Comment
            </Button>
            {!authToken && (
              <p className="login-prompt">Please login to leave a comment</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;
