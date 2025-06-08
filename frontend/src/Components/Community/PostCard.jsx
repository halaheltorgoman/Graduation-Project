import React, { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Rate, Spin } from "antd";
import {
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
  FaTimes,
} from "react-icons/fa";
import { RiShare2Line } from "react-icons/ri";
import BuildCarousel from "./BuildCarousel";
import CommunityBuildDetailsModal from "./CommunityBuildDetailsModal";
import "./PostCard.css"; // Adjust the path as necessary

// Helper function to format the date
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
  const hasImages = post.images && post.images.length > 0;
  const hasBuild = !!post.build;
  const isTextOnly = !hasImages && !hasBuild;

  const handleBuildClick = () => {
    if (hasBuild && post.build?.components) {
      setShowBuildModal(true);
    }
  };

  const closeBuildModal = () => {
    setShowBuildModal(false);
  };

  return (
    <>
      <div className={`community_post`} key={post._id}>
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
              <div className="user-info-container">
                <p className="post_userName">
                  {post.user?.username || "Unknown User"}
                </p>
                <p className="post_timeposted">
                  {formatPostDate(post.createdAt)}
                </p>
              </div>
            </div>
            {isTextOnly && (
              <div className="community_post_info_sec">
                <div className="post_averageRating">
                  • Average Rating : {post.averageRating?.toFixed(1) || 0}
                </div>
                <div className="post_buildUser_Rate">
                  <Rate
                    allowHalf
                    value={post.userRating || 0}
                    onChange={(value) => onAddRating(post._id, value)}
                    className="post_rate_stars"
                  />
                  <p>
                    {post.userRating?.toFixed(1) || 0}| {post.ratingsCount || 0}{" "}
                    Reviews
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="postHeader_desc">
            <p className="post-text-content">{post.text}</p>
          </div>
        </div>

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
                  <div onClick={handleBuildClick} style={{ cursor: "pointer" }}>
                    <BuildCarousel components={post.build.components} />
                  </div>
                ) : null}
              </div>
              <div className="community_post_info_sec">
                <div className="post_averageRating">
                  • Avg Rating : {post.averageRating?.toFixed(1) || 0}
                </div>
                <div className="post_buildUser_Rate">
                  <Rate
                    allowHalf
                    value={post.userRating || 0}
                    onChange={(value) => onAddRating(post._id, value)}
                    className="post_rate_stars"
                  />
                  <p>
                    {post.userRating?.toFixed(1) || 0}| {post.ratingsCount || 0}{" "}
                    Reviews
                  </p>
                </div>
                {hasBuild && (
                  <div className="post_buildContent">
                    <p className="post_buildTitle">
                      <span style={{ color: "#bf30d9" }}>Build Title : </span>
                      {post.build.title}
                    </p>
                    <p className="post_buildDesc">
                      <span style={{ color: "#bf30d9" }}>Description : </span>
                      {post.build.description}
                    </p>
                    <p className="post_buildPrice">
                      <span style={{ color: "#bf30d9" }}> Total Price : </span>
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
                onClick={() => onCommentClick(post)}
              />
              {isPostSaved(post._id) ? (
                <FaBookmark
                  size={18}
                  className="post-icon bookmarked"
                  onClick={() => onRemoveSavedPost(post._id)}
                />
              ) : (
                <FaRegBookmark
                  size={18}
                  className="post-icon"
                  onClick={() => onSavePost(post._id)}
                />
              )}
              <RiShare2Line
                size={22}
                className="post-icon"
                onClick={() => onSharePost(post._id)}
              />
              <span className="post-metrics">
                {post.comments?.length || 0} comments · {post.savesCount || 0}{" "}
                saves · {post.shareCount || 0} shares
              </span>
            </div>
          </div>
        </div>
      </div>

      {hasBuild && showBuildModal && post.build?.components && (
        <CommunityBuildDetailsModal
          build={post.build}
          onClose={closeBuildModal}
        />
      )}
    </>
  );
};

export default PostCard;
