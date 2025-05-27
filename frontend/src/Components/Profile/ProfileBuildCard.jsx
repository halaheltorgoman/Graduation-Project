import React, { useState } from "react";
import BuildDummy from "../../assets/images/build_dummy.svg";
import ProfileBuildDetails from "./ProfileBuildDetails";
import "./ProfileBuildCard.css";

function ProfileBuildCard({ build, onDeleteBuild }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState(build.title);

  const toggleDetails = () => setIsExpanded(!isExpanded);

  return (
    <div className="profile_buildCard">
      <div className="profile_buildCard_main">
        <div className="profile_buildCard_info">
          <img src={build.image_source || BuildDummy} width={120} alt="Build" />
          <h3 className="profile_buildCard_title">{build.title}</h3>
        </div>
        <div className="profile_buildCard_buttons">
          <button className="profile_buildCard_Edit" onClick={toggleDetails}>
            {isExpanded ? "Close" : "Edit"}
          </button>
          <button className="profile_buildCard_Share">Share</button>
        </div>
      </div>
      {isExpanded && (
        <ProfileBuildDetails
          title={title}
          setTitle={setTitle}
          onDeleteBuild={onDeleteBuild}
          build={build} // Pass the full build object
        />
      )}
    </div>
  );
}

export default ProfileBuildCard;
