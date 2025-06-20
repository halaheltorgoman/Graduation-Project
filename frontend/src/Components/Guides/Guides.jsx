import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import "./Guides.css";
import GuidesFilters from "../Filters/GuidesFilters";
import GuidesCarousel from "./GuideCarousel";
import { Spin, notification, Rate, Empty, Button } from "antd";
import GuidesNavbar from "./GuidesNavbar";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import GuidesModal from "./GuidesModal";

// Import category images from assets folder
import gamingImage from "../../assets/images/gamingguide.jpg";
import workstationImage from "../../assets/images/personalguide.jpg";
import budgetImage from "../../assets/images/workguide.jpg";
import developmentImage from "../../assets/images/devguide.webp";
import { FaStar } from "react-icons/fa";
function Guides() {
  const { category = "Development" } = useParams();
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({});
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [savedGuides, setSavedGuides] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [selectedGuide, setSelectedGuide] = useState(null);

  // Category image mapping
  const categoryImages = {
    Gaming: gamingImage,
    Workstation: workstationImage,
    Budget: budgetImage,
    Development: developmentImage,
    gaming: gamingImage,
    workstation: workstationImage,
    budget: budgetImage,
    development: developmentImage,
  };

  const handleCarouselClick = useCallback((guide) => {
    setSelectedGuide(guide);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedGuide(null);
  }, []);

  // FIXED: Fetch guides function with proper dependency management
  const fetchGuides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Normalize category to match backend expectations
      const normalizedCategory =
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      const url = `http://localhost:4000/api/guides/${normalizedCategory}`;

      console.log("=== FRONTEND DEBUG ===");
      console.log("Making request to:", url);
      console.log("Original category:", category);
      console.log("Normalized category:", normalizedCategory);
      console.log("Request params:", {
        category: normalizedCategory,
        sortBy,
        filters,
        page,
      });

      const response = await axios.get(url, {
        withCredentials: true,
        timeout: 10000,
        params: {
          page,
          limit: 10,
          sortBy,
          ...filters,
        },
      });

      console.log("Raw response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      if (response.data && response.data.success) {
        const guidesArray = response.data.guides || [];
        console.log("Setting guides:", guidesArray);

        // FIXED: Properly handle pagination
        if (page === 1) {
          setGuides(guidesArray);
        } else {
          setGuides((prev) => [...prev, ...guidesArray]);
        }

        setHasMore(response.data.hasMore || false);

        // Extract user ratings from guides data if available
        const ratingsMap = {};
        guidesArray.forEach((guide) => {
          if (guide.userRating !== undefined) {
            ratingsMap[guide._id] = guide.userRating;
          }
        });
        setUserRatings((prev) => ({ ...prev, ...ratingsMap }));
      } else {
        console.error("Response indicates failure:", response.data);
        throw new Error(response.data?.message || "Failed to fetch guides");
      }
    } catch (err) {
      console.error("=== FETCH ERROR ===");
      console.error("Error type:", err.constructor.name);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);

      setError(err.message);
      if (page === 1) {
        setGuides([]);
      }
      setHasMore(false);

      notification.error({
        message: "Failed to load guides",
        description: `${err.message} - Check console for details`,
        duration: 10,
      });
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, filters, page]); // FIXED: Removed JSON.stringify dependencies

  // Fetch saved guides with better error handling
  const fetchSavedGuides = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/guides/saved",
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      if (response.data && response.data.success) {
        setSavedGuides(response.data.guides?.map((g) => g._id) || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved guides:", err);
    }
  }, []);

  // FIXED: Reset state properly when category changes
  useEffect(() => {
    console.log("Category changed to:", category);
    setPage(1);
    setGuides([]);
    setError(null);
    setLoading(true);
    setHasMore(true);
    // Clear user ratings for new category
    setUserRatings({});
  }, [category]);

  // FIXED: Reset page when filters or sort change
  useEffect(() => {
    console.log("Filters or sort changed:", { sortBy, filters });
    setPage(1);
    setGuides([]);
    setError(null);
    setHasMore(true);
  }, [sortBy, JSON.stringify(filters)]); // Use JSON.stringify only for filters object

  // FIXED: Fetch guides when dependencies change
  useEffect(() => {
    console.log("Fetching guides due to dependency change:", {
      category,
      sortBy,
      filters,
      page,
    });
    fetchGuides();
  }, [fetchGuides]);

  // Fetch saved guides on mount
  useEffect(() => {
    fetchSavedGuides();
  }, [fetchSavedGuides]);

  // Handle rating a guide

  // Updated handleRateGuide function - Replace your existing handleRateGuide function with this:
  const handleRateGuide = useCallback(async (guideId, rating) => {
    try {
      console.log("Rating guide:", guideId, "with rating:", rating);

      // Validate rating (must be in 0.5 increments between 0.5 and 5)
      if (rating < 0.5 || rating > 5 || (rating * 2) % 1 !== 0) {
        notification.error({
          message: "Invalid rating",
          description: "Rating must be between 0.5 and 5 in 0.5 increments",
          duration: 3,
        });
        return;
      }

      // Immediately update the UI state for better UX
      setUserRatings((prev) => ({
        ...prev,
        [guideId]: rating,
      }));

      const response = await axios.post(
        `http://localhost:4000/api/guides/${guideId}/rate`,
        { value: rating },
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      console.log("Rating response:", response.data);

      if (response.data && response.data.success) {
        // Update user ratings state with server response
        setUserRatings((prev) => ({
          ...prev,
          [guideId]: response.data.userRating,
        }));

        // Update the guide in the guides list
        setGuides((prevGuides) =>
          prevGuides.map((guide) =>
            guide._id === guideId
              ? {
                  ...guide,
                  averageRating: response.data.averageRating,
                  totalRatings: response.data.totalRatings,
                  ratings: response.data.ratings,
                  userRating: response.data.userRating,
                }
              : guide
          )
        );

        notification.success({
          message: "Guide rated successfully",
          description: `You rated this guide ${rating} stars`,
          duration: 3,
        });
      }
    } catch (err) {
      console.error("Failed to rate guide:", err);

      // Revert the optimistic update on error
      setUserRatings((prev) => {
        const newRatings = { ...prev };
        delete newRatings[guideId];
        return newRatings;
      });

      let errorMessage = "Failed to rate guide";
      if (err.response?.status === 401) {
        errorMessage = "Please log in to rate guides";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      notification.error({
        message: errorMessage,
        duration: 4,
      });
    }
  }, []);

  // Handle toggle save
  const handleToggleSave = useCallback(async (guideId) => {
    try {
      const response = await axios.post(
        `http://localhost:4000/api/guides/${guideId}/save`,
        {},
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      if (response.data && response.data.success) {
        // Update saved guides state
        setSavedGuides((prev) => {
          if (prev.includes(guideId)) {
            return prev.filter((id) => id !== guideId);
          } else {
            return [...prev, guideId];
          }
        });

        // Update the guides list to reflect the new save count
        setGuides((prevGuides) =>
          prevGuides.map((guide) =>
            guide._id === guideId
              ? {
                  ...guide,
                  savesCount: response.data.savesCount,
                  isSaved: response.data.isSaved,
                }
              : guide
          )
        );

        notification.success({
          message: response.data.message || "Guide saved successfully",
          duration: 3,
        });
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);

      let errorMessage = "Failed to save guide";
      if (err.response?.status === 401) {
        errorMessage = "Please log in to save guides";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      notification.error({
        message: errorMessage,
        duration: 4,
      });
    }
  }, []);

  // FIXED: Properly memoize filter and sort handlers
  const handleFilterChange = useCallback((newFilters) => {
    console.log("Filter change:", newFilters);
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    console.log("Sort change:", sortValue);
    setSortBy(sortValue);
  }, []);

  const calculateTotalPrice = useCallback((guide) => {
    if (guide.totalPrice !== undefined) {
      return guide.totalPrice;
    }

    if (!guide.build?.components) return 0;
    return Object.values(guide.build.components).reduce((total, component) => {
      return total + (component?.price || 0);
    }, 0);
  }, []);

  // Show error state
  if (error && !loading) {
    return (
      <div className="guides_container">
        <div className="guides_filters">
          <GuidesFilters
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            initialFilters={filters}
            initialSort={sortBy}
          />
        </div>
        <div className="guides_main">
          <div className="browsecomponents_nav">
            <GuidesNavbar />
          </div>
          <div className="error-container">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <Button
              type="primary"
              onClick={() => {
                setError(null);
                setPage(1);
                fetchGuides();
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading && guides.length === 0) {
    return (
      <div className="guides_container">
        <div className="guides_filters">
          <GuidesFilters
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            initialFilters={filters}
            initialSort={sortBy}
          />
        </div>
        <div className="guides_main">
          <div className="browsecomponents_nav">
            <GuidesNavbar />
          </div>
          <div className="loading-container">
            <Spin size="large" />
            <p>Loading {category} guides...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guides_container">
      <div className="guides_filters">
        <GuidesFilters
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          initialFilters={filters}
          initialSort={sortBy}
        />
      </div>
      <div className="guides_main">
        <div className="browsecomponents_nav">
          <GuidesNavbar />
        </div>

        {guides.length === 0 && !loading ? (
          <div className="no-guides-message">
            <Empty
              description={`No ${category} guides found. Try adjusting your filters or check back later.`}
            />
          </div>
        ) : (
          <div className="guides-list">
            {guides.map((guide) => (
              <div key={guide._id} className="guide_card">
                {/* Guide Header - Similar to PostCard Header */}

                <div className="guide_header">
                  <div className="guide_user_info">
                    {guide.creator?.avatar ? (
                      <img
                        src={guide.creator.avatar}
                        alt="User avatar"
                        className="guide_user_avatar"
                      />
                    ) : (
                      <UserOutlined className="guide_user_avatar" />
                    )}
                    <div className="guide_user_details">
                      <p className="guide_user_name">
                        {guide.creator?.username || "Unknown User"}
                      </p>
                      <p className="guide_user_username">
                        @{guide.creator?.username?.toLowerCase() || "anonymous"}
                      </p>
                    </div>
                  </div>
                  <div className="guide_favorite">
                    <span
                      className="favorite-icon"
                      onClick={() => handleToggleSave(guide._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {savedGuides.includes(guide._id) ? (
                        <FaHeart className="favorited" />
                      ) : (
                        <FaRegHeart className="unfavorited" />
                      )}
                    </span>
                    <div className="guide_avgrating">
                      <FaStar className="rating-star" />
                      {guide.averageRating?.toFixed(1) || 0}
                    </div>
                  </div>
                </div>
                {/* Guide Content */}
                <div className="guide_content">
                  <div className="guide_left">
                    <GuidesCarousel
                      guide={guide}
                      categoryImages={categoryImages}
                      onClick={() => handleCarouselClick(guide)}
                    />
                  </div>

                  <div className="guide_right">
                    {/* Guide Title */}
                    <h3 className="guide_title">{guide.title}</h3>

                    {/* Guide Description */}
                    <div className="guide_description_section">
                      <p className="guide_desc">
                        {guide.description || "No description provided"}
                      </p>
                    </div>

                    {/* Guide Meta Information */}
                    <div className="guide_meta">
                      {/* Category Section */}
                      <div className="guide_category_section">
                        <span className="guide_category_label">Category:</span>
                        <span className="guide_category_value">
                          {guide.category || "Not specified"}
                        </span>
                      </div>

                      {/* Rating Section */}
                      <div className="guide_rating_section">
                        {/* Combined Rating Display and User Rating */}
                        <div className="guide_rating_container">
                          <div className="guide_average_rating"></div>

                          <div className="user_rating_section">
                            <span className="user_rating_label">
                              Rate this guide:
                            </span>
                            <Rate
                              allowHalf
                              value={userRatings[guide._id] || 0}
                              onChange={(value) =>
                                handleRateGuide(guide._id, value)
                              }
                              className="post_rate_stars"
                            />
                            {userRatings[guide._id] && (
                              <span className="user_rating_value">
                                Your rating: {userRatings[guide._id]}/5
                              </span>
                            )}
                          </div>
                          <span className="guide_rating_text">
                            ({guide.totalRatings || guide.ratings?.length || 0}{" "}
                            reviews)
                          </span>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="guide_price_section">
                        <span className="guide_price_label">Total Price:</span>
                        <span className="guide_price_value">
                          EGP {calculateTotalPrice(guide).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && guides.length > 0 && (
          <div className="loading-more">
            <Spin size="small" />
            <span>Loading more guides...</span>
          </div>
        )}
        {selectedGuide && (
          <GuidesModal
            guide={selectedGuide}
            onClose={handleCloseModal}
            onRateGuide={handleRateGuide}
            onToggleSave={handleToggleSave}
            userRating={userRatings[selectedGuide._id]}
            isSaved={savedGuides.includes(selectedGuide._id)}
          />
        )}
      </div>
    </div>
  );
}

export default Guides;
