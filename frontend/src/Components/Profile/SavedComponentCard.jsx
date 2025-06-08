import React, { useState } from "react";
import BuildDummy from "../../assets/images/build_dummy.svg";
import { FaShare, FaTrash, FaHeart, FaBookmark } from "react-icons/fa";
import "./ProfileBuildCard.css";

function SavedComponentCard({ component, onDeleteComponent, onUseComponent }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDeleteComponent = () => {
    if (onDeleteComponent) {
      onDeleteComponent(component._id || component.id);
    }
  };

  const handleUseComponent = () => {
    if (onUseComponent) {
      onUseComponent(component);
    }
  };

  const imageUrl =
    component.image_source?.url || component.image_source || BuildDummy;
  const componentName =
    component.title ||
    component.product_name ||
    component.name ||
    "Unknown Component";
  const componentType = component.type || component.category || "Component";
  const price = component.price || component.current_price || "N/A";
  const brand = component.brand || component.manufacturer || "Unknown";

  return (
    <div className={`profile_buildCard ${isExpanded ? "expanded" : ""}`}>
      <div className="profile_buildCard_main">
        <div className="profile_buildCard_info">
          <img
            src={imageUrl}
            alt={componentName}
            className="build-image"
            onError={(e) => {
              e.target.src = BuildDummy;
            }}
          />
          <div className="build-info">
            <h3 className="profile_buildCard_title">{componentName}</h3>
            <div className="component-meta">
              <span className="component-type">{componentType}</span>
              <span>•</span>
              <span className="component-brand">{brand}</span>
              {price !== "N/A" && (
                <>
                  <span>•</span>
                  <span className="component-price">${price}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="profile_buildCard_buttons">
          <button
            className="profile_buildCard_Edit"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Close" : "View"}
          </button>
          {!isExpanded && (
            <button className="profile_buildCard_Share">
              <FaShare />
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="component-card-expanded-content">
          <div className="component-details">
            <div className="component-image-section">
              <img
                src={imageUrl}
                alt={componentName}
                className="component-large-image"
              />
            </div>
            <div className="component-info-section">
              <h2>{componentName}</h2>
              <div className="component-specs">
                <div className="spec-row">
                  <span className="spec-label">Type:</span>
                  <span className="spec-value">{componentType}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Brand:</span>
                  <span className="spec-value">{brand}</span>
                </div>
                {price !== "N/A" && (
                  <div className="spec-row">
                    <span className="spec-label">Price:</span>
                    <span className="spec-value">${price}</span>
                  </div>
                )}
                {component.description && (
                  <div className="spec-row description">
                    <span className="spec-label">Description:</span>
                    <span className="spec-value">{component.description}</span>
                  </div>
                )}
                {component.specifications && (
                  <div className="additional-specs">
                    <h4>Specifications:</h4>
                    {Object.entries(component.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="spec-row">
                          <span className="spec-label">{key}:</span>
                          <span className="spec-value">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              {component.saved_date && (
                <div className="saved-info">
                  <small>
                    Saved on:{" "}
                    {new Date(component.saved_date).toLocaleDateString()}
                  </small>
                </div>
              )}
              {component.likes || component.saves ? (
                <div className="component-metrics">
                  {component.likes && (
                    <div className="metric">
                      <FaHeart /> {component.likes}
                    </div>
                  )}
                  {component.saves && (
                    <div className="metric">
                      <FaBookmark /> {component.saves}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          <div className="component-card-actions">
            <button
              className="use-component-button"
              onClick={handleUseComponent}
            >
              Use in Build
            </button>
            <button className="delete-button" onClick={handleDeleteComponent}>
              <FaTrash /> Remove from Saved
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedComponentCard;
