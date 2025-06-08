import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../Context/UserContext";
import TabContent from "./ProfileTabContent";
import communityAPI from "../../services/community";
import { message } from "antd";

function SavedPostsTab() {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  const [folders, setFolders] = useState([
    {
      name: "Saved Posts",
      profileBuilds: [],
    },
  ]);

  useEffect(() => {
    const loadSavedPosts = async () => {
      if (!user?._id) return;

      setLoading(true);
      try {
        const savedPosts = await communityAPI.getSavedPosts();

        setFolders([
          {
            name: "Saved Posts",
            profileBuilds: (savedPosts || []).map((post) => ({
              _id: post._id,
              id: post._id,
              title:
                post.text?.substring(0, 30) +
                  (post.text?.length > 30 ? "..." : "") || "Untitled Post",
              content: post.text || "",
              image_source: post.images?.[0]?.url
                ? { url: post.images[0].url }
                : null,
              isPost: true,
              createdAt: post.createdAt,
              user: post.user || { username: "Unknown" },
              author: post.user?.username || "Unknown",
              build: post.build || null,
              ratings: post.ratings || [],
              comments: post.comments || [],
              savesCount: post.savesCount || 0,
              averageRating: post.averageRating || 0,
              likesCount: post.likesCount || 0,
            })),
          },
        ]);
      } catch (error) {
        console.error("Error loading saved posts:", error);
        message.error("Failed to load saved posts");
      } finally {
        setLoading(false);
      }
    };

    loadSavedPosts();
  }, [user?._id]);

  const handleUnsavePost = async (folderIndex, postId) => {
    try {
      await communityAPI.removeSavedPost(postId);
      setFolders((prevFolders) => {
        const updatedFolders = [...prevFolders];
        const builds = updatedFolders[folderIndex]?.profileBuilds || [];
        updatedFolders[folderIndex].profileBuilds = builds.filter(
          (build) => build.id !== postId && build._id !== postId
        );
        return updatedFolders;
      });
      message.success("Post removed from saved!");
    } catch (error) {
      message.error("Failed to unsave post.");
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
      tabKey="2"
      folders={{ 2: folders }}
      setFolders={(newFolders) => setFolders(newFolders[2])}
      handleDeleteFolder={handleDeleteFolder}
      handleSaveFolder={handleSaveFolder}
      loading={loading}
      onUnsavePost={handleUnsavePost}
    />
  );
}

export default SavedPostsTab;
