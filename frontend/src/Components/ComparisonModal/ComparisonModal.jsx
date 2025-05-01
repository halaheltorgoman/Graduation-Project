import React from "react";
import "./ComparisonModal.css";
import { useParams } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

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
  cooling: [
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
const ComparisonModal = ({ products, onClose }) => {
  if (!products || products.length !== 2) return null;
  const { type } = useParams();

  const getAllSpecs = (product) => {
    return Object.entries(product).reduce((acc, [key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        ![
          "_id",
          "image_source",
          "product_name",
          "title",
          "price",
          "rating",
          "product_link",
          "category",
          "__v",
          "imageUrl",
          "name",
        ].includes(key)
      ) {
        acc[key] = value;
      }
      return acc;
    }, {});
  };

  const getComponentType = () => {
    return products[0]?.category?.toLowerCase() || type?.toLowerCase() || "all";
  };

  const getSpecTemplate = () => {
    const componentType = getComponentType();
    return specTemplates[componentType] || null;
  };

  const renderProductSpecs = (product) => {
    const template = getSpecTemplate();
    const allSpecs = getAllSpecs(product);
    const hasSpecs = Object.keys(allSpecs).length > 0;

    if (!hasSpecs) {
      return (
        <p className="compare_no-specs-message">No specifications available</p>
      );
    }

    return (
      <ul className="compare_specs-list">
        {template
          ? template
              .filter((spec) => allSpecs[spec.key])
              .map((spec) => (
                <li key={spec.key} className="compare_spec-item">
                  <span className="compare_spec-label">{spec.label}:</span>
                  <span className="compare_spec-value">
                    {allSpecs[spec.key]?.toString()}
                  </span>
                </li>
              ))
          : Object.entries(allSpecs).map(([key, value]) => (
              <li key={key} className="compare_spec-item">
                <span className="compare_spec-label">
                  {key.replace(/_/g, " ")}:
                </span>
                <span className="compare_spec-value">{value?.toString()}</span>
              </li>
            ))}
      </ul>
    );
  };

  return (
    <div className="comparison-modal-overlay">
      <div className="comparison-modal">
        <div className="comparison-modal-header">
          <h2>Compare Components</h2>
          <button className="compare_close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="comparison-content">
          <div className="comparison-products">
            <div className="compare_product-column">
              <div className="compare_product-header">
                <h3>{products[0].title || products[0].name}</h3>
                <div className="compare_image_wrapper">
                  <img
                    src={products[0].image_source || products[0].imageUrl}
                    alt={products[0].title || products[0].name}
                    className="compare_product-image"
                  />
                </div>
              </div>
              <div className="compare_specs">
                <h3>Specifications</h3>
                {renderProductSpecs(products[0])}
              </div>
            </div>

            <div className="comparison-divider"></div>

            <div className="compare_product-column">
              <div className="compare_product-header">
                <h3>{products[1].title || products[1].name}</h3>
                <div className="compare_image_wrapper">
                  <img
                    src={products[1].image_source || products[1].imageUrl}
                    alt={products[1].title || products[1].name}
                    className="compare_product-image"
                  />
                </div>
              </div>
              <div className="compare_specs">
                <h3>Specifications</h3>
                {renderProductSpecs(products[1])}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
