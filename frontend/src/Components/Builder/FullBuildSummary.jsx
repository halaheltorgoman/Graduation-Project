import React, { useEffect, useState, useContext } from "react";
import { Button, Modal, Input, Select, message } from "antd";
import logo from "../../assets/images/logo.svg";
import axios from "axios";
import "./FullBuildSummary.css";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { FiRefreshCw } from "react-icons/fi";

const { TextArea } = Input;

const FullBuildSummary = ({
  fullBuild,
  loading,
  configureMode,
  originalBuildId,
  originalBuild,
  role,
}) => {
  const [totalPrice, setTotalPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [buildTitle, setBuildTitle] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState("");
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideTitle, setGuideTitle] = useState("");
  const [guideDescription, setGuideDescription] = useState("");
  const [guideGenre, setGuideGenre] = useState("");
  const [guideCategory, setGuideCategory] = useState("Gaming");
  const [convertingToGuide, setConvertingToGuide] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const buildId = fullBuild?._id;

  useEffect(() => {
    const fetchTotalPrice = async () => {
      if (!buildId) return;
      setPriceLoading(true);
      try {
        const { data } = await axios.get(
          `http://localhost:4000/api/build/${buildId}/price`,
          { withCredentials: true }
        );
        setTotalPrice(data.totalPrice);
      } catch (err) {
        console.error("Price fetch error:", err);
        setTotalPrice(null);
      } finally {
        setPriceLoading(false);
      }
    };
    fetchTotalPrice();
  }, [buildId]);

  const handleConvertToGuide = async () => {
    console.log("=== Client: Convert to Guide Started ===");
    console.log("Build ID:", buildId);
    console.log("Guide data:", {
      title: guideTitle.trim(),
      description: guideDescription.trim(),
      genre: guideGenre.trim(),
      category: guideCategory,
    });

    if (!guideTitle.trim()) {
      message.error("Please enter a title for the guide");
      return;
    }

    if (!guideDescription.trim()) {
      message.error("Please enter a description for the guide");
      return;
    }

    if (!guideGenre.trim()) {
      message.error("Please enter a genre for the guide");
      return;
    }

    if (!buildId) {
      message.error("No build ID found");
      console.error("Build ID is missing:", buildId);
      return;
    }

    setConvertingToGuide(true);
    try {
      console.log(
        "Making API request to:",
        `http://localhost:4000/api/guides/${buildId}/convert-to-guide`
      );

      const response = await axios.post(
        `http://localhost:4000/api/guides/${buildId}/convert-to-guide`,
        {
          title: guideTitle.trim(),
          description: guideDescription.trim(),
          genre: guideGenre.trim(),
          category: guideCategory,
        },
        {
          withCredentials: true,
          timeout: 10000,
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        message.success("Build converted to guide successfully!");
        setShowGuideModal(false);

        setGuideTitle("");
        setGuideDescription("");
        setGuideGenre("");
        setGuideCategory("gaming");

        navigate(`/guides/${guideCategory}`);
      } else {
        throw new Error(response.data.message || "Failed to convert to guide");
      }
    } catch (err) {
      console.error("=== Client: Convert to guide error ===");
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error config:", err.config);

      let errorMessage = "Failed to convert to guide";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      message.error(errorMessage);
    } finally {
      setConvertingToGuide(false);
    }
  };

  const handleUpdateCurrentBuild = async () => {
    if (!originalBuildId) {
      message.error("No original build ID found");
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `http://localhost:4000/api/build/createbuild/${originalBuildId}/finalize`,
        {
          title: buildTitle,
          description: buildDescription,
          shareToCommunity: false,
        },
        { withCredentials: true }
      );

      message.success("Build updated successfully!");
      setShowModal(false);
      navigate("/profile?tab=1", {
        state: {
          message: "Your build has been updated!",
          updatedBuildId: originalBuildId,
        },
      });
    } catch (err) {
      console.error("Update build error:", err);
      message.error(
        err.response?.data?.message ||
          "Failed to update build. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteBuild = async () => {
    setSaving(true);
    try {
      await axios.put(
        `http://localhost:4000/api/build/createbuild/${buildId}/finalize`,
        {
          title: buildTitle || `My Build ${new Date().toLocaleDateString()}`,
          description: buildDescription,
          shareToCommunity: false,
        },
        { withCredentials: true }
      );
      message.success("Build saved to Completed Builds!");
      setShowModal(false);
      setBuildTitle("");
      setBuildDescription("");
      navigate("/profile?tab=1");
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to complete build.");
    } finally {
      setSaving(false);
    }
  };

  const handleShareBuild = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `http://localhost:4000/api/build/createbuild/${buildId}/finalize`,
        {
          title: buildTitle || `My Build ${new Date().toLocaleDateString()}`,
          description: buildDescription,
          shareToCommunity: false,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        message.success("Build saved successfully!");
        setShowModal(false);
        setBuildTitle("");
        setBuildDescription("");

        navigate("/community", {
          state: {
            openCreateModal: true,
            selectedBuild: {
              _id: response.data.build._id,
              title: response.data.build.title,
              description: response.data.build.description,
              components: response.data.build.components,
              totalPrice: calculateTotalPrice(response.data.build.components),
              updatedAt: response.data.build.updatedAt,
            },
          },
        });
      }
    } catch (err) {
      console.error("Share build error:", err);
      message.error(
        err.response?.data?.message || "Failed to save build for sharing."
      );
    } finally {
      setSaving(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    let initialTitle = "";
    let initialDescription = "";

    if (type === "save") {
      const originalTitle =
        fullBuild?.title || originalBuild?.title || "My Build";
      initialTitle = `Copy of ${originalTitle}`;
      initialDescription =
        fullBuild?.description || originalBuild?.description || "";
    } else if (type === "update") {
      initialTitle = originalBuild?.title || fullBuild?.title || "";
      initialDescription =
        originalBuild?.description || fullBuild?.description || "";
    } else if (type === "share") {
      initialTitle =
        fullBuild?.title || `My Build ${new Date().toLocaleDateString()}`;
      initialDescription = fullBuild?.description || "";
    } else {
      initialTitle =
        fullBuild?.title || `My Build ${new Date().toLocaleDateString()}`;
      initialDescription = fullBuild?.description || "";
    }

    setBuildTitle(initialTitle);
    setBuildDescription(initialDescription);
    setShowModal(true);
  };

  const openGuideModal = () => {
    const defaultTitle =
      fullBuild?.title || `Gaming Build ${new Date().toLocaleDateString()}`;
    const defaultDescription =
      fullBuild?.description ||
      "High-performance gaming build with premium components.";

    setGuideTitle(defaultTitle);
    setGuideDescription(defaultDescription);
    setGuideGenre("Gaming");
    setGuideCategory("gaming");
    setShowGuideModal(true);
  };

  const handleModalAction = () => {
    switch (modalType) {
      case "update":
        return handleUpdateCurrentBuild();
      case "complete":
        return handleCompleteBuild();
      case "share":
        return handleShareBuild();
      default:
        return;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "save":
        return "Save as New Build";
      case "update":
        return "Update Current Build";
      case "complete":
        return "Complete Build";
      case "share":
        return "Share Build to Community";
      default:
        return "Build Action";
    }
  };

  const getModalButtonText = () => {
    switch (modalType) {
      case "update":
        return "Update Current Build";
      case "complete":
        return "Save Build";
      case "share":
        return "Save & Share";
      default:
        return "Save";
    }
  };

  const getModalDescription = () => {
    switch (modalType) {
      case "update":
        return "This will update your existing build with the new component selection.";
      case "complete":
        return "Save your build to your completed builds collection.";
      case "share":
        return "Save your build to completed builds and proceed to share it with the community.";
      default:
        return "";
    }
  };

  const calculateTotalPrice = (components) => {
    if (!components) return 0;
    return Object.values(components).reduce((total, component) => {
      return total + (component?.price || 0);
    }, 0);
  };

  const canConvertToGuide = () => {
    if (!fullBuild?.components) return false;

    const requiredComponents = [
      "cpu",
      "gpu",
      "motherboard",
      "memory",
      "storage",
      "psu",
      "case",
    ];
    return requiredComponents.every((comp) => fullBuild.components[comp]);
  };

  const handleRefreshComponent = (componentType) => {
    navigate(`/builder/${componentType}`, {
      state: {
        configureMode: true,
        selectedComponents: fullBuild.components,
        buildId: buildId,
        originalBuild: fullBuild,
      },
    });
  };

  if (loading) {
    return (
      <div className="fullbuild-summary-loading-container">
        <span className="fullbuild-summary-loader"></span>
      </div>
    );
  }

  if (!fullBuild) {
    return (
      <div className="fullbuild-summary-empty-container">
        <div className="fullbuild-summary-empty-message">
          Build summary not available. Please try creating your build again.
        </div>
        <div className="fullbuild-summary-actions">
          <Button
            type="primary"
            onClick={() => navigate("/builder/cpu")}
            className="fullbuild-summary-restart-btn"
          >
            Start New Build
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fullbuild-summary-container ${
        configureMode ? "fullbuild-summary-configure-mode" : ""
      }`}
    >
      <h2 className="fullbuild-summary-title">
        {configureMode ? "Build Update Summary" : "Your Build Summary"}
      </h2>

      <div className="fullbuild-summary-table">
        <div className="fullbuild-summary-row fullbuild-summary-header">
          <div className="fullbuild-summary-col fullbuild-summary-col-type">
            Type
          </div>
          <div className="fullbuild-summary-col fullbuild-summary-col-image">
            Image
          </div>
          <div className="fullbuild-summary-col fullbuild-summary-col-name">
            Name
          </div>
          <div className="fullbuild-summary-col fullbuild-summary-col-brand">
            Brand
          </div>
          <div className="fullbuild-summary-col fullbuild-summary-col-price">
            Price
          </div>
          <div className="fullbuild-summary-col fullbuild-summary-col-refresh">
            <span className="fullbuild-summary-refresh-text">Replace</span>
          </div>
        </div>
        {Object.entries(fullBuild.components).map(([compType, comp]) => {
          if (!comp) return null;
          return (
            <div className="fullbuild-summary-row" key={compType}>
              <div className="fullbuild-summary-col fullbuild-summary-col-type">
                {compType.toUpperCase()}
              </div>
              <div className="fullbuild-summary-col fullbuild-summary-col-image">
                {comp?.image_source && (
                  <img
                    src={comp.image_source}
                    alt={comp.title || comp.product_name}
                    className="fullbuild-summary-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </div>
              <div className="fullbuild-summary-col fullbuild-summary-col-name">
                {comp?.title || comp?.product_name || "Unknown Component"}
              </div>
              <div className="fullbuild-summary-col fullbuild-summary-col-brand">
                {comp?.manufacturer || comp?.brand || "Unknown Brand"}
              </div>
              <div className="fullbuild-summary-col fullbuild-summary-col-price_val">
                {comp?.price !== undefined && comp?.price !== null
                  ? `EGP ${comp.price.toLocaleString()}`
                  : "--"}
              </div>
              <div className="fullbuild-summary-col fullbuild-summary-col-refresh">
                <button
                  className="fullbuild-summary-refresh-btn"
                  onClick={() => handleRefreshComponent(compType)}
                  aria-label={`Replace ${compType}`}
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fullbuild-summary-total">
        <span className="fullbuild-summary-total-label">Total Price:</span>
        <span className="fullbuild-summary-total-value">
          {priceLoading
            ? "Calculating..."
            : totalPrice !== null
            ? `$${totalPrice.toLocaleString()}`
            : "--"}
        </span>
      </div>

      <div className="fullbuild-summary-actions">
        {configureMode ? (
          <>
            <Button
              type="primary"
              className="fullbuild-summary-update-btn"
              onClick={() => openModal("update")}
            >
              Update Current Build
            </Button>
          </>
        ) : (
          <Button
            type="primary"
            className="fullbuild-summary-complete-btn"
            onClick={() => openModal("complete")}
          >
            Complete Build
          </Button>
        )}

        {user.role === "admin" && (
          <Button
            type="primary"
            onClick={openGuideModal}
            className="fullbuild-summary-convert-btn"
            disabled={!canConvertToGuide()}
            title={
              !canConvertToGuide()
                ? "Build must have all required components (CPU, GPU, Motherboard, Memory, Storage, PSU, Case)"
                : "Convert this build to a guide"
            }
          >
            Convert to Guide
          </Button>
        )}

        <Button
          variant="link"
          className="fullbuild-summary-share-btn"
          onClick={() => openModal("share")}
        >
          <img
            src={logo}
            alt="share"
            className="fullbuild-summary-share-icon"
          />
          Save & Share
        </Button>
      </div>

      {/* Regular Build Modal */}
      <Modal
        title={getModalTitle()}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setShowModal(false)}
            className="fullbuild-summary-modal-cancel-btn"
          >
            Cancel
          </Button>,
          <Button
            key="action"
            type="primary"
            loading={saving}
            onClick={handleModalAction}
            className="fullbuild-summary-modal-action-btn"
          >
            {getModalButtonText()}
          </Button>,
        ]}
        className="fullbuild-summary-modal"
      >
        <div className="fullbuild-summary-modal-description">
          {getModalDescription()}
        </div>

        {configureMode && originalBuild && modalType === "update" && (
          <div className="fullbuild-summary-current-build-info">
            <strong>Current Build:</strong>{" "}
            {originalBuild.title || "Untitled Build"}
          </div>
        )}

        <div className="fullbuild-summary-modal-input-group">
          <label className="fullbuild-summary-modal-label">Build Title</label>
          <Input
            placeholder="Enter build title"
            value={buildTitle}
            onChange={(e) => setBuildTitle(e.target.value)}
            maxLength={100}
            className="fullbuild-summary-title-input"
          />
        </div>

        <div className="fullbuild-summary-modal-input-group">
          <label className="fullbuild-summary-modal-label">
            Description (Optional)
          </label>
          <Input.TextArea
            placeholder="Build Description (optional)"
            value={buildDescription}
            onChange={(e) => setBuildDescription(e.target.value)}
            rows={4}
            maxLength={500}
            className="fullbuild-summary-description-textarea"
          />
        </div>
      </Modal>

      {/* Convert to Guide Modal */}
      <Modal
        title="Convert Build to Guide"
        open={showGuideModal}
        onCancel={() => setShowGuideModal(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setShowGuideModal(false)}
            className="fullbuild-summary-guide-modal-cancel-btn"
          >
            Cancel
          </Button>,
          <Button
            key="convert"
            type="primary"
            onClick={handleConvertToGuide}
            loading={convertingToGuide}
            className="fullbuild-summary-guide-modal-convert-btn"
          >
            Convert to Guide
          </Button>,
        ]}
        width={600}
        className="fullbuild-summary-guide-modal"
      >
        <div className="fullbuild-summary-guide-form">
          <div className="fullbuild-summary-guide-note">
            <strong>Note:</strong> This will convert your build into a guide
            that other users can view and save. The guide will appear in the "
            {guideCategory}" category.
          </div>

          <div className="fullbuild-summary-guide-input-group">
            <label className="fullbuild-summary-guide-label">
              Guide Title *
            </label>
            <Input
              placeholder="Enter guide title (e.g., 'Ultimate Gaming Build 2024')"
              value={guideTitle}
              onChange={(e) => setGuideTitle(e.target.value)}
              maxLength={100}
              className="fullbuild-summary-guide-title-input"
            />
          </div>

          <div className="fullbuild-summary-guide-input-group">
            <label className="fullbuild-summary-guide-label">
              Description *
            </label>
            <TextArea
              placeholder="Describe what makes this build special, its performance characteristics, and who it's for..."
              value={guideDescription}
              onChange={(e) => setGuideDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="fullbuild-summary-guide-description-textarea"
            />
          </div>

          <div className="fullbuild-summary-guide-input-group">
            <label className="fullbuild-summary-guide-label">Category *</label>
            <Select
              value={guideCategory}
              onChange={(value) => setGuideCategory(value)}
              style={{ width: "100%" }}
              className="fullbuild-summary-guide-category-select"
            >
              <Select.Option
                value="Gaming"
                className="fullbuild-summary-guide-option"
              >
                Gaming
              </Select.Option>
              <Select.Option
                value="Workstation"
                className="fullbuild-summary-guide-option"
              >
                Workstation
              </Select.Option>
              <Select.Option
                value="Budget"
                className="fullbuild-summary-guide-option"
              >
                Budget
              </Select.Option>
              <Select.Option
                value="Development"
                className="fullbuild-summary-guide-option"
              >
                Development
              </Select.Option>
              <Select.Option
                value="custom"
                className="fullbuild-summary-guide-option"
              >
                Custom
              </Select.Option>
            </Select>
          </div>

          {!canConvertToGuide() && (
            <div className="fullbuild-summary-guide-warning">
              <strong>Warning:</strong> This build is missing some required
              components. Please ensure you have CPU, GPU, Motherboard, Memory,
              Storage, PSU, and Case selected.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FullBuildSummary;
