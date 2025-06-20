import React, { useEffect, useState, useContext } from "react";
import { Upload, message, Input } from "antd";
import {
  LoadingOutlined,
  EditOutlined,
  UserOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import "./EditProfilePopUp.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../Context/UserContext"; // Add this import

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
  const { setUser, user } = useContext(UserContext); // Add UserContext
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localImageUrl, setLocalImageUrl] = useState("");
  const [bioInput, setBioInput] = useState(userBio);
  const [userNameInput, setUserNameInput] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    setLocalImageUrl(imageUrl);
    setBioInput(userBio);
    setUserNameInput(userName);
  }, [imageUrl, userBio, userName]);

  const handleSave = async () => {
    setSaveLoading(true);
    setError("");

    try {
      const formData = new FormData();

      // Only include username if it has changed
      if (userNameInput !== userName) {
        formData.append("username", userNameInput.trim());
      }

      // Only include bio if it has changed
      if (bioInput !== userBio) {
        formData.append("bio", bioInput);
      }

      // Handle image upload if there's a new local image
      if (
        localImageUrl &&
        localImageUrl !== imageUrl &&
        localImageUrl.startsWith("data:")
      ) {
        // Convert base64 to blob for upload
        const response = await fetch(localImageUrl);
        const blob = await response.blob();
        formData.append("avatar", blob, "avatar.jpg");
      }

      const response = await axios.put(
        "http://localhost:4000/api/users/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Update parent state with new values
        setImageUrl(response.data.profile.avatar || localImageUrl);
        setUserBio(response.data.profile.bio || bioInput);
        setUserName(response.data.profile.username || userNameInput);

        // **IMPORTANT FIX**: Update UserContext with new username
        if (userNameInput !== userName && user) {
          setUser({
            ...user,
            username: response.data.profile.username || userNameInput.trim(),
          });
        }

        message.success("Profile updated successfully!");
        setOpenEditProfilePopUp(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
        message.error(error.response.data.message);
      } else {
        setError("Failed to update profile. Please try again.");
        message.error("Failed to update profile. Please try again.");
      }
    } finally {
      setSaveLoading(false);
    }
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
      return Upload.false;
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
      if (beforeUpload(file) !== Upload.LIST_IGNORE) {
        setLoading(false);
        return;
      }
      onSuccess("ok");
      handleChange({ file: { status: "done", originFileObj: file } });
      const fileInput = document.querySelector(
        ".ant-upload input[type='file']"
      );
      if (fileInput) fileInput.value = "";
    }, 1500);
  };

  const handleChangePassword = () => {
    setOpenEditProfilePopUp(false);
    navigate("/forgot-password");
  };

  const handleUsernameEdit = () => {
    if (isEditingName) {
      // When finishing edit, trim whitespace
      setUserNameInput(userNameInput.trim());
    }
    setIsEditingName(!isEditingName);
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
      </div>

      {/* User Info Section */}
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
                className={`username-textarea ${
                  isEditingName ? "editing" : ""
                }`}
                maxLength={30}
              />
              <div className="username-edit-icon" onClick={handleUsernameEdit}>
                {isEditingName ? <CheckOutlined /> : <EditOutlined />}
              </div>
              {/* Error message moved here - below the username field */}
              {error && <div className="username-error-message">{error}</div>}
            </div>
          </div>

          {/* Buttons Section */}
          <div className="editProfile_btns">
            <button
              type="button"
              className="change-password"
              onClick={handleChangePassword}
            >
              Change Password
            </button>
            <div className="editProfile_submission_btns">
              <button
                type="button"
                className="editProfile_cancelBtn"
                onClick={() => setOpenEditProfilePopUp(false)}
                disabled={saveLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="editProfile_saveBtn"
                onClick={handleSave}
                disabled={saveLoading}
              >
                {saveLoading ? <LoadingOutlined /> : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePopUp;
