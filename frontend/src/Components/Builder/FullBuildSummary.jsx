import React, { useEffect, useState, useContext } from "react";
import { Button, Modal, Input, Select, message, Rate } from "antd";
import logo from "../../assets/images/logo.svg";
import axios from "axios";
import "./FullBuildSummary.css";
import { useLocation, useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
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
  const { user, logout } = useContext(UserContext);
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
          timeout: 10000, // 10 seconds timeout
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        message.success("Build converted to guide successfully!");
        setShowGuideModal(false);

        // Reset form
        setGuideTitle("");
        setGuideDescription("");
        setGuideGenre("");
        setGuideCategory("gaming");

        // Navigate to guides page
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
    // Pre-populate with build information if available
    const defaultTitle =
      fullBuild?.title || `Gaming Build ${new Date().toLocaleDateString()}`;
    const defaultDescription =
      fullBuild?.description ||
      "High-performance gaming build with premium components.";

    setGuideTitle(defaultTitle);
    setGuideDescription(defaultDescription);
    setGuideGenre("Gaming"); // Default genre
    setGuideCategory("gaming"); // Default category
    setShowGuideModal(true);
  };

  const handleModalAction = () => {
    switch (modalType) {
      case "update":
        return handleUpdateCurrentBuild();
      case "complete":
        return handleCompleteBuild();
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

  // Check if build has all required components for guide conversion
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

  if (loading) {
    return (
      <div className="fullbuild-loading">
        <span className="loader"></span>
      </div>
    );
  }

  if (!fullBuild) {
    return (
      <div className="fullbuild-empty">
        <div className="fullbuild-empty-message">
          Build summary not available. Please try creating your build again.
        </div>
        <div className="fullbuild-actions">
          <Button
            type="primary"
            onClick={() => navigate("/builder/cpu")}
            className="fullbuild-restart-btn"
          >
            Start New Build
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fullbuild-container ${configureMode ? "configure-mode" : ""}`}
    >
      <h2 className="fullbuild-title">
        {configureMode ? "Build Update Summary" : "Your Build Summary"}
      </h2>

      <div className="fullbuild-table">
        <div className="fullbuild-row fullbuild-header">
          <div className="fullbuild-col type">Type</div>
          <div className="fullbuild-col image">Image</div>
          <div className="fullbuild-col name">Name</div>
          <div className="fullbuild-col brand">Brand</div>
          <div className="fullbuild-col price">Price</div>
          <div className="fullbuild-col refresh">
            <span className="refresh-text">Replace</span>
          </div>
        </div>
        {Object.entries(fullBuild.components).map(([compType, comp]) => {
          if (!comp) return null;
          return (
            <div className="fullbuild-row" key={compType}>
              <div className="fullbuild-col type">{compType.toUpperCase()}</div>
              <div className="fullbuild-col image">
                {comp?.image_source && (
                  <img
                    src={comp.image_source}
                    alt={comp.title || comp.product_name}
                    className="fullbuild-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </div>
              <div className="fullbuild-col name">
                {comp?.title || comp?.product_name || "Unknown Component"}
              </div>
              <div className="fullbuild-col brand">
                {comp?.manufacturer || comp?.brand || "Unknown Brand"}
              </div>
              <div className="fullbuild-col price_val">
                {comp?.price !== undefined && comp?.price !== null
                  ? `$${comp.price.toLocaleString()}`
                  : "--"}
              </div>
              <div className="fullbuild-col refresh">
                <button
                  className="fullbuild-refresh-btn"
                  onClick={() => handleRefreshClick(compType)}
                  aria-label={`Replace ${compType}`}
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fullbuild-total">
        <span>Total Price:</span>
        <span className="fullbuild-total-value">
          {priceLoading
            ? "Calculating..."
            : totalPrice !== null
            ? `$${totalPrice.toLocaleString()}`
            : "--"}
        </span>
      </div>

      <div className="fullbuild-actions">
        {configureMode ? (
          <>
            <Button
              type="primary"
              className="fullbuild-update-btn"
              onClick={() => openModal("update")}
            >
              Update Current Build
            </Button>
          </>
        ) : (
          <Button
            type="primary"
            className="fullbuild-complete-btn"
            onClick={() => openModal("complete")}
          >
            Complete Build
          </Button>
        )}

        {user.role === "admin" && (
          <Button
            type="primary"
            onClick={openGuideModal}
            className="fullbuild-convert-btn"
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

        <Button variant="link" className="fullbuild-share-btn">
          <img src={logo} alt="share" className="fullbuild-share-icon" />
          Share
        </Button>
      </div>

      {/* Regular Build Modal */}
      <Modal
        title={getModalTitle()}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowModal(false)}>
            Cancel
          </Button>,
          <Button
            key="action"
            type="primary"
            loading={saving}
            onClick={handleModalAction}
          >
            {getModalButtonText()}
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
          {getModalDescription()}
        </div>

        {configureMode && originalBuild && modalType === "update" && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#f5f5f5",
              borderRadius: 4,
            }}
          >
            <strong>Current Build:</strong>{" "}
            {originalBuild.title || "Untitled Build"}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", marginBottom: 4, fontWeight: "500" }}
          >
            Build Title
          </label>
          <Input
            placeholder="Enter build title"
            value={buildTitle}
            onChange={(e) => setBuildTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: 4, fontWeight: "500" }}
          >
            Description (Optional)
          </label>
          <Input.TextArea
            placeholder="Build Description (optional)"
            value={buildDescription}
            onChange={(e) => setBuildDescription(e.target.value)}
            rows={4}
            maxLength={500}
          />
        </div>
      </Modal>

      {/* Convert to Guide Modal */}
      <Modal
        title="Convert Build to Guide"
        open={showGuideModal}
        onCancel={() => setShowGuideModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowGuideModal(false)}>
            Cancel
          </Button>,
          <Button
            key="convert"
            type="primary"
            onClick={handleConvertToGuide}
            loading={convertingToGuide}
          >
            Convert to Guide
          </Button>,
        ]}
        width={600}
      >
        <div className="guide-form">
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#e6f4ff",
              borderRadius: 4,
            }}
          >
            <strong>Note:</strong> This will convert your build into a guide
            that other users can view and save. The guide will appear in the "
            {guideCategory}" category.
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: "500" }}
            >
              Guide Title *
            </label>
            <Input
              placeholder="Enter guide title (e.g., 'Ultimate Gaming Build 2024')"
              value={guideTitle}
              onChange={(e) => setGuideTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: "500" }}
            >
              Description *
            </label>
            <TextArea
              placeholder="Describe what makes this build special, its performance characteristics, and who it's for..."
              value={guideDescription}
              onChange={(e) => setGuideDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: "500" }}
            >
              Category *
            </label>
            <Select
              value={guideCategory}
              onChange={(value) => setGuideCategory(value)}
              style={{ width: "100%" }}
            >
              <Select.Option value="Gaming">Gaming</Select.Option>
              <Select.Option value="Workstation">Workstation</Select.Option>
              <Select.Option value="Budget">Budget</Select.Option>
              <Select.Option value="Development">Development</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
            </Select>
          </div>

          {!canConvertToGuide() && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#fff2e8",
                borderRadius: 4,
                color: "#d4681f",
              }}
            >
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
