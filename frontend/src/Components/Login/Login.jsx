import React, { useContext, useState, useEffect } from "react";
import { Button, Checkbox, Input, Alert } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../../assets/images/logo.svg";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showAlert, setShowAlert] = useState(false);

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
      setApiError("");

      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        login(response.data.user);
        showAlertMessage("Login successful! Redirecting...", "success");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        showAlertMessage(response.data.message || "Login failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";

      showAlertMessage(errorMessage);

      if (error.response?.status === 403) {
        navigate("/welcome", {
          state: {
            userId: error.response.data.userId,
            userEmail: formData.email,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;

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
    <div className="login-container">
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

      <div className="login-title-container">
        <h1 className="login-title">Welcome Back</h1>
      </div>

      <div className="login-form-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="form-title">Sign In</h2>

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

          <div className="form-options">
            <Checkbox>Remember me</Checkbox>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <Button
            htmlType="submit"
            className="login-button"
            loading={isLoading}
          >
            Sign In
          </Button>

          <p className="signup-link">
            Not Account Yet? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
