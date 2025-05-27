import React, { useState, useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { FaTimes } from "react-icons/fa";
import { Spin, message } from "antd";
import axios from "axios";
import { IoIosAdd } from "react-icons/io";
import "./CreatePostModal.css"; // Adjust the path as necessary

function CreatePostModal({ visible, onClose, onSubmit, loading }) {
  const [postText, setPostText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [fetchingBuilds, setFetchingBuilds] = useState(false);
  const [showBuildsList, setShowBuildsList] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCompletedBuilds();
    } else {
      resetForm();
    }
  }, [visible]);

  const fetchCompletedBuilds = async () => {
    try {
      setFetchingBuilds(true);
      const response = await axios.get(
        "http://localhost:4000/api/build/user/completed",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setSavedBuilds(
          response.data.builds.map((build) => ({
            ...build,
            totalPrice: calculateBuildPrice(build.components),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching builds:", error);
      message.error("Failed to load your builds");
    } finally {
      setFetchingBuilds(false);
    }
  };

  const calculateBuildPrice = (components) => {
    if (!components) return 0;
    return Object.values(components).reduce(
      (total, component) => total + (component?.price || 0),
      0
    );
  };

  const resetForm = () => {
    setPostText("");
    setImageFiles([]);
    setImagePreviews([]);
    setSelectedBuild(null);
    setShowBuildsList(false);
  };

  const toggleBuildsList = () => {
    setShowBuildsList(!showBuildsList);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imageFiles.length > 5) {
      message.error("You can upload a maximum of 5 images");
      return;
    }

    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];
    let validFilesCount = 0;

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        message.error(`${file.name} is too large (max 5MB)`);
        return;
      }

      if (!file.type.match(/^image\/(jpe?g|png|webp)$/i)) {
        message.error(`${file.name} is not a supported image format`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImageFiles.push(file);
        newImagePreviews.push(reader.result);
        validFilesCount++;

        if (validFilesCount === files.length) {
          setImageFiles(newImageFiles);
          setImagePreviews(newImagePreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];

    newImageFiles.splice(index, 1);
    newImagePreviews.splice(index, 1);

    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
  };

  // Only highlight build, don't clear images/text, don't close picker
  const handleSelectBuild = (build) => {
    setSelectedBuild(build);
  };

  const handleSubmit = () => {
    if (!postText.trim() && !selectedBuild && imageFiles.length === 0) {
      message.error("Post must have text, images, or a build");
      return;
    }

    onSubmit({
      postText,
      imageFiles,
      selectedBuild,
    });
  };

  if (!visible) return null;

  return (
    <div className="create-post-modal">
      <div className="Create_Post-content">
        <div className="Create_Post-header">
          <h3>Create New Post</h3>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="Create_Post-body">
          <textarea
            placeholder="What's on your mind? Share your thoughts..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="post-textarea"
            rows={2}
          />

          {/* Media section */}
          <div className="media-section">
            {imagePreviews.length > 0 ? (
              <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={preview} alt={`Preview ${index}`} />
                    <button
                      className="remove-image-button"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <label className="add-more-images">
                    <IoIosAdd />
                    <span>Add more</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      multiple
                    />
                  </label>
                )}
              </div>
            ) : (
              <label className="upload-image-prompt">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  multiple
                />
                <IoIosAdd size={30} />
                <p>Upload your build images (up to 5 images)</p>
              </label>
            )}
          </div>

          {/* Saved builds section - now toggled by button */}
          {showBuildsList && (
            <div className="saved-builds-section">
              {fetchingBuilds ? (
                <div className="loading-builds">
                  <Spin indicator={<LoadingOutlined />} />
                  <p>Loading your builds...</p>
                </div>
              ) : savedBuilds.length > 0 ? (
                <>
                  <h4>Select a Build to Post</h4>
                  <div
                    className={
                      "builds-list" +
                      (savedBuilds.length > 2 ? " scrollable" : "")
                    }
                  >
                    {savedBuilds.map((build) => (
                      <div
                        key={build._id}
                        className={`build-item ${
                          selectedBuild?._id === build._id ? "selected" : ""
                        }`}
                        onClick={() => handleSelectBuild(build)}
                      >
                        <div className="build-info">
                          <h5>{build.title || "Untitled Build"}</h5>
                          <div className="build-meta">
                            <span>
                              ${build.totalPrice?.toFixed(2) || "0.00"}
                            </span>
                            <span>
                              {new Date(build.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {build.components?.case?.image_source && (
                          <img
                            src={build.components.case.image_source}
                            alt="Build thumbnail"
                            className="build-thumbnail"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-builds-message">
                  <p>You don't have any completed builds yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="Create-post-footer">
          <button
            className="Create_Post_choose-build-button"
            onClick={toggleBuildsList}
            disabled={fetchingBuilds || savedBuilds.length === 0}
          >
            {showBuildsList
              ? "Post without a Build"
              : "Post a Build from your Library?"}
          </button>
          <button
            className="Create_Post_submit-button"
            onClick={handleSubmit}
            disabled={
              loading ||
              (!postText.trim() && !selectedBuild && imageFiles.length === 0)
            }
          >
            {loading ? <Spin indicator={<LoadingOutlined />} /> : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;
