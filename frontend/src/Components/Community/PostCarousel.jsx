import React from "react";
import { Carousel } from "antd";
import "./PostCarousel.css";

const PostCarousel = ({ 
  buildContent,  // This will be the entire build content JSX
  images, 
  onBuildClick 
}) => {
  if (!buildContent && (!images || images.length === 0)) return null;

  return (
    <div className="post-carousel-wrapper">
      <Carousel arrows infinite={false} dots>
        {/* First slide - Entire build content */}
        {buildContent && (
          <div key="build-content">
            {buildContent}
          </div>
        )}
        
        {/* Additional slides for user images */}
        {images?.map((image, idx) => (
          <div key={`user-image-${idx}`}>
            <img
              src={image.url || image}
              alt={`User uploaded ${idx}`}
              className="post-carousel-image"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default PostCarousel;