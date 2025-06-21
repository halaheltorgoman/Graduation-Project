// Profile.js (updated with better navigation handling)
import React, { useState, useEffect, useContext } from "react";
import { Tabs, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { SavedComponentsContext } from "../../Context/SavedComponentContext";
import CompletedBuildsTab from "./CompletedBuildsTab";
import SavedPostsTab from "./SavedPostsTab";
import SavedComponentsTab from "./SavedComponentsTab";
import SavedGuidesTab from "./SavedGuidesTab";
import EditProfilePopUp from "./EditProfilePopUp";
import { useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const [activeTab, setActiveTab] = useState("1");
  const [openEditProfilePopUp, setOpenEditProfilePopUp] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [userBio, setUserBio] = useState("Available");
  const [userName, setUserName] = useState("User Name");
  const [loadingBuilds, setLoadingBuilds] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const { savedComponents } = useContext(SavedComponentsContext);

  const handleTabChange = (key) => {
    setActiveTab(key);
    const tabPaths = {
      1: "builds",
      2: "saved-posts",
      3: "saved-components",
      4: "saved-guides",
    };
    navigate(`?tab=${tabPaths[key]}`, { replace: true });
  };

  // Handle navigation from other components
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");

    const tabKeys = {
      builds: "1",
      "saved-posts": "2",
      "saved-components": "3",
      "saved-guides": "4",
    };

    if (tabParam && tabKeys[tabParam]) {
      setActiveTab(tabKeys[tabParam]);
    }

    // Handle state messages from navigation
    if (location.state?.message) {
      message.success(location.state.message, 4);

      // Set active tab from state if provided
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }

      // Clear the state to prevent message from showing again on refresh
      navigate(location.pathname + location.search, {
        replace: true,
        state: {
          ...location.state,
          message: undefined, // Clear the message
        },
      });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user || !user.username) {
          console.log("User or username is undefined");
          return;
        }

        const { data } = await axios.get(
          `http://localhost:4000/api/users/${user.username}`,
          {
            withCredentials: true,
          }
        );

        if (data.success && data.profile) {
          console.log("User profile data:", data.profile);
          const { username, bio, avatar } = data.profile;

          setUserName(username || "User Name");
          setUserBio(bio || "Available");
          setImageUrl(avatar || "");
        } else {
          console.error("Invalid profile data structure:", data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  return (
    <div className="profile_main">
      <div className="profile_primary">
        <div className="profile_image">
          {imageUrl ? (
            <img src={imageUrl} size={100} alt="Profile" />
          ) : (
            <UserOutlined className="default-avatar-icon" />
          )}
        </div>
        <div className="profile_userDetails">
          <div className="profie_user_info">
            <p className="profile_username">{userName}</p>
          </div>
        </div>

        <div className="profile_editbtn">
          <button onClick={() => setOpenEditProfilePopUp(true)}>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="profile_secondary">
        <Tabs
          centered
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              label: "Completed Builds",
              key: "1",
              children: (
                <CompletedBuildsTab
                  loading={loadingBuilds}
                  highlightBuild={location.state?.highlightBuild}
                  fromGuideCustomization={
                    location.state?.fromGuideCustomization
                  }
                />
              ),
            },
            {
              label: "Saved Posts",
              key: "2",
              children: <SavedPostsTab />,
            },
            {
              label: "Saved Components",
              key: "3",
              children: (
                <SavedComponentsTab savedComponents={savedComponents} />
              ),
            },
            {
              label: "Saved Guides",
              key: "4",
              children: <SavedGuidesTab />,
            },
          ]}
        />
      </div>

      {openEditProfilePopUp && (
        <EditProfilePopUp
          setOpenEditProfilePopUp={setOpenEditProfilePopUp}
          setImageUrl={setImageUrl}
          imageUrl={imageUrl}
          setUserBio={setUserBio}
          userBio={userBio}
          setUserName={setUserName}
          userName={userName}
        />
      )}
    </div>
  );
}

export default Profile;
