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
          organizGuidesByCategory(response.data.guides);
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

  const organizGuidesByCategory = (guides) => {
    // Group guides by category
    const groupedByCategory = guides.reduce((acc, guide) => {
      const category = guide.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(guide);
      return acc;
    }, {});

    // Convert to folder structure
    const folders = Object.entries(groupedByCategory).map(
      ([category, guides]) => ({
        name: category,
        guides: guides,
        count: guides.length,
      })
    );

    // Sort folders by name
    folders.sort((a, b) => a.name.localeCompare(b.name));

    setCategorizedFolders(folders);
  };

  const handleUnsaveGuide = (guideId) => {
    setSavedGuides((prev) => {
      const updatedGuides = prev.filter((guide) => guide._id !== guideId);
      organizGuidesByCategory(updatedGuides);
      return updatedGuides;
    });
  };

  //   if (savedGuides.length === 0) {
  //     return (
  //       <div className="tab-empty-container">
  //         <Empty
  //           description="You haven't saved any guides yet"
  //           image={Empty.PRESENTED_IMAGE_SIMPLE}
  //         />
  //       </div>
  //     );
  //   }

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
                  <p>No guides in this category</p>
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
