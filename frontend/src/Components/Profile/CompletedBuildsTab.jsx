import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import ProfileBuildCard from "./ProfileBuildCard";
import TabContent from "./ProfileTabContent";
import { Spin } from "antd";
import axios from "axios";

function CompletedBuildsTab() {
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
            name: "Completed Builds",
            profileBuilds: (data.builds || []).map((build) => ({
              ...build,
              image_source:
                build.components?.cpu?.image_source ||
                build.components?.gpu?.image_source ||
                build.components?.motherboard?.image_source ||
                build.components?.case?.image_source ||
                build.components?.memory?.image_source ||
                build.components?.storage?.image_source ||
                build.components?.psu?.image_source ||
                build.components?.cooler?.image_source ||
                null,
            })),
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

  return (
    <TabContent
      tabKey="1"
      folders={{ 1: folders }}
      setFolders={(newFolders) => setFolders(newFolders[1])}
      handleDeleteFolder={handleDeleteFolder}
      handleSaveFolder={handleSaveFolder}
      loading={loading}
    />
  );
}

export default CompletedBuildsTab;
