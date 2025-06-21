import React, { useState, useEffect, useContext } from "react";
import { Spin, Empty, Collapse } from "antd";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import SavedGuideCard from "./SavedGuideCard";

const SavedGuidesTab = () => {
  const [savedGuides, setSavedGuides] = useState([]);
  const [categorizedFolders, setCategorizedFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  // Define the 4 predefined folders
  const PREDEFINED_FOLDERS = [
    { name: "Gaming", key: "gaming" },
    { name: "Development", key: "development" },
    { name: "Workstation", key: "workstation" },
    { name: "Budget", key: "budget" },
  ];

  useEffect(() => {
    const fetchSavedGuides = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:4000/api/guides/saved",
          {
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setSavedGuides(response.data.guides);
          organizeGuidesByCategory(response.data.guides);
        }
      } catch (error) {
        console.error("Error fetching saved guides:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSavedGuides();
    }
  }, [user]);

  const organizeGuidesByCategory = (guides) => {
    // Create folders structure with predefined categories
    const folders = PREDEFINED_FOLDERS.map((folder) => {
      // Filter guides that belong to this category
      const categoryGuides = guides.filter((guide) => {
        const guideCategory = guide.category?.toLowerCase() || "";
        return guideCategory === folder.key.toLowerCase();
      });

      return {
        name: folder.name,
        key: folder.key,
        guides: categoryGuides,
        count: categoryGuides.length,
      };
    });

    setCategorizedFolders(folders);
  };

  // Initialize folders on component mount, even before guides are loaded
  useEffect(() => {
    // Set up default empty folders immediately
    const defaultFolders = PREDEFINED_FOLDERS.map((folder) => ({
      name: folder.name,
      key: folder.key,
      guides: [],
      count: 0,
    }));
    setCategorizedFolders(defaultFolders);
  }, []);

  const handleUnsaveGuide = (guideId) => {
    // Update saved guides by removing the unsaved guide
    const updatedGuides = savedGuides.filter((guide) => guide._id !== guideId);
    setSavedGuides(updatedGuides);

    // Re-organize folders with updated guides
    // This will maintain all 4 folders but update their guide contents
    organizeGuidesByCategory(updatedGuides);
  };

  if (loading) {
    return (
      <div className="saved-guides-container">
        <div className="profile_folders">
          <Collapse
            ghost
            items={categorizedFolders.map((folder, folderIndex) => ({
              key: folderIndex.toString(),
              label: (
                <div className="folder-label">
                  <span className="folder-name">{folder.name}</span>
                  <span className="folder-count">(0)</span>
                </div>
              ),
              children: (
                <div className="profile_folderContent saved-guides-folder-content">
                  <div className="loading-folder-content">
                    <Spin size="small" />
                    <span style={{ marginLeft: "8px" }}>Loading guides...</span>
                  </div>
                </div>
              ),
            }))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="saved-guides-container">
      <div className="profile_folders">
        <Collapse
          ghost
          items={categorizedFolders.map((folder, folderIndex) => ({
            key: folderIndex.toString(),
            label: (
              <div className="folder-label">
                <span className="folder-name">{folder.name}</span>
              </div>
            ),
            children: (
              <div className="profile_folderContent saved-guides-folder-content">
                {folder.guides.length > 0 ? (
                  folder.guides.map((guide) => (
                    <SavedGuideCard
                      key={guide._id}
                      guide={guide}
                      onUnsaveGuide={handleUnsaveGuide}
                    />
                  ))
                ) : (
                  <div className="empty-folder-message">
                    <p>No {folder.name} guides in this folder</p>
                  </div>
                )}
              </div>
            ),
          }))}
        />
      </div>
    </div>
  );
};

export default SavedGuidesTab;
