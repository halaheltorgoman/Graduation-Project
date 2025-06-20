// PostCarousel.js
import React from "react";
import { Carousel } from "antd";
import "./PostCarousel.css";
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const PostCarousel = ({ buildContent, images, onBuildClick }) => {
  if (!buildContent && (!images || images.length === 0)) return null;

  // Custom arrow components
  const PostPrevArrow = (props) => (
  <button
    {...props}
    className="post-carousel-prev-arrow"
    aria-label="Previous"
  >
    <LeftOutlined />
  </button>
);

const PostNextArrow = (props) => (
  <button
    {...props}
    className="post-carousel-next-arrow"
    aria-label="Next"
  >
    <RightOutlined />
  </button>
);

  return (
    <div className="post-carousel-wrapper">
      <Carousel 
        arrows 
        infinite={false} 
        dots
        prevArrow={<PostPrevArrow />}
        nextArrow={<PostNextArrow />}
      >
        {buildContent && (
          <div key="build-content">
            {buildContent}
          </div>
        )}
        
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