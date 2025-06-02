import React, { useState } from "react";
import { Button, Form, Input, Alert, message } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Forgotpassword.css";
import logo from "../../assets/images/logo.svg";
import axios from "axios";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState({ message: "", type: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { email } = location.state || {};

  const showAlertMessage = (message, type = "error") => {
    setApiError({ message, type });
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const onFinish = async (values) => {
    try {
      setIsLoading(true);

      if (!email) {
        showAlertMessage("Email is required for password reset");
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/api/auth/reset-password",
        {
          email,
          newPassword: values.password,
          confirmPassword: values.confirmPassword,
        }
      );

      if (response.data.success) {
        messageApi.success(
          "Password reset successfully! Redirecting to login..."
        );
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to reset password. Please try again.";
      showAlertMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject("Please input your password!");
    }
    if (value.length < 8) {
      return Promise.reject("Password must be at least 8 characters!");
    }
    // if (!/[A-Z]/.test(value)) {
    //   return Promise.reject(
    //     "Password must contain at least one uppercase letter!"
    //   );
    // }
    // if (!/[a-z]/.test(value)) {
    //   return Promise.reject(
    //     "Password must contain at least one lowercase letter!"
    //   );
    // }
    // if (!/[0-9]/.test(value)) {
    //   return Promise.reject("Password must contain at least one number!");
    // }
    // if (!/[^A-Za-z0-9]/.test(value)) {
    //   return Promise.reject(
    //     "Password must contain at least one special character!"
    //   );
    // }
    return Promise.resolve();
  };

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue("password") === value) {
        return Promise.resolve();
      }
      return Promise.reject("The two passwords do not match!");
    },
  });

  return (
    <div className="forgot-container">
      {contextHolder}
      {showAlert && (
        <div className="alert-top">
          <Alert
            message={apiError.message}
            type={apiError.type}
            showIcon
            closable
            onClose={() => setShowAlert(false)}
            style={{
              position: "relative",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              minWidth: "300px",
            }}
          />
          <div className="alert-progress" />
        </div>
      )}

      <Link to="/">
        <img src={logo} alt="Logo" className="reset-logo" />
      </Link>

      <div className="forgot-title-container">
        <h1 className="forgot-title">Reset Password</h1>
      </div>

      <div className="forgot-form-container">
        <Form
          name="reset-password"
          className="login-form"
          onFinish={onFinish}
          autoComplete="off"
        >
          <p className="forgot-instructions">
            Create a new password for {email}
          </p>

          <Form.Item
            name="password"
            rules={[{ validator: validatePassword }]}
            extra="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
          >
            <Input.Password className="form-input" placeholder="New Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              validateConfirmPassword,
            ]}
          >
            <Input.Password
              className="form-input"
              placeholder="Confirm New Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              className="forgot-button"
              loading={isLoading}
            >
              Reset Password
            </Button>
          </Form.Item>

          <p className="login-link">
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;
