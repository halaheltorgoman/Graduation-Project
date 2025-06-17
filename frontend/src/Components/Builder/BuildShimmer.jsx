import React from "react";
import "./Builder.css";

const BuildShimmer = () => {
  return (
    <div className="build_shimmer_card">
      <div className="build_shimmer_element build_shimmer_image"></div>
      <div className="build_shimmer_element build_shimmer_title"></div>
      <div className="build_shimmer_element build_shimmer_price"></div>
      <div className="build_shimmer_element build_shimmer_rating"></div>
    </div>
  );
};

export default BuildShimmer;
