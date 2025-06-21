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
import { UserContext } from "../../Context/UserContext";

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
  const { setUser, user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localImageUrl, setLocalImageUrl] = useState("");
  const [bioInput, setBioInput] = useState(userBio);
  const [userNameInput, setUserNameInput] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // Store the actual file

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

      // Add the actual file if one was selected
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      // Only make API call if there are changes
      if (userNameInput !== userName || bioInput !== userBio || selectedFile) {
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

          // Update UserContext with new username
          if (userNameInput !== userName && user) {
            setUser({
              ...user,
              username: response.data.profile.username || userNameInput.trim(),
            });
          }

          message.success("Profile updated successfully!");
          setOpenEditProfilePopUp(false);
        }
      } else {
        message.info("No changes to save");
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
    // Check file type
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";
    if (!isJpgOrPng) {
      setError("Only JPG, PNG, and WebP files are allowed!");
      message.error("Only JPG, PNG, and WebP files are allowed!");
      return false;
    }

    // Check file size (5MB limit to match backend)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      setError("Image must be smaller than 5MB!");
      message.error("Image must be smaller than 5MB!");
      return false;
    }

    setError("");
    return true;
  };

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }

    if (info.file.status === "done" || info.file.status === "error") {
      setLoading(false);
    }
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      // Validate file first
      if (!beforeUpload(file)) {
        onError(new Error("File validation failed"));
        return;
      }

      setLoading(true);

      // Store the actual file for later upload
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setLocalImageUrl(e.target.result);
        setLoading(false);
        onSuccess("ok");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setLoading(false);
      onError(error);
    }
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
            customRequest={customRequest}
            onChange={handleChange}
            accept="image/*"
          >
            <div className="edit-icon">
              <button type="button">
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
              <label>Username</label>
              <div className="username-input-wrapper">
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
                <div
                  className="username-edit-icon"
                  onClick={handleUsernameEdit}
                >
                  {isEditingName ? <CheckOutlined /> : <EditOutlined />}
                </div>
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
