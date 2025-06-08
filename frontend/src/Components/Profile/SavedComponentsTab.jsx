import React, { useState, useEffect, useContext } from "react";
import { SavedComponentsContext } from "../../Context/SavedComponentContext";
import { Tabs, Card, Button, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import BuildDummy from "../../assets/images/build_dummy.svg";

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
        style={{ width: 200, margin: "10px" }}
        cover={
          <img
            alt={component.title || component.product_name}
            src={component.image_source || BuildDummy}
            style={{ height: 200, objectFit: "cover" }}
            onError={(e) => {
              e.target.src = BuildDummy;
            }}
          />
        }
        actions={[
          <Button
            key="remove"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          >
            Remove
          </Button>,
        ]}
      >
        <Card.Meta
          title={
            component.title || component.product_name || "Unknown Component"
          }
          description={
            <div>
              <p>
                <strong>Specifications:</strong>
              </p>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {component.specifications ? (
                  Object.entries(component.specifications).map(
                    ([key, value]) => (
                      <div key={key} style={{ marginBottom: "4px" }}>
                        <strong>{key}:</strong> {value}
                      </div>
                    )
                  )
                ) : (
                  <p>No specifications available</p>
                )}
              </div>
              {component.price && (
                <p
                  style={{
                    marginTop: "8px",
                    fontWeight: "bold",
                    color: "#1890ff",
                  }}
                >
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
        <div style={{ textAlign: "center", padding: "50px", color: "#888" }}>
          <p>No saved components found</p>
        </div>
      );
    }

    let componentsToShow = [];
    if (activeCategory === "all") {
      const seenIds = new Set(); // Track unique component IDs
      Object.keys(savedComponents).forEach((category) => {
        if (Array.isArray(savedComponents[category])) {
          savedComponents[category].forEach((comp) => {
            if (!seenIds.has(comp._id)) {
              // Only add if not already seen
              seenIds.add(comp._id);
              componentsToShow.push({ ...comp, category });
            }
          });
        }
      });
    } else {
      // Show components from specific category
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
        <div style={{ textAlign: "center", padding: "50px", color: "#888" }}>
          <p>No components found in this category</p>
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-start",
        }}
      >
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
      <div
        style={{ display: "flex", justifyContent: "center", padding: "50px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="saved-components-tab">
      <Tabs
        centered
        activeKey={activeCategory}
        onChange={setActiveCategory}
        items={COMPONENT_CATEGORIES.map((category) => ({
          label: category.label,
          key: category.key,
          children: renderComponents(),
        }))}
      />
    </div>
  );
}

export default SavedComponentsTab;
