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
        console.log("Raw saved posts data:", savedPosts);

        setFolders([
          {
            name: "Saved Posts",
            profileBuilds: (savedPosts || []).map((post) => {
              console.log("Processing post:", post._id, {
                user: post.user,
                comments: post.comments?.length || 0,
              });

              return {
                _id: post._id,
                id: post._id,
                title:
                  post.text?.substring(0, 30) +
                    (post.text?.length > 30 ? "..." : "") || "Untitled Post",
                content: post.text || "",
                text: post.text || "", // Keep original text field
                image_source: post.images?.[0]?.url
                  ? { url: post.images[0].url }
                  : null,
                isPost: true,
                createdAt: post.createdAt,
                // Ensure user data is properly structured
                user: {
                  _id: post.user?._id,
                  username: post.user?.username || "Unknown",
                  avatar: post.user?.avatar || null,
                },
                author: post.user?.username || "Unknown",
                build: post.build || null,
                // Ensure components are properly structured if build exists
                components: post.build?.components || null,
                ratings: post.ratings || [],
                // Ensure comments have proper author structure
                comments: (post.comments || []).map((comment) => ({
                  _id: comment._id,
                  id: comment._id,
                  text: comment.text,
                  createdAt: comment.createdAt,
                  // Ensure author field exists (this is what SavedPostCard expects)
                  author: {
                    _id: comment.user?._id || comment.author?._id,
                    username:
                      comment.user?.username ||
                      comment.author?.username ||
                      "Anonymous",
                    avatar:
                      comment.user?.avatar || comment.author?.avatar || null,
                  },
                  // Keep user field as well for compatibility
                  user: comment.user || comment.author,
                })),
                savesCount: post.savesCount || 0,
                averageRating: post.averageRating || 0,
                likesCount: post.likesCount || 0,
              };
            }),
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
