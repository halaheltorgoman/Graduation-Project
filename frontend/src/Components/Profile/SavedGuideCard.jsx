import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShare, FaStar } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { Input, Rate, message } from "antd";
import { EditOutlined, CheckOutlined } from "@ant-design/icons";
import BuildDummy from "../../assets/images/build_dummy.svg";
import "./ProfileBuildCard.css";
import "./SavedGuideCard.css";
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

const SavedGuideCard = ({ guide, onUnsaveGuide }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [description, setDescription] = useState(guide.description || "");
  const [userRating, setUserRating] = useState(guide.userRating || null);

  const navigate = useNavigate();

  const handleToggleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/guides/${guide._id}/save`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        onUnsaveGuide(guide._id);
      }
    } catch (err) {
      console.error("Failed to unsave guide:", err);
    }
  };

  const handleRefreshComponent = (componentType) => {
    // Show confirmation message that this will create a new build
    message.info(
      `🔒 Customizing ${componentType.toUpperCase()} from guide "${
        guide.title
      }". This will create a new build in your completed builds. The original guide will remain unchanged.`,
      5
    );

    console.log("🔒 GUIDE PROTECTION: Starting component customization");
    console.log("🔒 Original guide ID:", guide._id);
    console.log("🔒 Component to customize:", componentType);
    console.log("🔒 Original guide will remain UNCHANGED");

    // Navigate to builder with guide protection flags
    navigate(`/builder/${componentType}`, {
      state: {
        // Core configuration
        configureMode: true,
        selectedComponents: guide.build?.components || {},

        // Guide protection flags
        fromGuide: true, // CRITICAL: This ensures guide protection logic
        guideId: guide._id,
        guideTitle: guide.title,

        // Additional protection metadata
        originalGuideData: {
          id: guide._id,
          title: guide.title,
          description: guide.description,
          category: guide.category,
          originalBuildId: guide.build?._id,
        },

        // Explicit protection flags
        protectOriginalGuide: true,
        createNewBuildFromGuide: true,
        doNotModifyGuide: true,

        // Debug info
        debugInfo: {
          action: "customize_guide_component",
          timestamp: new Date().toISOString(),
          componentType,
          guideId: guide._id,
          confirmation: "GUIDE_WILL_NOT_BE_MODIFIED",
        },
      },
    });
  };

  const imageUrl =
    guide.build?.image_source?.url || guide.build?.image_source || BuildDummy;

  return (
    <div className={`profile_buildCard ${isExpanded ? "expanded" : ""}`}>
      <div className="profile_buildCard_main">
        <div className="profile_buildCard_info">
          <img
            src={imageUrl}
            alt={guide.title}
            className="build-image"
            onError={(e) => {
              e.target.src = BuildDummy;
            }}
          />
          <div className="build-info">
            <span className="not-editing">{guide.title}</span>
            {!isExpanded && (
              <div className="preview-metrics">
                <span>EGP {guide.totalPrice?.toLocaleString() || "0"}</span>
                <span>
                  <FaStar /> {guide.averageRating?.toFixed(1) || "0"}
                </span>
              </div>
            )}
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
        <div className="profilefullbuild_container">
          {/* Left: Title, Image, Description, Guide Meta */}
          <div className="profilefullbuild_main">
            {/* Title Section */}
            <div className="profilefullbuild_title_container">
              <TextArea
                value={guide.title}
                placeholder="Guide title..."
                autoSize={{ minRows: 1, maxRows: 2 }}
                disabled={true}
                className="profilefullbuild_title_field not-editing"
              />
            </div>

            {/* Build Image */}
            <div className="profilefullbuild_image">
              <img src={imageUrl} alt="Build" />
            </div>

            {/* Description Section */}
            <div className="profilefullbuild_desc_container">
              <TextArea
                value={description}
                disabled={true}
                autoSize={{ minRows: 3, maxRows: 5 }}
                className="profilefullbuild_desc_field not-editing"
              />
            </div>

            {/* Guide Meta Information */}
            <div className="guide_meta_info">
              <div className="guide_meta_item">
                <span className="guide_meta_label">Category:</span>
                <span className="guide_meta_value">{guide.category}</span>
              </div>

              <div className="guide_meta_item">
                <span className="guide_meta_label">Total Price:</span>
                <span className="guide_meta_value">
                  EGP {guide.totalPrice?.toLocaleString() || "0"}
                </span>
              </div>

              {/* Guide Protection Notice */}
              <div className="guide_protection_notice">
                <p className="guide_protection_text">
                  🔒 This is a saved guide. Customizing components will create a
                  new build in your completed builds. The original guide will
                  remain unchanged.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Components List */}
          <div className="profilefullbuild_secondary">
            {COMPONENT_ORDER.map(({ key, label }, idx) => {
              const comp = guide.build?.components?.[key];
              return (
                <React.Fragment key={key}>
                  <div className="profilefullbuild_component">
                    <p className="profilefullbuild_component_type">{label}</p>
                    <img
                      src={comp?.image_source || BuildDummy}
                      alt={comp?.title || comp?.product_name || label}
                      onError={(e) => {
                        e.target.src = BuildDummy;
                      }}
                    />
                    <p className="profilefullbuild_component_title">
                      {comp?.title || comp?.product_name || "N/A"}
                    </p>
                    <button
                      className="profilefullbuild_refresh_button guide_customization_button"
                      onClick={() => handleRefreshComponent(key)}
                      aria-label={`Customize ${label} (creates new build)`}
                      title={`Customize ${label} - This will create a new build, leaving the original guide unchanged`}
                    >
                      <FiRefreshCw />
                    </button>
                  </div>
                  {idx < COMPONENT_ORDER.length - 1 && (
                    <div className="profilefullbuild_divider"></div>
                  )}
                </React.Fragment>
              );
            })}

            <div className="profilefullbuild_buttons">
              <button
                className="profilefullbuild_delete_btn"
                onClick={handleToggleSave}
              >
                Unsave Guide
              </button>
              <button
                className="profilefullbuild_save_btn"
                onClick={() => navigate(`/guides/${guide._id}`)}
              >
                View Full Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedGuideCard;
