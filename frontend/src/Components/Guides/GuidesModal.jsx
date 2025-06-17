import React, { useState, useEffect } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Rate } from "antd";
import "./GuidesModal.css";

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

const GuidesModal = ({
  guide,
  onClose,
  onRateGuide,
  onToggleSave,
  userRating,
  isSaved,
}) => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [componentTypes, setComponentTypes] = useState([]);

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
    "images",
    "product_link",
    "name",
    "type",
    "__v",
  ];

  useEffect(() => {
    if (guide?.components || guide?.build?.components) {
      const components = guide.components || guide.build?.components;
      if (components) {
        const types = Object.keys(components);
        setComponentTypes(types);

        if (types.length > 0) {
          setSelectedComponent({
            ...components[types[0]],
            type: types[0],
          });
        }
      }
    }
  }, [guide]);

  const handleComponentClick = (component, type) => {
    setSelectedComponent({
      ...component,
      type,
    });
    setCurrentImageIndex(0);
  };

  const handlePrevImage = () => {
    if (selectedComponent?.images?.length) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + selectedComponent.images.length) %
          selectedComponent.images.length
      );
    }
  };

  const handleNextImage = () => {
    if (selectedComponent?.images?.length) {
      setCurrentImageIndex(
        (prev) => (prev + 1) % selectedComponent.images.length
      );
    }
  };

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
    const componentType = component.type?.toLowerCase();
    const template = specTemplates[componentType];
    const allSpecs = getAllSpecs(component);
    const hasSpecs = Object.keys(allSpecs).length > 0;

    if (!hasSpecs) {
      return <div className="no-specs">No specifications available</div>;
    }

    return (
      <div className="component-specs">
        {template
          ? template
              .filter((spec) => allSpecs[spec.key])
              .map((spec) => (
                <div key={spec.key} className="spec-row">
                  <span className="spec-key">{spec.label}:</span>
                  <span className="spec-value">
                    {allSpecs[spec.key]?.toString().trim() || "N/A"}
                  </span>
                </div>
              ))
          : Object.entries(allSpecs).map(([key, value]) => (
              <div key={key} className="spec-row">
                <span className="spec-key">{key.replace(/_/g, " ")}:</span>
                <span className="spec-value">
                  {value?.toString().trim() || "N/A"}
                </span>
              </div>
            ))}
      </div>
    );
  };

  // Get components from either guide.components or guide.build.components
  const components = guide?.components || guide?.build?.components;

  if (!guide || !components || componentTypes.length === 0) {
    return (
      <div className="build-modal-overlay">
        <div className="build-modal-content">
          <button className="build-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
          <div className="error-message">No component data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="build-modal-overlay" onClick={onClose}>
      <div className="build-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="build-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="build-modal-body">
          {/* Left Panel - Component Images */}
          <div className="build-image-panel">
            {selectedComponent && (
              <>
                <div className="main-component-image">
                  {selectedComponent.images?.length > 0 ? (
                    <>
                      <img
                        src={selectedComponent.images[currentImageIndex].url}
                        alt={
                          selectedComponent.name ||
                          selectedComponent.product_name ||
                          "Component"
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-component-image.png";
                        }}
                      />
                      {selectedComponent.images.length > 1 && (
                        <>
                          <button
                            className="image-nav-button left"
                            onClick={handlePrevImage}
                          >
                            <FaChevronLeft />
                          </button>
                          <button
                            className="image-nav-button right"
                            onClick={handleNextImage}
                          >
                            <FaChevronRight />
                          </button>
                          <div className="image-counter">
                            {currentImageIndex + 1} /{" "}
                            {selectedComponent.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="no-image-placeholder">
                      <img
                        src={
                          selectedComponent.image_source ||
                          "/default-component-image.png"
                        }
                        alt={
                          selectedComponent.name ||
                          selectedComponent.product_name ||
                          "No image available"
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-component-image.png";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="component-thumbnails">
                  {componentTypes.map((type) => {
                    const component = components[type];
                    return (
                      <div
                        key={type}
                        className={`thumbnail-item ${
                          selectedComponent?.type === type ? "active" : ""
                        }`}
                        onClick={() => handleComponentClick(component, type)}
                      >
                        {component?.images?.length > 0 ? (
                          <img
                            src={component.images[0].url}
                            alt={
                              component.name || component.product_name || type
                            }
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-component-image.png";
                            }}
                          />
                        ) : component?.image_source ? (
                          <img
                            src={component.image_source}
                            alt={
                              component.name || component.product_name || type
                            }
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-component-image.png";
                            }}
                          />
                        ) : (
                          <div className="thumbnail-placeholder">
                            <img
                              src="/default-component-image.png"
                              alt={type}
                            />
                          </div>
                        )}
                        <span className="thumbnail-label">{type}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Right Panel - Component Details */}
          <div className="build-details-panel">
            {selectedComponent ? (
              <>
                <h3 className="component-name">
                  {selectedComponent.name ||
                    selectedComponent.product_name ||
                    "Component"}
                </h3>

                {/* Component Price */}
                {selectedComponent.price && (
                  <div className="component-price">
                    <span className="spec-key">Price:</span>
                    <span className="spec-value">
                      EGP {selectedComponent.price.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Component Specifications */}
                {renderComponentSpecs(selectedComponent)}

                <div className="build-total-price">
                  <h4>Total Guide Price</h4>
                  <p>EGP {guide.totalPrice?.toLocaleString() || "N/A"}</p>
                </div>
              </>
            ) : (
              <div className="no-component-selected">
                Select a component to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidesModal;
