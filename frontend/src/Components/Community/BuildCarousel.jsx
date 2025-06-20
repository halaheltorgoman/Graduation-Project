// BuildCarousel.js
import React from "react";
import { Carousel } from "antd";
import "./BuildCarousel.css";
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const BuildCarousel = ({ components, onClick }) => {
  if (!components) return null;

  const images = Object.values(components)
    .map((comp) => comp?.image_source)
    .filter(Boolean);

  if (images.length === 0) return null;

  const handleImageClick = (e) => {
    if (e.target.classList.contains('custom-carousel-image')) {
      onClick?.();
    }
  };

  // Custom arrow components
  const PrevArrow = (props) => (
  <button
    {...props}
    className="build-carousel-prev-arrow"
    aria-label="Previous"
  >
    <LeftOutlined />
  </button>
);

const NextArrow = (props) => (
  <button
    {...props}
    className="build-carousel-next-arrow"
    aria-label="Next"
  >
    <RightOutlined />
  </button>
);

  return (
    <div className="custom-carousel-wrapper">
      <div className="custom-carousel-container" onClick={handleImageClick}>
        <Carousel 
          arrows 
          infinite={false} 
          dots
          prevArrow={<PrevArrow />}
          nextArrow={<NextArrow />}
        >
          {images.map((src, idx) => (
            <div key={idx}>
              <img
                src={src}
                alt={`Component ${idx}`}
                className="custom-carousel-image"
              />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default BuildCarousel;