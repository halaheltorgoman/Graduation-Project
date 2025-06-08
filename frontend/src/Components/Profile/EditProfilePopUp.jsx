import React, { useEffect, useState } from "react";
import { Upload, message, Input } from "antd";
import { LoadingOutlined, EditOutlined, UserOutlined, CheckOutlined } from "@ant-design/icons";
import "./EditProfilePopUp.css";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

const EditProfilePopUp = ({
  setOpenEditProfilePopUp,
  setImageUrl,
  imageUrl,
  setUserBio,
  userBio,
  setUserName,
  userName,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localImageUrl, setLocalImageUrl] = useState("");
  const [bioInput, setBioInput] = useState(userBio);
  const [userNameInput, setUserNameInput] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    setLocalImageUrl(imageUrl);
    setBioInput(userBio);
    setUserNameInput(userName);
  }, [imageUrl, userBio, userName]);

  const handleSave = () => {
    setImageUrl(localImageUrl);
    setUserBio(bioInput);
    setUserName(userNameInput);
    setOpenEditProfilePopUp(false);
  };

  const beforeUpload = (file) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG/PNG files are allowed!");
      message.error("Only JPG/PNG files are allowed!");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 >= 2) {
      setError("Image must be smaller than 2MB!");
      message.error("Image must be smaller than 2MB!");
      return Upload.LIST_IGNORE;
    }
    setError("");
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
      const fileInput = document.querySelector(".ant-upload input[type='file']");
      if (fileInput) fileInput.value = "";
    }, 1500);
  };

const handleChangePassword = () => {
    setOpenEditProfilePopUp(false); // Close the popup
    navigate('/forgot-password'); // Navigate to your change password page
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
          </Upload>
        </div>
        <div className="profile_error">
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>

      {/* User Info Section - Now directly in the component */}
      <div className="user_form">
        <form>
          <div className="edit_userInfo">
            <div className="username-field-container">
              <TextArea
                value={userNameInput}
                onChange={(e) => setUserNameInput(e.target.value)}
                placeholder="Enter Username"
                autoSize={{ minRows: 1, maxRows: 2 }}
                disabled={!isEditingName}
                className={`username-textarea ${isEditingName ? "editing" : ""}`}
              />
              <div 
                className="username-edit-icon" 
                onClick={() => setIsEditingName(!isEditingName)}
              >
                {isEditingName ? <CheckOutlined /> : <EditOutlined />}
              </div>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="editProfile_btns">
            <button 
              className="change-password" 
              onClick={handleChangePassword} // Add onClick handler
            >
              Change Password
            </button>
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