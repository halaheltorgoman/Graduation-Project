import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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

// Avatar Component - Enhanced version from PostCard
const AvatarComponent = ({ creator, size = "default" }) => {
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(true);

  // Enhanced avatar handling with better debugging
  const getUserAvatar = useCallback(() => {
    console.log("Creator data for avatar:", {
      creator: creator,
      creatorAvatar: creator?.avatar,
      avatarType: typeof creator?.avatar,
    });

    // Check if creator exists
    if (!creator) {
      console.log("No creator object found");
      return null;
    }

    // Primary source: creator.avatar
    let avatar = creator.avatar;

    // Handle different avatar formats
    if (avatar) {
      // If avatar is an object with url property (Cloudinary format)
      if (typeof avatar === "object" && avatar.url) {
        console.log("Using avatar.url:", avatar.url);
        return avatar.url;
      }

      // If avatar is already a string URL
      if (typeof avatar === "string" && avatar.trim() !== "") {
        console.log("Using avatar string:", avatar);
        return avatar;
      }
    }

    // Fallback sources
    const fallbackSources = [
      creator.profilePicture,
      creator.image,
      creator.profile?.avatar,
    ];

    for (let source of fallbackSources) {
      if (source) {
        if (typeof source === "object" && source.url) {
          console.log("Using fallback object avatar:", source.url);
          return source.url;
        }
        if (typeof source === "string" && source.trim() !== "") {
          console.log("Using fallback string avatar:", source);
          return source;
        }
      }
    }

    console.log("No avatar found for creator:", creator?.username);
    return null;
  }, [creator]);

  const handleAvatarError = (e) => {
    console.error("Avatar failed to load:", e.target.src);
    setAvatarError(true);
    setAvatarLoading(false);
  };

  const handleAvatarLoad = () => {
    console.log("Avatar loaded successfully");
    setAvatarError(false);
    setAvatarLoading(false);
  };

  const userAvatar = getUserAvatar();
  const avatarClass =
    size === "large" ? "guide_user_avatar_large" : "guide_user_avatar";

  if (userAvatar && !avatarError) {
    return (
      <div className={`${avatarClass}_container`}>
        {avatarLoading && (
          <div className={`${avatarClass}_loading`}>
            <Spin size="small" />
          </div>
        )}
        <img
          src={userAvatar}
          alt={`${creator?.username || "User"}'s avatar`}
          className={avatarClass}
          onError={handleAvatarError}
          onLoad={handleAvatarLoad}
          style={{ display: avatarLoading ? "none" : "block" }}
        />
      </div>
    );
  }

  return (
    <div className={`${avatarClass}_placeholder`}>
      <UserOutlined className={`${avatarClass}_icon`} />
    </div>
  );
};

function Guides() {
  const { category = "Development" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
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
  const guideRefs = useRef({});

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

  // Handle scroll to specific guide
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const guideId =
      searchParams.get("guideId") || location.state?.scrollToGuide;

    if (guideId && guides.length > 0) {
      const timer = setTimeout(() => {
        const guideElement = guideRefs.current[guideId];
        if (guideElement) {
          guideElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Highlight the guide temporarily
          guideElement.style.boxShadow = "0 0 0 3px rgba(98, 28, 116, 0.5)";
          setTimeout(() => {
            guideElement.style.boxShadow = "none";
          }, 2000);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [guides, location]);

  const handleCarouselClick = useCallback((guide) => {
    setSelectedGuide(guide);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedGuide(null);
  }, []);

  const fetchGuides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Normalize category to match backend expectations
      const normalizedCategory =
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      const url = `http://localhost:4000/api/guides/${normalizedCategory}`;

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

      if (response.data && response.data.success) {
        const guidesArray = response.data.guides || [];

        if (page === 1) {
          setGuides(guidesArray);
        } else {
          setGuides((prev) => [...prev, ...guidesArray]);
        }

        setHasMore(response.data.hasMore || false);

        // FIXED: More robust user ratings extraction
        const ratingsMap = {};
        guidesArray.forEach((guide) => {
          console.log(`Processing guide ${guide._id} for ratings:`, {
            title: guide.title,
            userRating: guide.userRating,
            userRatingType: typeof guide.userRating,
            userRatingValid:
              guide.userRating !== undefined &&
              guide.userRating !== null &&
              !isNaN(guide.userRating) &&
              guide.userRating > 0,
          });

          // FIXED: Store the userRating directly from backend response
          if (
            guide.userRating !== undefined &&
            guide.userRating !== null &&
            !isNaN(guide.userRating) &&
            guide.userRating > 0
          ) {
            ratingsMap[guide._id] = Number(guide.userRating);
            console.log(
              `Stored rating for guide ${guide._id}: ${guide.userRating}`
            );
          }
        });

        console.log("Final user ratings map:", ratingsMap);

        // FIXED: Update user ratings state properly
        if (page === 1) {
          // For first page, completely replace ratings
          setUserRatings(ratingsMap);
          console.log("Set initial user ratings:", ratingsMap);
        } else {
          // For subsequent pages, merge with existing ratings
          setUserRatings((prev) => {
            const merged = { ...prev, ...ratingsMap };
            console.log("Merged user ratings:", merged);
            return merged;
          });
        }
      } else {
        throw new Error(response.data?.message || "Failed to fetch guides");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      if (page === 1) {
        setGuides([]);
      }
      setHasMore(false);

      notification.error({
        message: "Failed to load guides",
        description: `${err.message}`,
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, filters, page]);

  // FIXED: Simplified and more reliable getUserRating function
  const getUserRating = useCallback(
    (guide) => {
      console.log(`Getting user rating for guide ${guide._id}:`, {
        fromState: userRatings[guide._id],
        fromGuideData: guide.userRating,
        stateType: typeof userRatings[guide._id],
        guideType: typeof guide.userRating,
      });

      // Priority 1: Check userRatings state (most up-to-date after user interactions)
      const stateRating = userRatings[guide._id];
      if (
        stateRating !== undefined &&
        stateRating !== null &&
        stateRating > 0
      ) {
        console.log(`Using rating from state: ${stateRating}`);
        return Number(stateRating);
      }

      // Priority 2: Check guide.userRating (from backend, persisted rating)
      const guideRating = guide.userRating;
      if (
        guideRating !== undefined &&
        guideRating !== null &&
        guideRating > 0
      ) {
        console.log(`Using rating from guide data: ${guideRating}`);
        // FIXED: Also update the state to keep it in sync
        setUserRatings((prev) => ({
          ...prev,
          [guide._id]: Number(guideRating),
        }));
        return Number(guideRating);
      }

      console.log("No rating found, returning 0");
      return 0;
    },
    [userRatings]
  );

  // FIXED: Enhanced handleRateGuide with better state management
  const handleRateGuide = useCallback(
    async (guideId, rating) => {
      try {
        if (rating < 0.5 || rating > 5 || (rating * 2) % 1 !== 0) {
          notification.error({
            message: "Invalid rating",
            description: "Rating must be between 0.5 and 5 in 0.5 increments",
            duration: 3,
          });
          return;
        }

        console.log(`Rating guide ${guideId} with ${rating} stars`);

        // FIXED: Optimistically update the rating immediately
        setUserRatings((prev) => {
          const updated = {
            ...prev,
            [guideId]: rating,
          };
          console.log("Optimistically updated ratings:", updated);
          return updated;
        });

        const response = await axios.post(
          `http://localhost:4000/api/guides/${guideId}/rate`,
          { value: rating },
          {
            withCredentials: true,
            timeout: 5000,
          }
        );

        if (response.data && response.data.success) {
          console.log("Rating response:", response.data);

          // FIXED: Update both userRatings state and guides data with server response
          const serverRating = response.data.userRating || rating;

          setUserRatings((prev) => {
            const updated = {
              ...prev,
              [guideId]: serverRating,
            };
            console.log("Updated ratings after server response:", updated);
            return updated;
          });

          // FIXED: Update the guides array to include the new userRating
          setGuides((prevGuides) =>
            prevGuides.map((guide) =>
              guide._id === guideId
                ? {
                    ...guide,
                    averageRating: response.data.averageRating,
                    totalRatings: response.data.totalRatings,
                    ratings: response.data.ratings,
                    userRating: serverRating, // FIXED: Update userRating in guide object
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

        // FIXED: Revert optimistic update on error
        setUserRatings((prev) => {
          const reverted = { ...prev };
          // Find the original rating or remove if it was new
          const originalGuide = guides.find((g) => g._id === guideId);
          if (originalGuide && originalGuide.userRating) {
            reverted[guideId] = originalGuide.userRating;
          } else {
            delete reverted[guideId];
          }
          console.log("Reverted ratings after error:", reverted);
          return reverted;
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
    },
    [guides]
  );

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

  useEffect(() => {
    setPage(1);
    setGuides([]);
    setError(null);
    setLoading(true);
    setHasMore(true);
    // FIXED: Reset user ratings when changing category to avoid confusion
    setUserRatings({});
  }, [category]);

  useEffect(() => {
    setPage(1);
    setGuides([]);
    setError(null);
    setHasMore(true);
    // Don't reset ratings when just changing filters/sort
  }, [sortBy, JSON.stringify(filters)]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  useEffect(() => {
    fetchSavedGuides();
  }, [fetchSavedGuides]);

  // FIXED: Debug effect to monitor userRatings state changes
  useEffect(() => {
    console.log("User ratings state updated:", userRatings);
  }, [userRatings]);

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
        setSavedGuides((prev) => {
          if (prev.includes(guideId)) {
            return prev.filter((id) => id !== guideId);
          } else {
            return [...prev, guideId];
          }
        });

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

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((sortValue) => {
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
            {guides.map((guide) => {
              const currentUserRating = getUserRating(guide);
              console.log(
                `Rendering guide ${guide._id} with rating: ${currentUserRating}`
              );

              return (
                <div
                  key={guide._id}
                  className="guide_card"
                  ref={(el) => (guideRefs.current[guide._id] = el)}
                >
                  <div className="guide_header">
                    <div className="guide_user_info">
                      <AvatarComponent creator={guide.creator} />
                      <div className="guide_user_details">
                        <p className="guide_user_name">
                          {guide.creator?.username || "Unknown User"}
                        </p>
                        <p className="guide_user_username">
                          @
                          {guide.creator?.username?.toLowerCase() ||
                            "anonymous"}
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

                  <div className="guide_content">
                    <div className="guide_left">
                      <GuidesCarousel
                        guide={guide}
                        categoryImages={categoryImages}
                        onClick={() => handleCarouselClick(guide)}
                      />
                    </div>

                    <div className="guide_right">
                      <h3 className="guide_title">{guide.title}</h3>

                      <div className="guide_description_section">
                        <p className="guide_desc">
                          {guide.description || "No description provided"}
                        </p>
                      </div>

                      <div className="guide_meta">
                        <div className="guide_category_section">
                          <span className="guide_category_label">
                            Category:
                          </span>
                          <span className="guide_category_value">
                            {guide.category || "Not specified"}
                          </span>
                        </div>

                        <div className="guide_rating_section">
                          <div className="guide_rating_container">
                            <div className="guide_average_rating"></div>

                            <div className="user_rating_section">
                              <span className="user_rating_label">
                                Rate this guide:
                              </span>
                              <Rate
                                allowHalf
                                value={currentUserRating}
                                onChange={(value) =>
                                  handleRateGuide(guide._id, value)
                                }
                                className="post_rate_stars"
                              />
                              {currentUserRating > 0 && (
                                <span className="user_rating_value">
                                  Your rating: {currentUserRating}/5
                                </span>
                              )}
                            </div>
                            <span className="guide_rating_text">
                              (
                              {guide.totalRatings || guide.ratings?.length || 0}{" "}
                              reviews)
                            </span>
                          </div>
                        </div>

                        <div className="guide_price_section">
                          <span className="guide_price_label">
                            Total Price:
                          </span>
                          <span className="guide_price_value">
                            EGP {calculateTotalPrice(guide).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
            userRating={getUserRating(selectedGuide)}
            isSaved={savedGuides.includes(selectedGuide._id)}
          />
        )}
      </div>
    </div>
  );
}

export default Guides;
