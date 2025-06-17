import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import ProfileBuildCard from "./ProfileBuildCard";
import TabContent from "./ProfileTabContent";
import { Spin } from "antd";
import axios from "axios";

function SavedBuildsTab() {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  const [folders, setFolders] = useState([
    {
      name: "Completed Builds",
      profileBuilds: [],
    },
  ]);

  useEffect(() => {
    const fetchCompletedBuilds = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/build/user/completed",
          { withCredentials: true }
        );

        setFolders([
          {
            name: "Saved Builds",
          },
        ]);
      } catch (err) {
        console.error("Error fetching builds:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedBuilds();
  }, [user]);

  const handleDeleteFolder = (folderIndex) => {
    setFolders(folders.filter((_, index) => index !== folderIndex));
  };

  const handleSaveFolder = (folderName) => {
    if (!folderName.trim()) return;
    setFolders([...folders, { name: folderName, profileBuilds: [] }]);
  };

  return <TabContent />;
}

export default SavedBuildsTab;
