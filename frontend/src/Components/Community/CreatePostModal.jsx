import React, { useState, useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { FaTimes } from "react-icons/fa";
import { Spin, message } from "antd";
import axios from "axios";
import { IoIosAdd } from "react-icons/io";
import "./CreatePostModal.css"; // Adjust the path as necessary

// Updated CreatePostModal function signature and useEffect

function CreatePostModal({
  visible,
  onClose,
  onSubmit,
  loading,
  preSelectedBuild,
}) {
  const [postText, setPostText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [fetchingBuilds, setFetchingBuilds] = useState(false);
  const [showBuildsList, setShowBuildsList] = useState(false);
  const [fileErrors, setFileErrors] = useState([]); // New state for file errors

  useEffect(() => {
    if (visible) {
      fetchCompletedBuilds();

      // If there's a pre-selected build from share flow
      if (preSelectedBuild) {
        setSelectedBuild(preSelectedBuild);
        setShowBuildsList(true); // Show builds list so user can see selection

        // Optional: Add a subtle indicator that this build was pre-selected
        message.info("Build ready to share! Add your thoughts and post.");
      }
    } else {
      resetForm();
    }
  }, [visible, preSelectedBuild]);

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
    setFileErrors([]); // Clear file errors on reset
  };

  const toggleBuildsList = () => {
    setShowBuildsList(!showBuildsList);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = [];

    // Clear previous errors
    setFileErrors([]);

    if (files.length + imageFiles.length > 5) {
      newErrors.push("You can upload a maximum of 5 images");
      setFileErrors(newErrors);
      message.error("You can upload a maximum of 5 images");
      return;
    }

    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];
    let validFilesCount = 0;
    let processedFiles = 0;

    files.forEach((file) => {
      // Check file type first
      if (!file.type.match(/^image\/(jpe?g|png|webp)$/i)) {
        newErrors.push(
          `"${file.name}" is not a supported image format. Only JPEG, PNG, and WebP files are allowed.`
        );
        processedFiles++;

        if (processedFiles === files.length) {
          setFileErrors(newErrors);
        }
        return;
      }

      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        newErrors.push(
          `"${file.name}" is too large. Maximum file size is 5MB.`
        );
        processedFiles++;

        if (processedFiles === files.length) {
          setFileErrors(newErrors);
        }
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImageFiles.push(file);
        newImagePreviews.push(reader.result);
        validFilesCount++;
        processedFiles++;

        if (processedFiles === files.length) {
          setImageFiles(newImageFiles);
          setImagePreviews(newImagePreviews);
          if (newErrors.length > 0) {
            setFileErrors(newErrors);
          }
        }
      };

      reader.onerror = () => {
        newErrors.push(`Failed to read "${file.name}"`);
        processedFiles++;

        if (processedFiles === files.length) {
          setFileErrors(newErrors);
        }
      };

      reader.readAsDataURL(file);
    });

    // Reset the input value to allow re-selecting the same files
    e.target.value = "";
  };

  const removeImage = (index) => {
    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];

    newImageFiles.splice(index, 1);
    newImagePreviews.splice(index, 1);

    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);

    // Clear errors if no files remain
    if (newImageFiles.length === 0) {
      setFileErrors([]);
    }
  };

  const handleSelectBuild = (build) => {
    setSelectedBuild(build);
  };

  const handleSubmit = async () => {
    if (!postText.trim() && !selectedBuild && imageFiles.length === 0) {
      message.error("Post must have text, images, or a build");
      return;
    }

    // Clear any previous file errors before submission
    setFileErrors([]);

    try {
      await onSubmit({
        postText,
        imageFiles,
        selectedBuild,
      });
    } catch (error) {
      // Handle server-side file validation errors
      if (error.response?.data?.message) {
        if (
          error.response.data.message.includes("image") ||
          error.response.data.message.includes("file")
        ) {
          setFileErrors([error.response.data.message]);
        } else {
          message.error(error.response.data.message);
        }
      } else {
        message.error("Failed to create post");
      }
    }
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
          {/* Show a special indicator if build is pre-selected */}
          {preSelectedBuild && selectedBuild && (
            <div className="pre-selected-build-indicator">
              <div className="indicator-content">
                <span className="indicator-icon">✓</span>
                <span>Build "{selectedBuild.title}" is ready to share</span>
              </div>
            </div>
          )}

          {/* File Error Messages */}
          {fileErrors.length > 0 && (
            <div className="file-errors">
              {fileErrors.map((error, index) => (
                <div key={index} className="file-error-message">
                  <span className="error-icon">⚠</span>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

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
                  <p>There's no completed builds in your library</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="Create-post-footer">
          <button
            className="Create_Post_choose-build-button"
            onClick={toggleBuildsList}
            disabled={fetchingBuilds}
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
