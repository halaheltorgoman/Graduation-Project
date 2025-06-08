import React, { useState } from "react";
import { Input } from "antd";
import { EditOutlined, CheckOutlined } from "@ant-design/icons";
import BuildDummy from "../../assets/images/build_dummy.svg";
import { FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./ProfileBuildDetails.css";

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

function ProfileBuildDetails({ title, setTitle, onDeleteBuild, build }) {
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const navigate = useNavigate();

  const handleRefreshClick = (componentType) => {
    navigate(`/browsecomponents/${componentType}?buildId=${build.id}&fromBuild=true`);
  };

  return (
    <div className="profilefullbuild_container">
      {/* Main Content Section */}
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

      {/* Components List Section */}
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
                  onClick={() => handleRefreshClick(key)}
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

        {/* Action Buttons */}
        <div className="profilefullbuild_buttons">
          <button
            className="profilefullbuild_delete_btn"
            onClick={onDeleteBuild}
          >
            Delete Build
          </button>
          <button className="profilefullbuild_save_btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default ProfileBuildDetails;