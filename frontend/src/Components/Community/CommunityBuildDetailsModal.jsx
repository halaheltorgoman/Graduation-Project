import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./CommunityBuildDetailsModal.css";

const specTemplates = {
  cpu: [
    { label: "Cores", key: "cores" },
    { label: "Threads", key: "threads" },
    { label: "Turbo Clock", key: "turbo_clock" },
    { label: "Base Clock", key: "base_clock" },
    { label: "Processor Speed", key: "processor_speed" },
    { label: "Socket", key: "socket" },
    { label: "Cache", key: "cache" },
  ],
  gpu: [
    { label: "Manufacturer", key: "manfacturer" },
    { label: "Brand", key: "brand" },
    { label: "Series", key: "series" },
    { label: "Graphics Co Processor", key: "Graphics_Co_Processor" },
    { label: "Expansion Slots", key: "expansion_slots" },
    { label: "Video Output Interface", key: "video_output_interface" },
    { label: "Clock Speed", key: "clock_speed" },
    { label: "Resolution", key: "resolution" },
  ],
  motherboard: [
    { label: "Brand", key: "brand" },
    { label: "Series", key: "series" },
    { label: "Form Factor", key: "form" },
    { label: "GPU Interface", key: "GPU_interface" },
    { label: "Supported Memory", key: "supported_memory" },
    { label: "Motherboard Socket", key: "MB_socket" },
    { label: "Storage Interface", key: "storage_interface" },
    { label: "Compatible Processors", key: "compatible_processors" },
  ],
  case: [
    { label: "Brand", key: "brand" },
    { label: "Series", key: "series" },
    { label: "Case Type", key: "case_type" },
    { label: "Color", key: "color" },
    { label: "Lightning Type", key: "lighting_type" },
    { label: "Expansion Slots", key: "expansion_slots" },
    { label: "Material", key: "material" },
    { label: "Recommended Usecases", key: "recommended_usecases" },
    { label: "Fan Placement", key: "fan_placement" },
    { label: "Weight (Kgs)", key: "case_weight_in_kg" },
  ],
  cooler: [
    { label: "Brand", key: "brand" },
    { label: "Cooling Method", key: "cooling_method" },
    { label: "Air Flow Capacity", key: "air_flow_capacity" },
    { label: "Radiator Size", key: "radiator_size" },
    { label: "Fan Size", key: "fan_size" },
    { label: "Supported Lightning Type", key: "compatible_lighting_type" },
  ],
  memory: [
    { label: "Brand", key: "brand" },
    { label: "Color", key: "color" },
    { label: "Memory Size", key: "memory_size" },
    { label: "DDR Generation", key: "DDR_generation" },
    { label: "Data Transfer Rate", key: "data_transfer_rate" },
    { label: "Memory Speed", key: "memory_speed" },
  ],
  storage: [
    { label: "Brand", key: "brand" },
    { label: "Storage Type", key: "storage_type" },
    { label: "Color", key: "color" },
    { label: "Form Factor", key: "form_factor" },
    { label: "Interface", key: "interface" },
    { label: "Size", key: "size" },
    { label: "Read Speed", key: "read_speed" },
    { label: "Write Speed", key: "write_speed" },
  ],
};

const CommunityBuildDetailsModal = ({ build, onClose }) => {
  const [selectedComponent, setSelectedComponent] = useState(null);

  if (!build || !build.components) return null;

  // List of fields to exclude from specs display
  const EXCLUDED_FIELDS = [
    "_id",
    "title",
    "category",
    "product_name",
    "rating",
    "full_rating",
    "price",
    "image_source",
    "product_link",
    "name",
    "type",
    "__v",
  ];

  // Convert components object to array
  const componentsArray = Object.entries(build.components).map(
    ([type, component]) => ({
      type,
      ...component,
    })
  );

  // Set the first component as selected by default when modal opens
  useEffect(() => {
    if (componentsArray.length > 0 && !selectedComponent) {
      setSelectedComponent(componentsArray[0]);
    }
  }, [build]); // Trigger when build changes

  const getAllSpecs = (component) => {
    return Object.entries(component).reduce((acc, [key, value]) => {
      if (
        !EXCLUDED_FIELDS.includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !Array.isArray(value)
      ) {
        acc[key] = value;
      }
      return acc;
    }, {});
  };

  const renderComponentSpecs = (component) => {
    const componentType =
      component.type?.toLowerCase() || component.category?.toLowerCase();
    const template = specTemplates[componentType];
    const allSpecs = getAllSpecs(component);
    const hasSpecs = Object.keys(allSpecs).length > 0;

    if (!hasSpecs) {
      return <p className="component-no-specs">No specifications available</p>;
    }

    return (
      <ul className="component-specs-list">
        {template
          ? template
              .filter((spec) => allSpecs[spec.key])
              .map((spec) => (
                <li key={spec.key} className="component-spec-item">
                  <span className="component-spec-label">{spec.label}:</span>
                  <span className="component-spec-value">
                    {allSpecs[spec.key]?.toString().trim()}
                  </span>
                </li>
              ))
          : Object.entries(allSpecs).map(([key, value]) => (
              <li key={key} className="component-spec-item">
                <span className="component-spec-label">
                  {key.replace(/_/g, " ")}:
                </span>
                <span className="component-spec-value">
                  {value?.toString().trim()}
                </span>
              </li>
            ))}
      </ul>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="modal-header">
          <h2>{build.title || "Unnamed Build"}</h2>
          {build.description && (
            <p className="build-description">{build.description}</p>
          )}
          <p className="total-price">
            Total Price: EGP {build.totalPrice || 0}
          </p>
        </div>

        <div className="component-viewer">
          {/* Main Component Display */}
          {selectedComponent && (
            <div className="main-component">
              <div className="main-image-container">
                {selectedComponent.image_source && (
                  <img
                    src={selectedComponent.image_source}
                    alt={
                      selectedComponent.name || selectedComponent.product_name
                    }
                    className="main-image"
                  />
                )}
              </div>
              <div className="main-details">
                <h3>
                  {(
                    selectedComponent.type || selectedComponent.category
                  )?.toUpperCase()}
                </h3>
                <h4>
                  {selectedComponent.name || selectedComponent.product_name}
                </h4>
                <p className="price">EGP {selectedComponent.price || "N/A"}</p>
                <div className="specs-container">
                  {renderComponentSpecs(selectedComponent)}
                </div>
              </div>
            </div>
          )}

          {/* Component Thumbnails */}
          <div className="component-thumbnails">
            {componentsArray.map((component, index) => (
              <div
                key={index}
                className={`thumbnail ${
                  selectedComponent === component ? "active" : ""
                }`}
                onClick={() => setSelectedComponent(component)}
              >
                {component.image_source && (
                  <img
                    src={component.image_source}
                    alt={component.name || component.product_name}
                    className="thumbnail-image"
                  />
                )}
                <span className="thumbnail-label">
                  {(component.type || component.category)?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityBuildDetailsModal;
