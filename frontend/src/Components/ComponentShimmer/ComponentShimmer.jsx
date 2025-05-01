import React from "react";
import "./ComponentShimmer.css";

const ComponentShimmer = () => {
  return (
    <div class="shimmer_card">
      <div class="shimmer_element shimmer_image"></div>
      <div class="shimmer_element shimmer_title"></div>
      <div class="shimmer_element shimmer_price"></div>
      <div class="shimmer_element shimmer_rating"></div>
    </div>
  );
};

export default ComponentShimmer;
