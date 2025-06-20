import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BuildDummy from "../../assets/images/build_dummy.svg";
import { FaShare, FaTrash, FaHeart, FaBookmark } from "react-icons/fa";
import { useNavigation } from "../../Context/NavigationContext";
import { usePageNavigation } from "../../Hooks/usePageNavigationHook"; // Import the hook
import "./ProfileBuildCard.css";

function SavedComponentCard({ component, onDeleteComponent, onUseComponent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { navigateToComponentDetail } = useNavigation();

  // Use the page navigation hook
  const { handleComponentClick } = usePageNavigation("saved-components", {
    enableScrollRestoration: true,
    enableStateRestoration: true,
  });

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

  const handleNavigateToDetails = (e) => {
    console.log("=== CLICK HANDLER TRIGGERED ===");
    console.log("Event:", e);
    console.log("Component data:", component);

    // Prevent any event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Ensure we have the required data
    const componentId = component._id || component.id;
    const componentType = component.type || component.category;

    if (!componentId) {
      console.error("Missing component ID:", component);
      alert("Cannot navigate: Missing component ID");
      return;
    }

    if (!componentType) {
      console.error("Missing component type/category:", component);
      alert("Cannot navigate: Missing component type");
      return;
    }

    // First try using the page navigation hook
    try {
      console.log("Using page navigation hook");
      handleComponentClick(component, {
        returnUrl: "/profile/saved-components",
        fromPage: "saved-components",
      });
      return;
    } catch (error) {
      console.error("Page navigation hook failed:", error);
    }

    // Fallback to navigation context
    if (
      navigateToComponentDetail &&
      typeof navigateToComponentDetail === "function"
    ) {
      console.log("Using navigation context");
      try {
        navigateToComponentDetail(component, {
          sourcePage: "saved-components",
          scrollPosition: window.pageYOffset,
          additionalState: {
            returnUrl: "/profile/saved-components",
            fromPage: "saved-components",
          },
        });
        return;
      } catch (error) {
        console.error("Navigation context failed:", error);
      }
    }

    // Final fallback to direct navigation
    const normalizedType = componentType.toLowerCase();
    const navigationPath = `/components/${normalizedType}/${componentId}`;

    console.log(`Direct navigation to: ${navigationPath}`);

    navigate(navigationPath, {
      state: {
        fromPage: "saved-components",
        returnUrl: "/profile/saved-components",
        component: component,
        sourcePageData: {
          sourcePage: "saved-components",
          scrollPosition: window.pageYOffset,
        },
      },
    });
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

  // Debug component data
  console.log("SavedComponentCard render - Component data:", {
    id: component._id || component.id,
    type: component.type,
    category: component.category,
    title: component.title,
    name: component.name,
  });

  return (
    <div className={`profile_buildCard ${isExpanded ? "expanded" : ""}`}>
      <div className="profile_buildCard_main">
        <div
          className="profile_buildCard_info"
          onClick={(e) => {
            console.log("Card clicked!", e);
            handleNavigateToDetails(e);
          }}
          onMouseDown={(e) => console.log("Mouse down on card", e)}
          onMouseUp={(e) => console.log("Mouse up on card", e)}
          style={{
            cursor: "pointer",
            userSelect: "none",
            pointerEvents: "auto",
            position: "relative",
            zIndex: 1,
            // Add visual feedback for debugging
            outline: "1px solid transparent",
            transition: "outline 0.2s",
          }}
          onMouseEnter={(e) => {
            console.log("Mouse entered card info");
            e.target.style.outline = "1px solid #007bff";
          }}
          onMouseLeave={(e) => {
            console.log("Mouse left card info");
            e.target.style.outline = "1px solid transparent";
          }}
        >
          <img
            src={imageUrl}
            alt={componentName}
            className="build-image"
            onError={(e) => {
              e.target.src = BuildDummy;
            }}
            style={{ pointerEvents: "none" }}
          />
          <div className="build-info" style={{ pointerEvents: "none" }}>
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
            onClick={(e) => {
              e.stopPropagation();
              console.log("View/Close button clicked");
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? "Close" : "View"}
          </button>
          {!isExpanded && (
            <button
              className="profile_buildCard_Share"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Share button clicked");
              }}
            >
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
                onClick={handleNavigateToDetails}
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                  pointerEvents: "auto",
                }}
              />
            </div>
            <div className="component-info-section">
              <h2
                onClick={handleNavigateToDetails}
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                  pointerEvents: "auto",
                }}
              >
                {componentName}
              </h2>
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
              onClick={(e) => {
                e.stopPropagation();
                handleUseComponent();
              }}
            >
              Use in Build
            </button>
            <button
              className="view-details-button"
              onClick={handleNavigateToDetails}
            >
              View Full Details
            </button>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteComponent();
              }}
            >
              <FaTrash /> Remove from Saved
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedComponentCard;
