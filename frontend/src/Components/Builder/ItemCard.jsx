import React, { useState, useContext } from "react";
import { Button } from "../ui/button";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import { FaShare } from "react-icons/fa";
import {
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaLink,
  FaTelegram,
  FaReddit,
  FaTimes,
} from "react-icons/fa";
import TransparentImage from "../TransparentImage/TransparentImage";
import { SavedComponentsContext } from "../../Context/SavedComponentContext";
import "./ItemCard.css"; // Import your CSS styles
const specTemplates = {
  cpu: [
    { label: "Cores", key: "cores" },
    { label: "Threads", key: "threads" },
    { label: "Turbo Clock", key: "turbo_clock" },
    { label: "Base Clock", key: "base_clock" },
    { label: "Processor Speed", key: "processor_speed" },
    { label: "Socket", key: "socket" },
    { label: "Cache", key: "cache" },
    { label: "Chipsets", key: "MB_chipsets_all" },
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
    { label: "Chipset", key: "chipset" },
    { label: "Motherboard Form", key: "MB_form" },
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
    { label: "Supported Motherboards", key: "supported_motherboards" },
  ],
  cooler: [
    { label: "Brand", key: "brand" },
    { label: "Cooling Method", key: "cooling_method" },
    { label: "Air Flow Capacity", key: "air_flow_capacity" },
    { label: "Radiator Size", key: "radiator_size" },
    { label: "Fan Size", key: "fan_size" },
    { label: "Supported Lightning Type", key: "compatible_lighting_type" },
    { label: "Supported Socket", key: "compatible_cpu_sockets" },
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

const ItemCard = ({ item, type, selected, onSelect, onNext, showError }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Use context for favorites instead of local state
  const { favorites, toggleFavorite } = useContext(SavedComponentsContext);

  const allSpecs = item
    ? Object.entries(item).reduce((acc, [key, value]) => {
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
        if (!item?.product_link) {
          alert("Product link not available");
          return;
        }
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `Check out this ${item?.category || "component"}: ${item?.title}\n${
              item?.product_link
            }`
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Facebook",
      icon: <FaFacebook className="facebook-icon" />,
      action: () => {
        if (!item?.product_link) {
          alert("Product link not available");
          return;
        }
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            item?.product_link
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Twitter",
      icon: <FaTwitter className="twitter-icon" />,
      action: () => {
        if (!item?.product_link) {
          alert("Product link not available");
          return;
        }
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Check out this ${item?.category || "component"}: ${item?.title}`
          )}&url=${encodeURIComponent(item?.product_link)}`,
          "_blank"
        );
      },
    },
    {
      name: "Telegram",
      icon: <FaTelegram className="telegram-icon" />,
      action: () => {
        if (!item?.product_link) {
          alert("Product link not available");
          return;
        }
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            item?.product_link
          )}&text=${encodeURIComponent(
            `Check out this ${item?.category || "component"}: ${item?.title}`
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Reddit",
      icon: <FaReddit className="reddit-icon" />,
      action: () => {
        if (!item?.product_link) {
          alert("Product link not available");
          return;
        }
        window.open(
          `https://www.reddit.com/submit?url=${encodeURIComponent(
            item?.product_link
          )}&title=${encodeURIComponent(
            `${item?.title} - PC Builder Component`
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Copy Link",
      icon: <FaLink className="link-icon" />,
      action: async () => {
        if (!item?.product_link) {
          alert("Product link not available");
          return;
        }
        try {
          await navigator.clipboard.writeText(item?.product_link);
          alert("Product link copied to clipboard!");
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = item?.product_link;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          alert("Product link copied to clipboard!");
        }
        setShowShareMenu(false);
      },
    },
  ];

  const getSpecTemplate = () => {
    const componentType = item?.category?.toLowerCase() || type.toLowerCase();
    return specTemplates[componentType] || null;
  };

  const renderSpecItem = (label, value) => (
    <div key={label} className="component_details_spec-item">
      <span className="component_details_spec-label">{label}</span>
      <span className="component_details_spec-value">{value?.toString()}</span>
    </div>
  );

  // Simplified favorite toggle using context
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!item) return;
    toggleFavorite(item);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setShowShareMenu(true);
  };

  const handleShareOptionClick = (option) => {
    option.action();
    if (option.name !== "Copy Link") {
      setShowShareMenu(false);
    }
  };

  // Support both images (array) and image_source (string)
  const images =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image_source
      ? [item.image_source]
      : [];

  const specTemplate = getSpecTemplate();
  const hasSpecs = Object.keys(allSpecs).length > 0;

  return (
    <div
      className={`item-card-container p-6 mb-8 last:mb-0 rounded-3xl bg-black/60 flex gap-4 transition-all border-2 ${
        selected ? "border-white" : "border-transparent"
      }`}
      onClick={onSelect}
      style={{ cursor: "pointer" }}
    >
      {/* Share Modal */}
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
              <h3 className="share-modal-title">Share this product</h3>
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
                  onClick={() => handleShareOptionClick(option)}
                >
                  <span className="share-option-icon">{option.icon}</span>
                  <span className="share-option-text">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="item-card-left flex-1">
        <div className="item-card-images ">
          {/* <div className="item-card-thumbnails">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(index);
                }}
                className={`item-card-thumbnail ${
                  index === activeImage ? "border-b-2 border-purple-500" : ""
                } p-1 cursor-pointer`}
              >
                <TransparentImage
                  className="item-card-thumbnail-image w-12 h-12 object-contain"
                  src={image}
                  alt={item.name}
                />
              </div>
            ))}
          </div> */}
          <div className="item-card-main-image-container flex-1 relative">
            <button
              className="item-card-favorite-button absolute top-2 right-2 p-2 hover:bg-purple-500/20 rounded-full transition-colors z-10"
              onClick={handleFavoriteClick}
            >
              {favorites.includes(item?._id) ? (
                <FaHeart className="text-red-500" size={20} />
              ) : (
                <FaRegHeart className="text-white" size={20} />
              )}
            </button>
            <h2 className="item-card-title text-2xl font-semibold mb-2">
              {item.title}
            </h2>
            <p className="item-card-price text-xl text-[#9c47b1]">
              EGP {item.price?.toFixed(2)}{" "}
            </p>
            <div className="item-card-main-image-wrapper px-8 py-16 border-b">
              <img
                className="item-card-main-image "
                src={images[activeImage]}
                alt={item.name}
              />
            </div>
            <div className="item-card-description mt-4">
              <h3 className="item-card-description-title text-lg font-semibold mb-3">
                Description
              </h3>

              <ul className="item-card-description-text text-sm text-gray-400 list-disc">
                {item.product_name}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="item-card-right flex-1 flex flex-col">
        <div className="item-card-header mb-3">
          <div className="item-card-title-wrapper flex items-center ">
            <div className=" flex gap-2 items-center">
              <span className="item-card-rating-value text-sm text-gray-400">
                {item.rating}
              </span>
              <FaStar className="item-card-rating-star rating_star" />
            </div>
          </div>
        </div>

        <div className="item-card-specs">
          <div className="item-card-specs-section">
            <h3 className="item-card-specs-title text-lg font-semibold mb-3">
              Specifications
            </h3>
            {hasSpecs ? (
              <div className="component_details_specs-list">
                {specTemplate
                  ? specTemplate
                      .filter((spec) => allSpecs[spec.key])
                      .map((spec) =>
                        renderSpecItem(spec.label, allSpecs[spec.key])
                      )
                  : Object.entries(allSpecs).map(([key, value]) =>
                      renderSpecItem(key.replace(/_/g, " "), value)
                    )}
              </div>
            ) : (
              <p className="component_details-specs-message">
                No specifications available
              </p>
            )}

            <Button
              className="item-card-next-button mt-3 rounded-[60px] px-14 bg-[#621C74]"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              disabled={!selected}
            >
              Next
            </Button>
          </div>

          {item.website && (
            <p className="item-card-website-info mt-6 text-lg font-semibold mb-3">
              For More Info Visit:{" "}
              <a
                href={item.website.url}
                target="_blank"
                className="item-card-website-link underline"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {item.website.title}
              </a>
            </p>
          )}

          {showError && (
            <div className="item-card-error-message mt-2 text-red-500 text-sm">
              Please select this component before proceeding.
            </div>
          )}
        </div>

        {/* <div className="item-card-share-section flex flex-col gap-4 w-fit items-start my-4">
          <Button
            variant="link"
            className="item-card-share-button text-white"
            onClick={handleShareClick}
          >
            <FaShare className="item-card-share-icon w-4 h-4" />
            Share
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default ItemCard;
