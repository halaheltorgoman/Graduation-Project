import React from "react";
import { Collapse } from "antd";
import { MdAddCircle } from "react-icons/md";
import ProfileBuildCard from "./ProfileBuildCard";

const TabContent = ({
  tabKey,
  folders,
  setFolders,
  handleDeleteFolder,
  setOpenPopUp,
}) => {
  const onDeleteBuild = (folderIndex, buildId) => {
    console.log(
      "Deleting build with ID:",
      buildId,
      "from folder:",
      folderIndex
    );
    setFolders((prevFolders) => {
      const updatedFolders = { ...prevFolders };
      const builds = updatedFolders[tabKey]?.[folderIndex]?.profileBuilds || [];

      updatedFolders[tabKey][folderIndex].profileBuilds = builds.filter(
        (build) => build.id !== buildId
      );

      console.log("Updated folders after deleting build:", updatedFolders);
      return updatedFolders;
    });
  };

  return (
    <div className="profile_folders">
      <div className="profile_newFolder">
        <button onClick={() => setOpenPopUp(true)}>
          <MdAddCircle size={20} />
          <p>New Folder</p>
        </button>
      </div>
      <Collapse
        ghost
        items={
          folders[tabKey]?.map((folder, folderIndex) => ({
            key: folderIndex.toString(),
            label: folder.name,
            children: (
              <div className="profile_folderContent">
                {folder.profileBuilds.length > 0 ? (
                  folder.profileBuilds.map((profileBuild) => (
                    <ProfileBuildCard
                      key={profileBuild._id || profileBuild.id}
                      build={profileBuild}
                      onDeleteBuild={() =>
                        onDeleteBuild(
                          folderIndex,
                          profileBuild._id || profileBuild.id
                        )
                      }
                    />
                  ))
                ) : (
                  <p>No builds in this folder</p>
                )}
                <button
                  className="profile_deleteFolderBtn"
                  onClick={() => handleDeleteFolder(folderIndex)}
                >
                  Delete Folder
                </button>
              </div>
            ),
          })) || []
        }
      />
    </div>
  );
};

export default TabContent;
