import React, { useState, useEffect, useContext } from "react";
import { SavedComponentsContext } from "../../Context/SavedComponentContext";
import { Tabs, Card, Button, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import BuildDummy from "../../assets/images/build_dummy.svg";
import "./SavedComponentsTab.css";

const COMPONENT_CATEGORIES = [
  { key: "all", label: "All Components" },
  { key: "cpu", label: "CPU" },
  { key: "gpu", label: "GPU" },
  { key: "motherboard", label: "Motherboard" },
  { key: "ram", label: "RAM" },
  { key: "case", label: "Case" },
  { key: "storage", label: "Storage" },
  { key: "cooler", label: "Cooler" },
  { key: "power supply", label: "Power Supply" },
];

function SavedComponentsTab() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { savedComponents, removeSavedComponent } = useContext(
    SavedComponentsContext
  );
  const [loading, setLoading] = useState(false);

const ComponentCard = ({ component, category }) => {
  const handleRemove = async () => {
    try {
      await removeSavedComponent(component._id, category);
    } catch (error) {
      console.error("Error removing component:", error);
    }
  };

  return (
    <Card
      hoverable
      className="profilesavedcomponent-card"
      cover={
        <>
          <div className="profilesavedcomponent-delete-container">
            <Button
              icon={<DeleteOutlined />}
              className="profilesavedcomponent-delete-btn"
              onClick={handleRemove}
            />
          </div>
          <img
            alt={component.title || component.product_name}
            src={component.image_source || BuildDummy}
            className="profilesavedcomponent-card-image"
            onError={(e) => {
              e.target.src = BuildDummy;
            }}
          />
        </>
      }
    >
      <Card.Meta
        title={
          <div className="profilesavedcomponent-title">
            {component.title || component.product_name || "Unknown Component"}
          </div>
        }
        description={
          <div className="profilesavedcomponentspectitle">
            <p>
              <strong>Specifications:</strong>
            </p>
            <div className="profilesavedcomponent-specs">
              {component.specifications ? (
                Object.entries(component.specifications).map(
                  ([key, value]) => (
                    <div 
                      key={key} 
                      className="profilesavedcomponent-spec-item"
                    >
                      <span className="profilesavedcomponent-spec-key">
                        {key}:
                      </span> {value}
                    </div>
                  )
                )
              ) : (
                <p>No specifications available</p>
              )}
            </div>
            {component.price && (
              <p className="profilesavedcomponent-price">
                Price: ${component.price}
              </p>
            )}
          </div>
        }
      />
    </Card>
  );
};

  const renderComponents = () => {
    if (!savedComponents || typeof savedComponents !== "object") {
      return (
        <div className="profilesavedcomponent-empty">
          <p>No saved components found</p>
        </div>
      );
    }

    let componentsToShow = [];
    if (activeCategory === "all") {
      const seenIds = new Set();
      Object.keys(savedComponents).forEach((category) => {
        if (Array.isArray(savedComponents[category])) {
          savedComponents[category].forEach((comp) => {
            if (!seenIds.has(comp._id)) {
              seenIds.add(comp._id);
              componentsToShow.push({ ...comp, category });
            }
          });
        }
      });
    } else {
      const categoryComponents = savedComponents[activeCategory];
      if (Array.isArray(categoryComponents)) {
        componentsToShow = categoryComponents.map((comp) => ({
          ...comp,
          category: activeCategory,
        }));
      }
    }

    if (componentsToShow.length === 0) {
      return (
        <div className="profilesavedcomponent-empty">
          <p>No components found in this category</p>
        </div>
      );
    }

    return (
      <div className="profilesavedcomponent-grid">
        {componentsToShow.map((component, index) => (
          <ComponentCard
            key={`${component._id || component.id || index}-${
              component.category
            }`}
            component={component}
            category={component.category}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="profilesavedcomponent-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="profilesavedcomponent-container">
      <Tabs
        centered
        activeKey={activeCategory}
        onChange={setActiveCategory}
        className="profilesavedcomponent-tabs"
        items={COMPONENT_CATEGORIES.map((category) => ({
          label: category.label,
          key: category.key,
          children: (
            <div className="profilesavedcomponent-tabpane">
              {renderComponents()}
            </div>
          ),
        }))}
      />
    </div>
  );
}

export default SavedComponentsTab;