import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import postImage from "../../assets/images/postBuild_dummy.png";
import "../Community/Community.css"; // Adjust the path as necessary

const BigImageSlider = ({ images, components }) => {
  // If components is provided, extract images from it
  let imageList = [];
  if (components) {
    imageList = Object.values(components)
      .map((comp) => comp?.image_source)
      .filter(Boolean);
  } else if (images) {
    imageList = images.map((img) => img?.url || img).filter(Boolean);
  }

  const [current, setCurrent] = useState(0);

  if (!imageList || imageList.length === 0) return null;

  const handlePrev = () =>
    setCurrent((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrent((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));

  return (
    <div className="slider-container">
      <button className="slider-arrow left" onClick={handlePrev}>
        <FaChevronLeft />
      </button>
      <div className="slider-image-container">
        <img
          src={imageList[current] || postImage}
          alt={`Slider content ${current}`}
          className="slider-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = postImage;
          }}
        />
      </div>
      <button className="slider-arrow right" onClick={handleNext}>
        <FaChevronRight />
      </button>
      <div className="slider-indicator">
        {current + 1} / {imageList.length}
      </div>
    </div>
  );
};

export default BigImageSlider;
