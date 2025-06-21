import React from "react";
import { Collapse } from "antd";
import { MdAddCircle } from "react-icons/md";
import ProfileBuildCard from "./ProfileBuildCard";

const TabContent = ({
  handleDeleteFolder,
  setOpenPopUp,
  tabKey,
  folders,
  setFolders,
  loading,
  onUnsavePost, // for tab 2
  onDeleteBuild, // for tab 1 (delete build)
  onSaveChanges, // for tab 1 (save changes)
  // ...other props
}) => {
  const handleBuildDelete = (folderIndex, buildId) => {
    if (tabKey === "2" && onUnsavePost) {
      // For saved posts tab
      onUnsavePost(folderIndex, buildId);
    } else if (tabKey === "1" && onDeleteBuild) {
      // For completed builds tab - call the actual delete function
      onDeleteBuild(buildId);
    } else {
      // Fallback for other tabs - just remove from local state
      setFolders((prevFolders) => {
        const updatedFolders = { ...prevFolders };
        const builds =
          updatedFolders[tabKey]?.[folderIndex]?.profileBuilds || [];
        updatedFolders[tabKey][folderIndex].profileBuilds = builds.filter(
          (build) => (build._id || build.id) !== buildId
        );
        return updatedFolders;
      });
    }
  };

  return (
    <div className="profile_folders">
      <div className="profile_newFolder"></div>
      <Collapse
        ghost
        items={
          folders[tabKey]?.map((folder, folderIndex) => ({
            key: folderIndex.toString(),
            label: folder.name,
            children: (
              <div className="profile_folderContent">
                {loading ? (
                  <p>Loading...</p>
                ) : folder.profileBuilds.length > 0 ? (
                  folder.profileBuilds.map((profileBuild) => (
                    <ProfileBuildCard
                      key={profileBuild._id || profileBuild.id}
                      build={profileBuild}
                      onDeleteBuild={() =>
                        handleBuildDelete(
                          folderIndex,
                          profileBuild._id || profileBuild.id
                        )
                      }
                      onSaveChanges={onSaveChanges} // Pass save changes handler
                      isPost={profileBuild.isPost}
                    />
                  ))
                ) : (
                  <p>No {tabKey === "2" ? "posts" : "builds"} in this folder</p>
                )}
                {/* <button
                  className="profile_deleteFolderBtn"
                  onClick={() => handleDeleteFolder(folderIndex)}
                >
                  Delete Folder
                </button> */}
              </div>
            ),
          })) || []
        }
      />
    </div>
  );
};

export default TabContent;
