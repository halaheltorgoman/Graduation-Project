import React, { useState, useEffect, useContext } from "react";
import { Tabs } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { SavedComponentsContext } from "../../Context/SavedComponentContext";
import CompletedBuildsTab from "./CompletedBuildsTab";
import SavedPostsTab from "./SavedPostsTab";
import SavedComponentsTab from "./SavedComponentsTab";
import EditProfilePopUp from "./EditProfilePopUp";
import "./Profile.css";
import SavedBuildsTab from "./SavedBuildsTab";

function Profile() {
  const [activeTab, setActiveTab] = useState("1");
  const [openEditProfilePopUp, setOpenEditProfilePopUp] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [userBio, setUserBio] = useState("Available");
  const [userName, setUserName] = useState("User Name");
  const [loadingBuilds, setLoadingBuilds] = useState(false);

  const { user } = useContext(UserContext);
  const { savedComponents } = useContext(SavedComponentsContext);

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
          onChange={setActiveTab}
          items={[
            {
              label: "Completed Builds",
              key: "1",
              children: <CompletedBuildsTab loading={loadingBuilds} />,
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
              label: "Saved Builds",
              key: "4",
              children: <SavedBuildsTab />,
            },
          ]}
        />
      </div>
    </div>
  );
}

export default Profile;
