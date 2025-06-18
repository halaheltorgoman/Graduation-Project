import React, { useState, useRef } from "react";
import { Button, Carousel } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  StarFilled,
  MessageOutlined,
  BookOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Home.css";

import bg1 from "../../assets/images/builder1.png";
import bg2 from "../../assets/images/builder2.png";
import bg3 from "../../assets/images/builder3.png";
import bg4 from "../../assets/images/builder4.png";

import cardImg1 from "../../assets/images/devpc.png";
import cardImg2 from "../../assets/images/gamingpc.png";
import cardImg3 from "../../assets/images/workpc.png";

import build1 from "../../assets/images/gamingguide.jpg";
import build2 from "../../assets/images/devguide.webp";
import build3 from "../../assets/images/workguide.jpg";
import build4 from "../../assets/images/personalguide.jpg";
import build5 from "../../assets/images/gamingguide2.jpg";

import userAvatar from "../../assets/images/user.png";
import postImage from "../../assets/images/post.png";
import userIcon from "../../assets/images/usericon.png";

import aiLogo from "../../assets/images/ailogo.png";

//CAROUSEL 1
const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const herocarouselItems = [
    {
      bgImage: bg1,
      title: "Builder",
      description:
        "Build your ideal PC using our Compatibility Builder.\n\nMeet your personal AI Assistant, get expert real-time recommendations for building the perfect PC, tailored to Your needs and budget!",
      buttonText: "Start Building",
      buttonColor: "#621C74",
      path: "/builder",
    },
    {
      bgImage: bg2,
      title: "Guides",
      description:
        "What are you using your PC for?\nHere are some guides to assist you through your build.\n\nMeet your personal AI Assistant, get expert real-time recommendations for building the perfect PC, tailored to Your needs and budget!",
      buttonText: "View Guides",
      buttonColor: "#589DCD",
      path: "/guides",
    },
    {
      bgImage: bg3,
      title: "Community",
      description:
        "Browse Pre-built PCs by passionate builder like you over our community, engage with people's builds and share reviews!",
      buttonText: "Join Community",
      buttonColor: "#1A4A78",
      path: "/community",
    },
    {
      bgImage: bg4,
      title: "Browse Components",
      description:
        "Search for your desired component with filtered search.\n\nMeet your personal AI Assistant, get expert real-time recommendations for building the perfect PC, tailored to Your needs and budget!",
      buttonText: "Browse Now",
      buttonColor: "#E19C8D",
      path: "/browsecomponents",
    },
  ];

  // Drag handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || e.touches[0].clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX || e.touches[0].clientX;
    setCurrentX(x - startX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(currentX) > 50) {
      if (currentX > 0) {
        setActiveIndex((prev) =>
          prev === 0 ? herocarouselItems.length - 1 : prev - 1
        );
      } else {
        setActiveIndex((prev) =>
          prev === herocarouselItems.length - 1 ? 0 : prev + 1
        );
      }
    }
    setCurrentX(0);
  };

  const handleButtonClick = (path) => {
    navigate(path);
  };

  // Style for carousel items
  const getItemStyle = (index) => {
    if (index === activeIndex) {
      return {
        transform: "translateX(-50%)",
        opacity: 1,
        zIndex: 10,
      };
    } else if (
      index === activeIndex + 1 ||
      (activeIndex === herocarouselItems.length - 1 && index === 0)
    ) {
      return {
        transform: `translateX(${180}px)`,
        opacity: 1,
        zIndex: 5,
      };
    } else {
      return {
        transform: `translateX(${index < activeIndex ? -100 : 100}px)`,
        opacity: 0,
        zIndex: 1,
      };
    }
  };

  return (
    <div
      className="hero-carousel"
      ref={carouselRef}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Background with dim overlay */}
      <div className="herobackground-container">
        <div className="herobackground-image">
          <img
            src={herocarouselItems[activeIndex].bgImage}
            alt="Hero"
            className="herobackground-img-tag"
            style={{
              transform: `translateX(${currentX * 0.2}px)`,
            }}
          />
        </div>
        <div className="herodim-overlay" />
      </div>

      {/* Content Panel */}
      <div className="herocontent-panel">
        <h1 className="herocarousel-title">
          {herocarouselItems[activeIndex].title}
        </h1>
        <p className="herocarousel-description">
          {herocarouselItems[activeIndex].description}
        </p>
        <Button
          className="herocarousel-button"
          style={{
            backgroundColor: herocarouselItems[activeIndex].buttonColor,
          }}
          onClick={() => handleButtonClick(herocarouselItems[activeIndex].path)}
        >
          {herocarouselItems[activeIndex].buttonText}
        </Button>
      </div>

      {/* Horizontal Carousel Items */}
      <div className="herocarousel-items-container">
        {herocarouselItems.map((item, index) => (
          <div
            key={index}
            className={`herocarousel-item ${
              index === activeIndex ? "active" : ""
            }`}
            onClick={() => setActiveIndex(index)}
            style={{
              ...getItemStyle(index),
              transition: "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            <img
              src={item.bgImage}
              alt={`Slide ${index + 1}`}
              className="heroitem-image"
            />
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="herocarousel-dots">
        {herocarouselItems.map((_, index) => (
          <div
            key={index}
            className={`herodot ${index === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

//EXPLORING PRE-BUILT GUIDES
const VerticalCardCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const prebuiltcardItems = [
    {
      image: cardImg1,
      title: "Development PC",
      description: "Tailored to suit programming needs",
      path: "/guides/development",
    },
    {
      image: cardImg2,
      title: "Gaming PC",
      description: "Tailored to suit gaming needs",
      path: "/guides/gaming",
    },
    {
      image: cardImg3,
      title: "Work PC",
      description: "Tailored to suit basic work needs",
      path: "/guides/work",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % prebuiltcardItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + prebuiltcardItems.length) % prebuiltcardItems.length
    );
  };

  const getCardStyle = (index) => {
    const position =
      (index - currentIndex + prebuiltcardItems.length) %
      prebuiltcardItems.length;

    if (position === 0) {
      // Center card
      return {
        transform: "translateX(0) scale(1)",
        opacity: 1,
        zIndex: 3,
        filter: "none",
        borderRadius: "24px",
      };
    } else if (position === 1) {
      // Right card
      return {
        transform: "translateX(40%) scale(0.85)",
        opacity: 0.7,
        zIndex: 1,
        filter: "blur(4px)",
        borderRadius: "20px",
      };
    } else {
      // Left card
      return {
        transform: "translateX(-40%) scale(0.85)",
        opacity: 0.7,
        zIndex: 1,
        filter: "blur(4px)",
        borderRadius: "20px",
      };
    }
  };

  return (
    <div className="vertical-carousel-container">
      <div className="prebuiltsection-header">
        <h2 className="prebuiltsection-title">Explore Pre-Built Guides</h2>
        <p className="prebuiltsection-subtitle">
          Personal Computers built to suit your needs
        </p>
      </div>

      <div className="prebuiltcarousel-wrapper">
        <button className="prebuiltcarousel-arrow left" onClick={prevSlide}>
          <LeftOutlined />
        </button>

        <div className="prebuiltcards-container">
          {prebuiltcardItems.map((item, index) => (
            <div
              key={index}
              className="prebuiltvertical-card"
              style={getCardStyle(index)}
              onClick={() => navigate(item.path)}
            >
              <div className="prebuiltcard-image-container">
                <img
                  src={item.image}
                  alt={item.title}
                  className="prebuiltcard-image"
                />
              </div>
              <div className="prebuiltcard-content">
                <h3 className="prebuiltcard-title">{item.title}</h3>
                <p className="prebuiltcard-description">{item.description}</p>
                <p className="prebuiltcard-specs">{item.specs}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="prebuiltcarousel-arrow right" onClick={nextSlide}>
          <RightOutlined />
        </button>
      </div>

      <div className="prebuiltcustom-dots">
        {prebuiltcardItems.map((_, i) => (
          <div
            key={i}
            className={`prebuiltdot ${i === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

//FEATURED BUILDS CAROUSEL
const FeaturedBuildsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const featuredBuilds = [
    {
      id: 1,
      image: build1,
      title: "Victory Vault",
      rating: 4.9,
      specs:
        "Power, precision, and play, welcome to the ultimate gaming setup.",
      path: "/guides/victory-vault",
    },
    {
      id: 2,
      image: build2,
      title: "Compile Corner",
      rating: 4.8,
      specs:
        "Crafting code and building dreams, the ultimate development workstation.",
      path: "/guides/compile-corner",
    },
    {
      id: 3,
      image: build3,
      title: "Efficieny Engine",
      rating: 4.7,
      specs:
        "Optimized for productivity and performance, the perfect workstation.",
      path: "/guides/efficiency-engine",
    },
    {
      id: 4,
      image: build4,
      title: "The Digital Den",
      rating: 4.6,
      specs:
        "Crafting code and building dreams, the ultimate development workstation.",
      path: "/guides/the-digital-den",
    },
    {
      id: 5,
      image: build5,
      title: "Ultra Game",
      rating: 4.9,
      specs:
        "Level up your experience, the ultimate gaming battleground awaits",
      path: "/guides/ultra-game",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredBuilds.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + featuredBuilds.length) % featuredBuilds.length
    );
  };

  const getVisibleCards = () => {
    const cards = [];
    const totalItems = featuredBuilds.length;

    //show 3 cards: previous, current, and next
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + totalItems) % totalItems;
      cards.push(featuredBuilds[index]);
    }

    return cards;
  };

  const getCardStyle = (position) => {
    const baseStyles = {
      transition: "all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)",
      transformOrigin: "center",
    };

    switch (position) {
      case 0: // Left card
        return {
          ...baseStyles,
          transform: "translateX(-30%) scale(0.9)",
          opacity: 0.8,
          zIndex: 2,
          filter: "brightness(0.85)",
        };
      case 1: // Center card
        return {
          ...baseStyles,
          transform: "translateX(0) scale(1.05)",
          opacity: 1,
          zIndex: 3,
          filter: "none",
        };
      case 2: // Right card
        return {
          ...baseStyles,
          transform: "translateX(30%) scale(0.9)",
          opacity: 0.8,
          zIndex: 2,
          filter: "brightness(0.85)",
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div className="featured-builds-container">
      <div className="featuredBuildssection-header">
        <h2 className="featuredBuildssection-title">Featured Builds</h2>
        <p className="featuredBuildssection-subtitle">
          Explore User builds with the highest rating
        </p>
      </div>

      <div className="featuredBuildscarousel-wrapper">
        <button
          className="featuredBuildscarousel-arrow left"
          onClick={prevSlide}
          aria-label="Previous build"
        >
          <LeftOutlined />
        </button>

        <div className="featured-builds-viewport">
          <div className="featured-builds-track">
            {getVisibleCards().map((guidebuild, position) => (
              <div
                key={guidebuild.id}
                className="featured-build-card"
                style={getCardStyle(position)}
              >
                <div className="featuredBuildsguidebuild-image-container">
                  <img
                    src={guidebuild.image}
                    alt={guidebuild.title}
                    className="featuredBuildsguidebuild-image"
                    loading="lazy"
                  />
                </div>
                <div className="featuredBuildsguidebuild-rating">
                  {guidebuild.rating}
                  <StarFilled style={{ color: "#FFD700" }} />
                </div>
                <div className="featuredBuildsguidebuild-content">
                  <h3 className="featuredBuildsguidebuild-title">
                    {guidebuild.title}
                  </h3>
                  <p className="featuredBuildsguidebuild-specs">
                    {guidebuild.specs}
                  </p>

                  <Button
                    className="featuredBuildsbuild-view-button"
                    type="primary"
                    style={{
                      backgroundColor: "#621C74",
                      borderColor: "#621C74",
                      fontWeight: 500,
                    }}
                    onClick={() => navigate(guidebuild.path)}
                  >
                    View Build Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="featuredBuildscarousel-arrow right"
          onClick={nextSlide}
          aria-label="Next build"
        >
          <RightOutlined />
        </button>
      </div>
    </div>
  );
};

//POST ON COMMUNITY
const CommunityPostSection = () => {
  const navigate = useNavigate();

  return (
    <div className="community-section">
      <div className="commsection-header">
        <h2 className="commsection-title">Post on Community</h2>
        <p className="commsection-subtitle">
          Explore other users' builds and share your own for mutual exchange of
          knowledge
        </p>
      </div>

      <div className="community-post-container">
        {/* Post Header */}
        <div className="commpost-header">
          <img src={userAvatar} alt="User" className="commuser-avatar" />
          <div className="commuser-info">
            <div className="commuser-name1">User</div>
            <div className="commuser-username1">@username</div>
          </div>
          <div className="commpost-time">2 hours ago</div>
        </div>

        {/* Post Content */}
        <div
          className="community-post-content"
          onClick={() => navigate("/community/post")}
        >
          <div className="commpost-image-container">
            <img
              src={postImage}
              alt="Gaming PC Build"
              className="commpost-image"
            />
          </div>
          <div className="commpost-details">
            <h3 className="commbuild-title">Build Name</h3>

            <p className="commbuild-content">"Description"</p>

            <div className="commbuild-meta">
              <img src={userIcon} alt="Builder" className="commuser-icon" />
              <span className="commuser-name">User</span>
              <div className="commbuild-rating">
                <span>5</span>
                <StarFilled style={{ color: "#FFD700" }} />
                <StarFilled style={{ color: "#FFD700" }} />
                <StarFilled style={{ color: "#FFD700" }} />
                <StarFilled style={{ color: "#FFD700" }} />
                <StarFilled style={{ color: "#FFD700" }} />
              </div>
            </div>

            <p className="commbuild-spec">Genre: XXXX</p>
            <p className="commbuild-spec">AVG Total Price: $$$$</p>
          </div>
        </div>

        {/* Post Footer */}
        <div className="commpost-footer">
          <div className="commpost-actions">
            <div className="commpost-action">
              <MessageOutlined className="commpost-action-icon" />
            </div>
            <div className="commpost-action">
              <BookOutlined className="commpost-action-icon" />
            </div>
            <div className="commpost-action">
              <ShareAltOutlined className="commpost-action-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//AI BUILDER SECTION
const AIBuilderSection = () => {
  const navigate = useNavigate();

  return (
    <div className="ai-builder-section">
      <div className="ai-builder-content">
        <h2 className="ai-section-title">Start Building Now!</h2>
        <p className="ai-section-subtitle">
          Build your perfect personal computer using our build engine <br />
          or even better yet use our AI Assistant, hurry up now!
        </p>
        <Button
          className="ai-builder-button"
          onClick={() => navigate("/builder")}
        >
          PC Builder
        </Button>
      </div>

      <div className="ai-assistant-panel">
        <img src={aiLogo} alt="AI Assistant" className="ai-logo" />
        <h3 className="ai-assistant-name">Techie</h3>
        <Button
          className="ai-try-button"
          onClick={() => navigate("/ai_assistant")}
        >
          Try Now
        </Button>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="home-page">
      <HeroCarousel />
      <VerticalCardCarousel />
      <FeaturedBuildsCarousel />
      <CommunityPostSection />
      <AIBuilderSection />
    </div>
  );
};

export default Home;
