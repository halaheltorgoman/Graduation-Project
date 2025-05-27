import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Modal } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Verifysignupemail.css";
import logo from "../../assets/images/logo.svg";
import { FaTimes } from "react-icons/fa";
import axios from "axios";

const Verifysignupemail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm] = Form.useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      const { state } = location;
      if (!state?.userId) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:4000/api/auth/user-info?id=${state.userId}`
        );

        if (response.data.success) {
          setUserData({
            name: response.data.user.username,
            email: response.data.user.email,
          });
        } else {
          navigate("/signup");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/signup");
      }
    };

    fetchUserData();
  }, [location, navigate]);

  const handleVerifyClick = async () => {
    setIsLoading(true);
    const { state } = location;

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/send-verify-otp",
        { userId: state.userId },
        { withCredentials: true }
      );

      if (response.data.success) {
        message.success("Verification code sent to your email!");
        navigate("/signup-verification", { state: { userId: state.userId } });
      } else {
        message.error(
          response.data.message || "Failed to send verification code"
        );
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      message.error(
        error.response?.data?.message || "Failed to send verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const values = await emailForm.validateFields();
      const { state } = location;

      const response = await axios.post(
        "http://localhost:4000/api/auth/send-verify-otp",
        { userId: state.userId, email: values.email },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUserData((prev) => ({ ...prev, email: values.email }));
        setShowEmailModal(false);
        message.success("Email updated successfully! Verification code sent.");
      } else {
        message.error(response.data.message || "Failed to update email");
      }
    } catch (error) {
      console.error("Error updating email:", error);
      message.error(error.response?.data?.message || "Failed to update email");
    }
  };

  return (
    <div className="verifysignupemail-container">
      <Link to="/">
        <img
          src={logo}
          alt="PC Smith Logo"
          className="verifysignupemail-logo"
        />
      </Link>
      <div className="verifysignupemail-title-container">
        <h1 className="verifysignupemail-title">Verify Your Email</h1>
      </div>

      <div className="verifysignupemail-form-container">
        <div className="verifysignupemail-content">
          <h2>Hi {userData.name}!</h2>
          <p className="verifysignupemail-instructions">
            Please verify your email address to continue
          </p>

          <div className="verifysignupemail-buttons">
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                className="verifysignupemail-input"
                placeholder="Email Address"
              />
            </Form.Item>

            <Form.Item>
              <Button
                htmlType="submit"
                className="verifysignupemail-button"
                onClick={handleVerifyClick}
              >
                Verify Email
              </Button>
                  
            </Form.Item>
          </div>

          <p className="verifysignupemail-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>

      <Modal
        title="Change Email Address"
        open={showEmailModal}
        centered
        closeIcon={
          <span className="verifysignupemail-close-icon">
            <FaTimes />
          </span>
        }
        className="verifysignupemail-modal"
        onCancel={() => setShowEmailModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdateEmail}>
            Update Email
          </Button>,
        ]}
      >
        <Form form={emailForm} layout="vertical">
          <Form.Item
            name="email"
            label="New Email Address"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
            initialValue={userData.email}
          >
            <Input placeholder="Enter new email address" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Verifysignupemail;
