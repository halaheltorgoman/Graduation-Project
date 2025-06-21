import React, { useState } from "react";
import { Button, Checkbox, Input, Alert } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import logo from "../../assets/images/logo.svg";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const showAlertMessage = (message, type = "error") => {
    setApiError({ message, type });
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "username":
        if (!value) newErrors.username = "Please input your username!";
        else if (value.length < 3)
          newErrors.username = "Username must be at least 3 characters";
        else newErrors.username = "";
        break;

      case "email":
        if (!value) newErrors.email = "Please input your email!";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          newErrors.email = "Please enter a valid email address";
        else newErrors.email = "";
        break;

      case "password":
        if (!value) newErrors.password = "Please input your password!";
        else if (value.length < 8)
          newErrors.password = "Password must be at least 8 characters";
        else newErrors.password = "";
        // Trigger confirm password validation when password changes
        if (formData.confirmPassword) {
          validateField("confirmPassword", formData.confirmPassword);
        }
        break;

      case "confirmPassword":
        if (!value) newErrors.confirmPassword = "Please confirm your password!";
        else if (value !== formData.password)
          newErrors.confirmPassword = "The two passwords do not match!";
        else newErrors.confirmPassword = "";
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return newErrors[name] === "";
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const onFinish = async () => {
    try {
      setIsLoading(true);
      setApiError({ message: "", type: "" });

      const response = await axios.post(
        "http://localhost:4000/api/auth/signup",
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        showAlertMessage(
          "Account created successfully! Redirecting...",
          "success"
        );
        setTimeout(() => {
          navigate("/signup-verification", {
            state: {
              userId: response.data.userId,
              userEmail: response.data.userEmail,
            },
          });
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Signup failed. Please check your information.";
      showAlertMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    if (isValid) {
      await onFinish();
    }
  };

  return (
    <div className="signup-container">
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
        <img
          src={logo}
          alt="PC Smith Logo"
          className="verifyforgotpassword-logo"
        />
      </Link>

      <div className="signup-title-container">
        <h1 className="signup-title">Create Account</h1>
      </div>

      <div className="signup-form-container">
        <form onSubmit={handleSubmit} className="signup-form">
          {/* Username Field */}
          <div className="ant-form-item">
            <Input
              className="form-input"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              onBlur={(e) => validateField("username", e.target.value)}
            />
            {errors.username && (
              <div className="ant-form-item-explain-error">
                {errors.username}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="ant-form-item">
            <Input
              className="form-input"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={(e) => validateField("email", e.target.value)}
            />
            {errors.email && (
              <div className="ant-form-item-explain-error">{errors.email}</div>
            )}
          </div>

          {/* Password Field */}
          <div className="ant-form-item">
            <Input.Password
              className="form-input"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={(e) => validateField("password", e.target.value)}
            />
            {errors.password && (
              <div className="ant-form-item-explain-error">
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="ant-form-item">
            <Input.Password
              className="form-input"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onBlur={(e) => validateField("confirmPassword", e.target.value)}
            />
            {errors.confirmPassword && (
              <div className="ant-form-item-explain-error">
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <p className="password-requirement-text">
            Password must be at least 8 characters.
          </p>

          <div className="form-options"></div>

          <Button
            htmlType="submit"
            className="signup-button"
            loading={isLoading}
          >
            Sign Up
          </Button>

          <p className="login-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
