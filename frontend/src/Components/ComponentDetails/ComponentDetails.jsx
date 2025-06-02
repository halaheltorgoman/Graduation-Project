import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart, FaStar, FaInfoCircle } from "react-icons/fa";
import "./ComponentDetails.css";
import { IoInformationCircleOutline } from "react-icons/io5";
import { IoMdShareAlt } from "react-icons/io";
import {
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaLink,
  FaTelegram,
  FaReddit,
  FaTimes,
} from "react-icons/fa";

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

const ComponentDetails = () => {
  const { type, componentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const allSpecs = component
    ? Object.entries(component).reduce((acc, [key, value]) => {
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
          ].includes(key)
        ) {
          acc[key] = value;
        }
        return acc;
      }, {})
    : {};

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="whatsapp-icon" />,
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `Check out this ${component?.category || "component"}: ${
              component?.title
            }\n${component?.product_link}`
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Facebook",
      icon: <FaFacebook className="facebook-icon" />,
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            component?.product_link
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Twitter",
      icon: <FaTwitter className="twitter-icon" />,
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Check out this ${component?.category || "component"}: ${
              component?.title
            }`
          )}&url=${encodeURIComponent(component?.product_link)}`,
          "_blank"
        );
      },
    },
    {
      name: "Telegram",
      icon: <FaTelegram className="telegram-icon" />,
      action: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            component?.product_link
          )}&text=${encodeURIComponent(
            `Check out this ${component?.category || "component"}: ${
              component?.title
            }`
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Reddit",
      icon: <FaReddit className="reddit-icon" />,
      action: () => {
        window.open(
          `https://www.reddit.com/submit?url=${encodeURIComponent(
            component?.product_link
          )}&title=${encodeURIComponent(
            `${component?.title} - PC Builder Component`
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Copy Link",
      icon: <FaLink className="link-icon" />,
      action: () => {
        navigator.clipboard.writeText(component?.product_link || "");
        alert("Product link copied to clipboard!");
        setShowShareMenu(false);
      },
    },
  ];

  const getSpecTemplate = () => {
    const componentType =
      component?.category?.toLowerCase() || type.toLowerCase();
    return specTemplates[componentType] || null;
  };

  const renderSpecItem = (label, value) => (
    <li key={label} className="component_details_spec-item">
      <span className="component_details_spec-label">{label} :</span>
      <span className="component_details_spec-value">{value?.toString()}</span>
    </li>
  );

  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:4000/api/components/${type}/${componentId}`
        );
        setComponent(data);
      } catch (error) {
        console.error("Error fetching component:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComponent();
  }, [type, componentId]);

  const toggleFavorite = () => {
    if (!component) return;
    setFavorites((prev) =>
      prev.includes(component._id)
        ? prev.filter((fav) => fav !== component._id)
        : [...prev, component._id]
    );
  };

  const handleBackClick = () => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page") || 1;
    
    // Get the saved state from sessionStorage
    const savedState = sessionStorage.getItem(`browseState-${type}`);
    const state = savedState ? JSON.parse(savedState) : {};
    
    navigate(`/browsecomponents/${type}?page=${page}`, {
      state: {
        filters: state.filters || {},
        sortBy: state.sortBy || null,
      }
    });
  };

  if (isLoading) return <div className="loading-message">Loading...</div>;
  if (!component)
    return <div className="error-message">Component not found</div>;

  const specTemplate = getSpecTemplate();
  const hasSpecs = Object.keys(allSpecs).length > 0;

  return (
    <div className="component-details-container">
      <button onClick={handleBackClick} className="back-button">
        &larr; Back to Components
      </button>

      <div className="component_details_container">
        {showShareMenu && (
          <div
            className="share-modal-overlay"
            onClick={() => setShowShareMenu(false)}
          >
            <div
              className="share-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="share-modal-header">
                <h3>Share this product</h3>
                <button
                  className="close-share-menu"
                  onClick={() => setShowShareMenu(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="share-options-grid">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    className="share-option"
                    onClick={() => {
                      option.action();
                      setShowShareMenu(false);
                    }}
                  >
                    <span className="share-option-icon">{option.icon}</span>
                    <span className="share-option-text">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="component_details_primary">
          <div className="component_details_favorite">
            <span
              className={`favorite-icon ${
                favorites.includes(component?._id) ? "favorited" : ""
              }`}
              onClick={toggleFavorite}
            >
              {favorites.includes(component?._id) ? (
                <FaHeart className="favorited" style={{ fontSize: "30px" }} />
              ) : (
                <FaRegHeart
                  className="unfavorited"
                  style={{ fontSize: "30px" }}
                />
              )}
            </span>
          </div>
          <div className="component_details_image">
            <img
              src={component?.image_source}
              alt={component?.title || "Component image"}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "default-component-image.jpg";
              }}
            />
          </div>
          <div className="component_details_divider"></div>
          <div className="component_details_description">
            <h3>Description</h3>
            <p>{component?.product_name || "No description available."}</p>
          </div>
        </div>
        <div className="component_details_secondary">
          <div className="component_details_header">
            <h2>{component?.title || "Component Title"}</h2>
            {component?.product_link && (
              <a
                href={component.product_link}
                target="_blank"
                rel="noopener noreferrer"
                className="product-info-icon"
                title="View product details on Amazon"
              >
                <IoInformationCircleOutline size={25} />
              </a>
            )}
          </div>

          <div className="component_details_price_rate">
            <div className="component_details_price">
              <span>EGP</span>
              {component?.price || "N/A"}
            </div>
            <div className="component_details_rating">
              <span>{component?.rating || "0"}</span>
              <FaStar className="rating_star" size={20} />
            </div>
          </div>

          <div className="component_details_specs">
            <h3>Specifications</h3>
            {hasSpecs ? (
              <ul className="component_details_specs-list">
                {specTemplate
                  ? specTemplate
                      .filter((spec) => allSpecs[spec.key])
                      .map((spec) =>
                        renderSpecItem(spec.label, allSpecs[spec.key])
                      )
                  : Object.entries(allSpecs).map(([key, value]) =>
                      renderSpecItem(key.replace(/_/g, " "), value)
                    )}
              </ul>
            ) : (
              <p className="component_details-specs-message">
                No specifications available
              </p>
            )}
          </div>

          <div className="component_details_Buttons">
            <button
              className="component_details_share-button"
              onClick={() => setShowShareMenu(true)}
            >
              <IoMdShareAlt className="component_details_button-icon" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentDetails;