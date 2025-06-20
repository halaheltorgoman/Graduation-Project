import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import ProfileBuildCard from "./ProfileBuildCard";
import TabContent from "./ProfileTabContent";
import { Spin, message } from "antd";
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
        message.error("Failed to fetch builds");
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedBuilds();
  }, [user]);

  const handleDeleteBuild = async (buildId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:4000/api/build/${buildId}`,
        { withCredentials: true }
      );

      if (data.success) {
        // Remove the build from local state
        setFolders((prevFolders) =>
          prevFolders.map((folder) => ({
            ...folder,
            profileBuilds: folder.profileBuilds.filter(
              (build) => build._id !== buildId && build.id !== buildId
            ),
          }))
        );
        message.success("Build deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting build:", err);
      message.error(err.response?.data?.message || "Failed to delete build");
    }
  };

  const handleSaveChanges = async (buildId, changes) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/build/createbuild/${buildId}/finalize`,
        changes,
        { withCredentials: true }
      );

      if (data.success) {
        // Update the build in local state
        setFolders((prevFolders) =>
          prevFolders.map((folder) => ({
            ...folder,
            profileBuilds: folder.profileBuilds.map((build) =>
              build._id === buildId || build.id === buildId
                ? { ...build, ...changes }
                : build
            ),
          }))
        );
        message.success("Build updated successfully");
      }
    } catch (err) {
      console.error("Error updating build:", err);
      message.error(err.response?.data?.message || "Failed to update build");
    }
  };

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
      handleDeleteBuild={handleDeleteBuild}
      handleSaveChanges={handleSaveChanges}
      loading={loading}
    />
  );
}

export default CompletedBuildsTab;
