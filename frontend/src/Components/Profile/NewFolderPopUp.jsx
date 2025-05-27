import React, { useState } from "react";
import "./NewFolderPopUp.css";
import { SlClose } from "react-icons/sl";

function NewFolderPopUp({ setOpenPopUp, handleSaveFolder }) {
  const [folderName, setFolderName] = useState(""); // Store folder name

  return (
    <div className="NewFolder_overlay">
      <div className="NewFolder_main">
        <div className="NewFolder_cancelbtn">
          <button onClick={() => setOpenPopUp(false)}>
            <SlClose size={25} />
          </button>
        </div>

        <div className="NewFolder_mainContent">
          <p>Enter Folder Name</p>
          <input
            type="text"
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </div>

        <div className="NewFolder_buttons">
          <button onClick={() => setOpenPopUp(false)}>Cancel</button>
          <button onClick={() => handleSaveFolder(folderName)}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default NewFolderPopUp;
