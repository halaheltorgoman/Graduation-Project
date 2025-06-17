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
  const hasImages = post.images && post.images.length > 0;
  const hasBuild = !!post.build;
  const isTextOnly = !hasImages && !hasBuild;
  const isImageOnly = hasImages && !hasBuild;
  const multipleImages = hasImages && post.images.length > 1;

  const handleBuildClick = () => {
    if (hasBuild && post.build?.components) {
      setShowBuildModal(true);
      document.body.style.overflow = "hidden";
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + post.images.length) % post.images.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % post.images.length);
  };

  const closeBuildModal = () => {
    setShowBuildModal(false);
    document.body.style.overflow = "auto";
  };

  return (
    <>
      <div className={`community_post ${isTextOnly ? "community_text_only" : ""}`}>
        {/* Post Header */}
        <div className="community_post_header">
          <div className="postHeader_userInfo">
            {post.user?.avatar ? (
              <img
                src={post.user.avatar}
                alt="User avatar"
                className="community_user_avatar"
              />
            ) : (
              <UserOutlined className="community_user_avatar" />
            )}
            <div className="community_user_info">
              <p className="community_user_name">
                {post.user?.username || "Unknown User"}
              </p>
              <p className="community_user_username">
                @{post.user?.username?.toLowerCase() || "anonymous"}
              </p>
            </div>
          </div>
          <p className="community_post_time">
            {formatPostDate(post.createdAt)}
          </p>
        </div>

        {/* Post Description */}
        <div className="postHeader_desc">
          <p className="post-text-content">{post.text}</p>
        </div>

        {/* Post Content */}
        {(hasImages || hasBuild) && (
          <div className="community_post_content">
            {hasBuild ? (
              <>
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
                  {/* Build Title */}
                  <h3 className="community_build_title">
                    {post.build.title}
                  </h3>
                  
                  {/* Build Description */}
                  {post.build.description && (
                    <p className="community_build_description">
                      {post.build.description}
                    </p>
                  )}
                  
                  {/* Build Meta Information */}
                  <div className="community_build_meta">
                    {/* Rating Section */}
                    <div className="community_build_rating_section">
                      <div className="community_build_rating">
                        <Rate
                          allowHalf
                          value={post.userRating || 0}
                          onChange={(value) => onAddRating(post._id, value)}
                          className="post_rate_stars"
                        />
                        <span className="rating-text">
                          {post.userRating?.toFixed(1) || 0} ({post.ratingsCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                    
                    {/* Build Genre */}
                    {post.build.genre && (
                      <div className="community_build_info_row">
                        <span className="build-info-label">Genre:</span>
                        <span className="build-info-value">{post.build.genre}</span>
                      </div>
                    )}
                    
                    {/* Build Price */}
                    <div className="community_build_info_row">
                      <span className="build-info-label">Price:</span>
                      <span className="build-info-value">
                        EGP {post.build.totalPrice?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="community_images_container">
                {multipleImages ? (
                  <div className="image_slider">
                    <button className="slider_arrow left" onClick={handlePrevImage}>
                      <FaChevronLeft />
                    </button>
                    <img
                      src={post.images[currentImageIndex].url}
                      alt={`Post content ${currentImageIndex}`}
                      className="community_post_image"
                    />
                    <button className="slider_arrow right" onClick={handleNextImage}>
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
          </div>
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