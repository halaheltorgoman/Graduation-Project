import React from "react";
import "./ComponentShimmer.css";

const ComponentShimmer = () => {
  return (
    <div className="shimmer_card">
      <div className="shimmer_element shimmer_image"></div>
      <div className="shimmer_element shimmer_title"></div>
      <div className="shimmer_element shimmer_price"></div>
      <div className="shimmer_element shimmer_rating"></div>
    </div>
  );
};

export default ComponentShimmer;
