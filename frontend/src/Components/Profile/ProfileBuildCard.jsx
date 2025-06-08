import React from "react";
import CompletedBuildCard from "./CompleteBuildCard";
import SavedPostCard from "./SavedPostCard";
import SavedComponentCard from "./SavedComponentCard";

function ProfileBuildCard({
  build,
  onDeleteBuild,
  onRefreshComponent,
  onSaveChanges,
  onUseComponent,
  type = "build", // "build", "post", or "component"
}) {
  // Determine the type if not explicitly provided
  const getCardType = () => {
    if (type !== "build") return type;
    if (build.isPost) return "post";
    if (build.type === "component" || build.category) return "component";
    return "build";
  };

  const cardType = getCardType();

  switch (cardType) {
    case "post":
      return (
        <SavedPostCard
          build={build}
          onDeleteBuild={onDeleteBuild}
          onRefreshComponent={onRefreshComponent}
        />
      );
    case "component":
      return (
        <SavedComponentCard
          component={build}
          onDeleteComponent={onDeleteBuild}
          onUseComponent={onUseComponent}
        />
      );
    case "build":
    default:
      return (
        <CompletedBuildCard
          build={build}
          onDeleteBuild={onDeleteBuild}
          onRefreshComponent={onRefreshComponent}
          onSaveChanges={onSaveChanges}
        />
      );
  }
}

export default ProfileBuildCard;
