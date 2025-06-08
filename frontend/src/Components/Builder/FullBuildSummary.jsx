import React, { useEffect, useState } from "react";
import { Button, Modal, Input, message } from "antd";
import logo from "../../assets/images/logo.svg";
import axios from "axios";
import { FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./FullBuildSummary.css";

const FullBuildSummary = ({ fullBuild, loading }) => {
  const [totalPrice, setTotalPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const navigate = useNavigate();

  // For Complete Build popup
  const [showModal, setShowModal] = useState(false);
  const [buildTitle, setBuildTitle] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Get buildId from fullBuild object
  const buildId = fullBuild?._id;

  useEffect(() => {
    const fetchTotalPrice = async () => {
      if (!buildId) return;
      setPriceLoading(true);
      try {
        const { data } = await axios.get(
          `http://localhost:4000/api/build/${buildId}/price`,
          { withCredentials: true }
        );
        setTotalPrice(data.totalPrice);
      } catch (err) {
        setTotalPrice(null);
      } finally {
        setPriceLoading(false);
      }
    };
    fetchTotalPrice();
  }, [buildId]);

  // Handle refresh button click - navigate to builder page for the component type
  const handleRefreshClick = (componentType) => {
    navigate(`/builder/${componentType}?fromBuild=${buildId}`);
  };

  // Handle Complete Build
  const handleCompleteBuild = async () => {
    setSaving(true);
    try {
      await axios.put(
        `http://localhost:4000/api/build/createbuild/${buildId}/finalize`,
        {
          title: buildTitle,
          description: buildDescription,
          shareToCommunity: false,
        },
        { withCredentials: true }
      );
      message.success("Build saved to Completed Builds!");
      setShowModal(false);
      setBuildTitle("");
      setBuildDescription("");
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to complete build.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fullbuild-loading">
        <span className="loader"></span>
      </div>
    );
  }
  if (!fullBuild) {
    return (
      <div className="fullbuild-empty">
        <div className="fullbuild-empty-message">
          Full build view coming soon!
        </div>
        <div className="fullbuild-share">
          <Button variant="link" className="fullbuild-share-btn">
            <img src={logo} alt="share" className="fullbuild-share-icon" />
            Share
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fullbuild-container">
      <h2 className="fullbuild-title">Your Build Summary</h2>
      <div className="fullbuild-table">
      <div className="fullbuild-row fullbuild-header">
  <div className="fullbuild-col type">Type</div>
  <div className="fullbuild-col image">Image</div>
  <div className="fullbuild-col name">Name</div>
  <div className="fullbuild-col brand">Brand</div>
  <div className="fullbuild-col price">Price</div>
  <div className="fullbuild-col refresh">
    <span className="refresh-text">Replace</span>
  </div>
</div>
        {Object.entries(fullBuild.components).map(([compType, comp]) => (
          <div className="fullbuild-row" key={compType}>
            <div className="fullbuild-col type">{compType.toUpperCase()}</div>
            <div className="fullbuild-col image">
              {comp?.image_source && (
                <img
                  src={comp.image_source}
                  alt={comp.title || comp.product_name}
                  className="fullbuild-img"
                />
              )}
            </div>
            <div className="fullbuild-col name">
              {comp?.title || comp?.product_name}
            </div>
            <div className="fullbuild-col brand">
              {comp?.manufacturer || comp?.brand}
            </div>
            <div className="fullbuild-col price_val">
              {comp?.price !== undefined
                ? `$${comp.price.toLocaleString()}`
                : "--"}
            </div>
            <div className="fullbuild-col refresh">
              <button 
                className="fullbuild-refresh-btn"
                onClick={() => handleRefreshClick(compType)}
                aria-label={`Replace ${compType}`}
              >
                <FiRefreshCw />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="fullbuild-total">
        <span>Total Price:</span>
        <span className="fullbuild-total-value">
          {priceLoading
            ? "Calculating..."
            : totalPrice !== null
            ? `$${totalPrice.toLocaleString()}`
            : "--"}
        </span>
      </div>
      <div className="fullbuild-actions">
        <Button
          type="primary"
          className="fullbuild-complete-btn"
          onClick={() => setShowModal(true)}
        >
          Complete Build
        </Button>
        <Button variant="link" className="fullbuild-share-btn">
          <img src={logo} alt="share" className="fullbuild-share-icon" />
          Share
        </Button>
      </div>
      <Modal
        title="Complete Build"
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={handleCompleteBuild}
        confirmLoading={saving}
        okText="Save"
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Build Title"
            value={buildTitle}
            onChange={(e) => setBuildTitle(e.target.value)}
            maxLength={100}
          />
        </div>
        <div>
          <Input.TextArea
            placeholder="Build Description"
            value={buildDescription}
            onChange={(e) => setBuildDescription(e.target.value)}
            rows={4}
            maxLength={500}
          />
        </div>
      </Modal>
    </div>
  );
};

export default FullBuildSummary;