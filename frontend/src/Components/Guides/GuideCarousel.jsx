import React from "react";
import { Carousel } from "antd";

const GuidesCarousel = ({ guide, categoryImages, onClick }) => {
  if (!guide) return null;

  // Get category image for the guide
  const getCategoryImage = (guide) => {
    const guideCategory = guide.category;
    return categoryImages[guideCategory] || categoryImages.Gaming;
  };

  // Get all component images
  const componentImages = guide.build?.components
    ? Object.values(guide.build.components)
        .map((comp) => comp?.image_source)
        .filter(Boolean)
    : [];

  // Combine category image with component images
  const allImages = [getCategoryImage(guide), ...componentImages];

  if (allImages.length === 0) return null;

  const handleImageClick = (e) => {
    if (e.target.classList.contains("guides_page_carousel_image")) {
      onClick?.();
    }
  };

  return (
    <div className="guides_page_carousel_wrapper">
      <div
        className="guides_page_carousel_container"
        onClick={handleImageClick}
      >
        <Carousel
          arrows={true}
          infinite={false}
          dots={true}
          autoplay={false}
          draggable={true}
        >
          {allImages.map((src, idx) => (
            <div key={idx}>
              <img
                src={src}
                alt={
                  idx === 0 ? `${guide.category} category` : `Component ${idx}`
                }
                className="guides_page_carousel_image"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default GuidesCarousel;
