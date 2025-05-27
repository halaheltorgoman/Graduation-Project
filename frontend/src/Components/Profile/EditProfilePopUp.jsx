import React, { useEffect, useState } from "react";
import { Upload, message } from "antd";
import { LoadingOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import "./EditProfilePopUp.css";
import EditableTextField from "./EditableTextField";

const EditProfilePopUp = ({
  setOpenEditProfilePopUp,
  setImageUrl,
  imageUrl,
  setUserBio,
  userBio,
  setUserName,
  userName,
}) => {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [localImageUrl, setLocalImageUrl] = useState(""); // Local preview
  const [bioInput, setBioInput] = useState(userBio);
  const [userNameInput, setUserNameInput] = useState(userName);

  useEffect(() => {
    setLocalImageUrl(imageUrl); // ✅ Update when the popup opens
    setBioInput(userBio); // ✅ Sync bio when popup opens
    setUserNameInput(userName);
  }, [imageUrl, userBio, userName]);

  const handleSave = () => {
    setImageUrl(localImageUrl); // ✅ Update Profile avatar
    setUserBio(bioInput); // ✅ Update Profile bio only on Save
    setUserName(userNameInput);

    setOpenEditProfilePopUp(false); // ✅ Close popup
  };

  const beforeUpload = (file) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG/PNG files are allowed!");
      message.error("Only JPG/PNG files are allowed!");
      return Upload.LIST_IGNORE; // Prevents upload
    }
    if (file.size / 1024 / 1024 >= 2) {
      setError("Image must be smaller than 2MB!");
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }

    setError(""); // Clear previous errors
    return true;
  };

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done" && info.file.originFileObj) {
      const reader = new FileReader();
      reader.onload = () => {
        setLocalImageUrl(reader.result);
        setLoading(false);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const customRequest = ({ file, onSuccess }) => {
    setLoading(true);
    setTimeout(() => {
      if (beforeUpload(file) !== true) {
        setLoading(false);
        return;
      }
      onSuccess("ok");
      handleChange({ file: { status: "done", originFileObj: file } });

      // ✅ Reset file input so user can upload the same file again
      const fileInput = document.querySelector(
        ".ant-upload input[type='file']"
      );
      if (fileInput) fileInput.value = "";
    }, 1500);
  };

  return (
    <div className="editProfile">
      {/* Profile Upload Section */}
      <div className="profile-container">
        <div className="editProfile_main">
          <div className="profile-avatar">
            {loading ? (
              <LoadingOutlined className="loading-avatar-icon" />
            ) : localImageUrl ? (
              <img src={localImageUrl} alt="avatar" className="profile-image" />
            ) : (
              <UserOutlined className="default-avatar-icon" />
            )}
          </div>
          {/* Upload Button */}
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={beforeUpload}
            customRequest={customRequest}
          >
            <div className="edit-icon">
              <button>
                <p>Upload Image</p>
                <EditOutlined />
              </button>
            </div>
          </Upload>{" "}
        </div>
        <div className="profile_error">
          {/* 🔥 Display error messages below */}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>

      {/* Editable Text Fields */}
      <div className="user_form">
        <form>
          <div className="edit_userInfo">
            <EditableTextField
              value={userNameInput}
              setValue={setUserNameInput}
              placeholder="Enter Username"
              onChange={(e) => setUserNameInput(e.target.value)}
              fontSize="14px"
              fontWeight="200"
              width="90%"
            />
            <EditableTextField
              value={bioInput}
              setValue={setBioInput}
              onChange={(e) => setUserBio(e.target.value)}
              placeholder="Enter Bio"
              fontSize="14px"
              fontWeight="200"
              width="90%"
            />
          </div>

          {/* Buttons Section */}
          <div className="editProfile_btns">
            <button className="change-password">Change Password</button>
            <div className="editProfile_submission_btns">
              <button
                className="editProfile_cancelBtn"
                onClick={() => setOpenEditProfilePopUp(false)}
              >
                Cancel
              </button>
              <button className="editProfile_saveBtn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePopUp;
