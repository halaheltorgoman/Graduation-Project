import React, { useState } from "react";
import { Button } from "../ui/button";
import logo from "../../assets/images/logo.svg";
import { FaStar } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import { FaShare } from "react-icons/fa";

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

const ItemCard = ({ item, type, selected, onSelect, onNext, showError }) => {
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

  const getSpecTemplate = () => {
    const componentType = item?.category?.toLowerCase() || type.toLowerCase();
    return specTemplates[componentType] || null;
  };

  const renderSpecItem = (label, value) => (
    <li key={label} className="component_details_spec-item">
      <span className="component_details_spec-label">{label} :</span>
      <span className="component_details_spec-value">{value?.toString()}</span>
    </li>
  );
  // Support both images (array) and image_source (string)
  const images =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image_source
      ? [item.image_source]
      : [];

  const [activeImage, setActiveImage] = useState(0);

  const specTemplate = getSpecTemplate();
  const hasSpecs = Object.keys(allSpecs).length > 0;
  return (
    <div
      className={`p-6 mb-8 last:mb-0 rounded-3xl bg-black/60 flex gap-6 transition-all border-2 ${
        selected ? "border-white" : "border-transparent"
      }`}
      onClick={onSelect}
      style={{ cursor: "pointer" }}
    >
      <div className="flex-1">
        <div className="flex gap-6">
          <div className="space-y-4">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(index);
                }}
                className={`${
                  index === activeImage ? "border-b-2 border-purple-500" : ""
                } p-1 cursor-pointer`}
              >
                <img
                  className="w-12 h-12 object-contain"
                  src={image}
                  alt={item.name}
                />
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            <button className="absolute top-2 right-2 p-2 hover:bg-purple-500/20 rounded-full transition-colors">
              {/* <Heart className="w-6 h-6 text-primary" /> */}
            </button>
            <div className="px-8 py-16 border-b">
              <img
                className="w-full h-full object-contain"
                src={images[activeImage]}
                alt={item.name}
              />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <ul className="text-sm text-gray-400 list-disc ">
                {item.product_name}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-400">{item.rating}</span>
              <FaStar className="rating_star" />
            </div>
          </div>
          <p className="text-xl text-gray-300">
            ${item.price?.toFixed(2)}{" "}
            <span className="text-sm text-gray-400">Average Price</span>
          </p>
        </div>

        <div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Specifications</h3>
            <ul className="space-y-2 list-disc pl-5">
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
            </ul>
          </div>

          {item.website && (
            <p className="mt-6 text-lg font-semibold mb-3">
              For More Info Visit :{" "}
              <a
                href={item.website.url}
                target="_blank"
                className="underline"
                rel="noopener noreferrer"
              >
                {item.website.title}
              </a>
            </p>
          )}

          <Button
            className="mt-14 rounded-[60px] px-14 bg-[#621C74]"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            disabled={!selected}
          >
            Next
          </Button>
          {showError && (
            <div className="mt-2 text-red-500 text-sm">
              Please select this component before proceeding.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 w-fit items-start my-4">
          <Button variant="link" className="text-white">
            <MdArrowOutward className="w-4 h-4" />
            Compare
          </Button>
          <Button variant="link" className="text-white">
            <FaShare className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
