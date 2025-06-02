import React, { useContext } from "react";
import { FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import { MdArrowOutward } from "react-icons/md";
import ComponentShimmer from "../ComponentShimmer/ComponentShimmer";
import { SavedComponentsContext } from "../../Context/SavedComponentContext";

const BrowseComponentList = ({
  components,
  compareList,
  toggleCompare,
  isLoading,
  onComponentClick,
}) => {
  const { favorites, toggleFavorite } = useContext(SavedComponentsContext);

  const handleCardClick = (component) => {
    onComponentClick(component);
  };

  const handleFavoriteClick = (e, component) => {
    e.stopPropagation();
    toggleFavorite(component);
  };

  const handleCompareClick = (e, componentId) => {
    e.stopPropagation();
    toggleCompare(componentId);
  };

  return (
    <div className="browsecomponents_products">
      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ComponentShimmer key={index} />
          ))
        ) : components.length > 0 ? (
          components.map((component) => (
            <div
              key={component._id}
              className="component_card grid grid-cols-4 gap-4 cursor-pointer"
              onClick={() => handleCardClick(component)}
            >
              <div className="componentCard_firstSec">
                <div className="rating_container">
                  <span className="rating_value">{component.rating}</span>
                  <FaStar className="rating_star" />
                </div>
                <span
                  className={`favorite-icon ${
                    favorites.includes(component._id) ? "favorited" : ""
                  }`}
                  onClick={(e) => handleFavoriteClick(e, component)}
                >
                  {favorites.includes(component._id) ? (
                    <FaHeart className="favorited" />
                  ) : (
                    <FaRegHeart className="unfavorited" />
                  )}
                </span>
              </div>
              <div className="componentCard_secondSec">
                <img
                  className="component_image"
                  src={component.image_source}
                  alt={component.title}
                />
                <p className="component_title">{component.title}</p>
                <p className="component_price">
                  <span>EGP</span>
                  {component.price}
                </p>
                <div
                  className={`compare-icon ${
                    compareList.includes(component._id) ? "compared" : ""
                  }`}
                  onClick={(e) => handleCompareClick(e, component._id)}
                >
                  <button>
                    <p>
                      {compareList.includes(component._id)
                        ? compareList.length === 1
                          ? "Select another"
                          : "Comparing"
                        : "Compare"}
                    </p>
                    <MdArrowOutward />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No components found.</p>
        )}
      </div>
    </div>
  );
};

export default BrowseComponentList;
