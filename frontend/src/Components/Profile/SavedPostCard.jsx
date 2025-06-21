import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import BuildDummy from "../../assets/images/build_dummy.svg";
import { FiRefreshCw } from "react-icons/fi";
import {
  FaShare,
  FaHeart,
  FaComment,
  FaBookmark,
  FaStar,
} from "react-icons/fa";
import { SavedPostsContext } from "../../Context/SavedPostsContext";
import { Input } from "antd";
import { EditOutlined, CheckOutlined } from "@ant-design/icons";
import "./ProfileBuildCard.css";
import "../Builder/Builder.css";

const { TextArea } = Input;

const COMPONENT_ORDER = [
  { key: "cpu", label: "CPU" },
  { key: "gpu", label: "GPU" },
  { key: "motherboard", label: "Motherboard" },
  { key: "case", label: "Case" },
  { key: "cooler", label: "Cooler" },
  { key: "memory", label: "Memory" },
  { key: "storage", label: "Storage" },
  { key: "psu", label: "Power Supply" },
];

function SavedPostCard({ build, onDeleteBuild }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(build.comments || []);
  const [isReconfiguring, setIsReconfiguring] = useState(false);
  const [title, setTitle] = useState(build.build?.title || "Untitled Build");
  const [description, setDescription] = useState(
    build.build?.description || ""
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const navigate = useNavigate();
  const { removeSavedPost } = useContext(SavedPostsContext);

  useEffect(() => {
    setComments(build.comments || []);
    setTitle(build.build?.title || "Untitled Build");
    setDescription(build.build?.description || "");
  }, [build.comments, build.build]);

  const handleRemoveSavedPost = async () => {
    try {
      await removeSavedPost(build._id);
      if (onDeleteBuild) onDeleteBuild(build._id);
    } catch (error) {
      console.error("Error removing saved post:", error);
    }
  };

  const handleRefreshComponent = (componentType) => {
    navigate(`/builder/${componentType}`, {
      state: {
        configureMode: true,
        selectedComponents: build.components,
        buildId: build._id || build.id,
        originalBuild: build,
      },
    });
  };

  const renderPostDetails = () => {
    const author = build.user?.username || build.author || "Unknown";
    const authorAvatar = build.user?.avatar || null;
    const imageUrl =
      build.image_source?.url || build.image_source || BuildDummy;

    console.log("Rendering post details:", {
      author,
      authorAvatar,
      userObject: build.user,
    });

    return (
      <div className="post-details">
        <div className="post-header">
          <div className="author-info">
            <img
              src={authorAvatar || BuildDummy}
              alt={author}
              className="author-avatar"
              onError={(e) => {
                console.log("Avatar failed to load:", authorAvatar);
                e.target.src = BuildDummy;
              }}
            />
            <div>
              <h4>{author}</h4>
              <span className="post-date">
                {new Date(build.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="post-content">
          <p>{build.content || build.text || "No content"}</p>
        </div>
        {imageUrl && imageUrl !== BuildDummy && (
          <div className="post-image-container">
            <img src={imageUrl} alt="Post content" className="post-image" />
          </div>
        )}
        {build.build && (
          <div className="attached-build">
            <h5>Attached Build</h5>
            <div className="build-preview">
              <img
                src={
                  build.build.components?.case?.image_source ||
                  build.build.image_source?.url ||
                  build.build.image_source ||
                  BuildDummy
                }
                alt="Build preview"
              />
              <div>
                <p>
                  <strong>Title:</strong>{" "}
                  {build.build.title || "Untitled Build"}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="post-metrics">
          <div className="metric">
            <FaHeart /> {build.likesCount || 0}
          </div>
          <div className="metric">
            <FaComment /> {comments.length || 0}
          </div>
          <div className="metric">
            <FaBookmark /> {build.savesCount || 0}
          </div>
          {build.averageRating && (
            <div className="metric">
              <FaStar /> {build.averageRating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderComments = () => {
    console.log("Rendering comments:", comments);

    return (
      <div className="comments-section">
        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => {
              const commentAuthor =
                comment.author?.username ||
                comment.user?.username ||
                "Anonymous";
              const commentAvatar =
                comment.author?.avatar || comment.user?.avatar || null;

              console.log("Rendering comment:", {
                commentId: comment.id || comment._id,
                author: commentAuthor,
                avatar: commentAvatar,
                comment: comment,
              });

              return (
                <div key={comment.id || comment._id} className="comment">
                  <div className="comment-header">
                    <img
                      src={commentAvatar || BuildDummy}
                      alt={commentAuthor}
                      className="comment-avatar"
                      onError={(e) => {
                        console.log(
                          "Comment avatar failed to load:",
                          commentAvatar
                        );
                        e.target.src = BuildDummy;
                      }}
                    />
                    <div>
                      <h5>{commentAuthor}</h5>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              );
            })
          ) : (
            <p className="no-comments">No comments yet</p>
          )}
        </div>
      </div>
    );
  };

  // Only show build tab if the post has a build
  const tabs = build.build
    ? [
        { id: "details", label: "Post Details" },
        { id: "build", label: "Build Components" },
        { id: "comments", label: "Comments" },
      ]
    : [
        { id: "details", label: "Post Details" },
        { id: "comments", label: "Comments" },
      ];

  const renderBuildComponents = () => (
    <div className="profile_buildDetails">
      <div className="profile_buildDetails_main">
        {/* Only show title, image, and description if build exists */}
        {build.build && (
          <>
            {/* Title Section */}
            <div className="profilefullbuild_title_container">
              <TextArea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter build title..."
                autoSize={{ minRows: 1, maxRows: 2 }}
                disabled={!isEditingTitle}
                className={`profilefullbuild_title_field ${
                  isEditingTitle ? "editing" : "not-editing"
                }`}
              />
              <span
                className="profilefullbuild_title_edit_icon"
                onClick={() => setIsEditingTitle(!isEditingTitle)}
              >
                {isEditingTitle ? <CheckOutlined /> : <EditOutlined />}
              </span>
            </div>

            {/* Build Image */}
            <div className="profile_buildDetails-image">
              <img
                src={
                  build.build.components?.case?.image_source ||
                  build.build.image_source?.url ||
                  build.build.image_source ||
                  BuildDummy
                }
                alt="Build"
              />
            </div>

            {/* Description Section */}
            <div className="profilefullbuild_desc_container">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add build description..."
                autoSize={{ minRows: 3, maxRows: 5 }}
                disabled={!isEditingDesc}
                className={`profilefullbuild_desc_field ${
                  isEditingDesc ? "editing" : "not-editing"
                }`}
              />
              <span
                className="profilefullbuild_desc_edit_icon"
                onClick={() => setIsEditingDesc(!isEditingDesc)}
              >
                {isEditingDesc ? <CheckOutlined /> : <EditOutlined />}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="profile_buildDetails_secondary">
        {build.build ? (
          COMPONENT_ORDER.map(({ key, label }, idx) => {
            const comp = build.build.components?.[key];
            return (
              <React.Fragment key={key}>
                <div className="profile_buildDetails_Component">
                  <p className="profile_buildDetails_Component-type">{label}</p>
                  <img
                    src={comp?.image_source || BuildDummy}
                    alt={comp?.title || comp?.product_name || label}
                  />
                  <p className="profile_buildDetails_Component-title">
                    {comp?.title || comp?.product_name || "N/A"}
                  </p>
                  <button
                    className="profilefullbuild_refresh_button"
                    onClick={() => handleRefreshComponent(key)}
                    aria-label={`Replace ${label}`}
                  >
                    <FiRefreshCw />
                  </button>
                </div>
                {idx < COMPONENT_ORDER.length - 1 && (
                  <div className="divider"></div>
                )}
              </React.Fragment>
            );
          })
        ) : (
          <div className="no-build-message">
            This post doesn't contain a PC build
          </div>
        )}
      </div>
    </div>
  );

  const author = build.user?.username || build.author || "Unknown";
  const imageUrl = build.image_source?.url || build.image_source || BuildDummy;

  return (
    <div className={`profile_buildCard ${isExpanded ? "expanded" : ""}`}>
      <div className="profile_buildCard_main">
        <div className="profile_buildCard_info">
          <img
            src={imageUrl}
            alt={build.title}
            className="build-image"
            onError={(e) => {
              e.target.src = BuildDummy;
            }}
          />
          <div className="build-info">
            <h3 className="profile_buildCard_title">
              {build.title || "Untitled Post"}
            </h3>
            <div className="post-meta">
              <span>By {author}</span>
              <span>•</span>
              <span>{new Date(build.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="profile_buildCard_buttons">
          <button
            className="profile_buildCard_Edit"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Close" : "View"}
          </button>
          {!isExpanded && (
            <button className="profile_buildCard_Share">
              <FaShare />
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="build-card-expanded-content">
          <div className="build-card_tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tab-content-container">
            {activeTab === "details" && renderPostDetails()}
            {activeTab === "build" && build.build && renderBuildComponents()}
            {activeTab === "comments" && renderComments()}
          </div>
          <div className="build-card_actions">
            <button className="delete-button" onClick={handleRemoveSavedPost}>
              <FaBookmark /> Unsave Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedPostCard;
