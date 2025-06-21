// Updated PostCard.js - Enhanced avatar handling with debugging
import React, { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Rate, Spin } from "antd";
import {
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { RiShare2Line } from "react-icons/ri";
import BuildCarousel from "./BuildCarousel";
import PostCarousel from "./PostCarousel";
import CommunityBuildDetailsModal from "./CommunityBuildDetailsModal";
import "./PostCard.css";

const formatPostDate = (dateString) => {
  const postDate = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now - postDate;
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));

  if (diffInMinutes < 1) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "min" : "mins"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  } else {
    return postDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

const PostCard = ({
  post,
  onSavePost,
  onRemoveSavedPost,
  onAddRating,
  onSharePost,
  onCommentClick,
  isPostSaved,
}) => {
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(true);

  const hasImages = post.images && post.images.length > 0;
  const hasBuild = !!post.build;
  const isTextOnly = !hasImages && !hasBuild;
  const isImageOnly = hasImages && !hasBuild;
  const multipleImages = hasImages && post.images.length > 1;

  // Enhanced avatar handling with better debugging
  const getUserAvatar = () => {
    console.log("Post data for avatar:", {
      postId: post._id,
      user: post.user,
      userAvatar: post.user?.avatar,
      avatarType: typeof post.user?.avatar,
    });

    // Check if user exists
    if (!post.user) {
      console.log("No user object found in post");
      return null;
    }

    // Primary source: post.user.avatar
    let avatar = post.user.avatar;

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
      post.avatar,
      post.userAvatar,
      post.user?.profilePicture,
      post.user?.image,
      post.user?.profile?.avatar,
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

    console.log("No avatar found for user:", post.user?.username);
    return null;
  };

  const handleAvatarError = (e) => {
    console.error("Avatar failed to load:", e.target.src);
    setAvatarError(true);
    setAvatarLoading(false);
  };

  const handleAvatarLoad = () => {
    console.log("Avatar loaded successfully");
    setAvatarError(false);
    setAvatarLoading(false);
  };

  const handleBuildClick = () => {
    if (hasBuild && post.build?.components) {
      setShowBuildModal(true);
      document.body.style.overflow = "hidden";
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + post.images.length) % post.images.length
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
  };

  const closeBuildModal = () => {
    setShowBuildModal(false);
    document.body.style.overflow = "auto";
  };

  const userAvatar = getUserAvatar();

  // Avatar component with better loading states
  const AvatarComponent = () => {
    if (userAvatar && !avatarError) {
      return (
        <div className="community_user_avatar_container">
          {avatarLoading && (
            <div className="community_user_avatar_loading">
              <Spin size="small" />
            </div>
          )}
          <img
            src={userAvatar}
            alt={`${post.user?.username || "User"}'s avatar`}
            className="community_user_avatar"
            onError={handleAvatarError}
            onLoad={handleAvatarLoad}
            style={{ display: avatarLoading ? "none" : "block" }}
          />
        </div>
      );
    }

    return (
      <div className="community_user_avatar_placeholder">
        <UserOutlined className="community_user_avatar_icon" />
      </div>
    );
  };

  const buildContent = hasBuild && (
    <div className="community_post_content">
      <div
        className="community_post_image_container"
        style={{ cursor: "pointer" }}
      >
        <BuildCarousel
          components={post.build.components}
          onClick={handleBuildClick}
        />
      </div>
      <div className="community_post_details">
        <h3 className="community_build_title">{post.build.title}</h3>

        {post.build.description && (
          <p className="community_build_description">
            {post.build.description}
          </p>
        )}

        <div className="community_build_meta">
          <div className="post_average_rating">
            <span className="post_average_rating_star">★</span>
            <span>{post.averageRating?.toFixed(1) || 0} </span>
          </div>
          <div className="community_build_rating_section">
            <div className="community_build_rating">
              <Rate
                allowHalf
                value={post.userRating || 0}
                onChange={(value) => onAddRating(post._id, value)}
                className="post_rate_stars"
              />
              <span className="rating-text">
                {post.userRating?.toFixed(1) || 0} ({post.ratingsCount || 0}{" "}
                reviews)
              </span>
            </div>
          </div>

          {post.build.genre && (
            <div className="community_build_info_row">
              <span className="build-info-label">Genre:</span>
              <span className="build-info-value">{post.build.genre}</span>
            </div>
          )}

          <div className="community_build_info_row">
            <span className="build-info-label">Price:</span>
            <span className="build-info-value">
              EGP {post.build.totalPrice?.toLocaleString() || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`community_post ${isTextOnly ? "community_text_only" : ""}`}
      >
        {/* Post Header */}
        <div className="community_post_header">
          <div className="postHeader_userInfo">
            <AvatarComponent />
            <div className="community_user_info">
              <p className="community_user_name">
                {post.user?.username || post.username || "Unknown User"}
              </p>
              <p className="community_user_username">
                @
                {(
                  post.user?.username ||
                  post.username ||
                  "anonymous"
                ).toLowerCase()}
              </p>
            </div>
          </div>
          <div className="post_time_rating_section">
            <p className="community_post_time">
              {formatPostDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Post Description */}
        <div className="postHeader_desc">
          <p className="post-text-content">{post.text}</p>
        </div>

        {/* Post Content */}
        {(hasImages || hasBuild) && (
          <>
            {hasBuild && hasImages ? (
              <PostCarousel
                buildContent={buildContent}
                images={post.images}
                onBuildClick={handleBuildClick}
              />
            ) : hasBuild ? (
              buildContent
            ) : (
              <div className="community_images_container">
                {multipleImages ? (
                  <div className="image_slider">
                    <button
                      className="slider_arrow left"
                      onClick={handlePrevImage}
                    >
                      <FaChevronLeft />
                    </button>
                    <img
                      src={post.images[currentImageIndex].url}
                      alt={`Post content ${currentImageIndex}`}
                      className="community_post_image"
                    />
                    <button
                      className="slider_arrow right"
                      onClick={handleNextImage}
                    >
                      <FaChevronRight />
                    </button>
                    <div className="slider_indicator">
                      {currentImageIndex + 1} / {post.images.length}
                    </div>
                  </div>
                ) : (
                  <div className="side_by_side_images">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`Post content ${index}`}
                        className="community_post_image"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Post Footer */}
        <div className="community_post_footer">
          <div className="community_post_actions">
            <div
              className="community_post_action"
              onClick={() => onCommentClick(post)}
            >
              <FaRegComment className="community_post_action_icon" />
              <span>{post.comments?.length || 0}</span>
            </div>

            {isPostSaved(post._id) ? (
              <div
                className="community_post_action"
                onClick={() => onRemoveSavedPost(post._id)}
              >
                <FaBookmark className="community_post_action_icon" />
                <span>{post.savesCount || 0}</span>
              </div>
            ) : (
              <div
                className="community_post_action"
                onClick={() => onSavePost(post._id)}
              >
                <FaRegBookmark className="community_post_action_icon" />
                <span>{post.savesCount || 0}</span>
              </div>
            )}

            <div
              className="community_post_action"
              onClick={() => onSharePost(post._id)}
            >
              <RiShare2Line className="community_post_action_icon" />
              <span>{post.shareCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Build Details Modal */}
      {showBuildModal && (
        <CommunityBuildDetailsModal
          build={post.build}
          onClose={closeBuildModal}
        />
      )}
    </>
  );
};

export default PostCard;
