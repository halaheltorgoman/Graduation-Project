import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import BuildDummy from "../../assets/images/build_dummy.svg";
import { FiRefreshCw } from "react-icons/fi";
import { FaShare } from "react-icons/fa";
import { Input, Spin, message } from "antd";
import { EditOutlined, CheckOutlined } from "@ant-design/icons";
import TabContent from "./ProfileTabContent";
import axios from "axios";
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

// CompletedBuildCard component merged inline
function CompletedBuildCard({ build, onDeleteBuild, onSaveChanges }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState(build.title || "Untitled Build");
  const [description, setDescription] = useState(build.description || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setTitle(build.title || "Untitled Build");
    setDescription(build.description || "");
  }, [build.title, build.description]);

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

  const handleSaveChanges = () => {
    if (onSaveChanges) {
      onSaveChanges(build._id || build.id, { title, description });
    }
  };

  const imageUrl = build.image_source?.url || build.image_source || BuildDummy;

  return (
    <div className={`profile_buildCard ${isExpanded ? "expanded" : ""}`}>
      <div className="profile_buildCard_main">
        <div className="profile_buildCard_info">
          <img
            src={imageUrl}
            alt={title}
            className="build-image"
            onError={(e) => {
              e.target.src = BuildDummy;
            }}
          />
          <div className="build-info">
            <span className="not-editing">{title}</span>
            {!isExpanded && (
              <div className="preview-metrics">
                <span>
                  {Object.keys(build.components || {}).length} components
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
            {isExpanded ? "Close" : "Edit"}
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
          {/* Left: Title, Image, Description */}
          <div className="profilefullbuild_main">
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
            <div className="profilefullbuild_image">
              <img src={build.image_source || BuildDummy} alt="Build" />
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
          </div>

          {/* Right: Components List */}
          <div className="profilefullbuild_secondary">
            {COMPONENT_ORDER.map(({ key, label }, idx) => {
              const comp = build.components?.[key];
              return (
                <React.Fragment key={key}>
                  <div className="profilefullbuild_component">
                    <p className="profilefullbuild_component_type">{label}</p>
                    <img
                      src={comp?.image_source || BuildDummy}
                      alt={comp?.title || comp?.product_name || label}
                    />
                    <p className="profilefullbuild_component_title">
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
                    <div className="profilefullbuild_divider"></div>
                  )}
                </React.Fragment>
              );
            })}
            <div className="profilefullbuild_buttons">
              <button
                className="profilefullbuild_delete_btn"
                onClick={() => onDeleteBuild(build._id || build.id)}
              >
                Delete Build
              </button>
              <button
                className="profilefullbuild_save_btn"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CompletedBuildCard;
