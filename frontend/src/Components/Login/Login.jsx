import React, { useContext, useState } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
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

  const onFinish = async (values) => {
    try {
      setIsLoading(true);
      setApiError("");

      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        values,
        { withCredentials: true }
      );

      if (response.data.success) {
        login(response.data.user);
        message.success("Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setApiError(response.data.message || "Login failed");
        message.error(
          response.data.message ||
            "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";
      setApiError(errorMessage);
      message.error(errorMessage);

      // Handle unverified account case
      if (error.response?.status === 403) {
        navigate("/welcome", {
          state: {
            userId: error.response.data.userId,
            userEmail: values.email,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Login failed. Please check your information.");
  };

  return (
    <div className="login-container">
      {apiError && <div className="login-error-message">{apiError}</div>}
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
        <Form
          name="login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <h2 className="form-title">Sign In</h2>

          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
                type: "email",
              },
            ]}
          >
            <Input className="form-input" placeholder="Email Address" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
                min: 8,
              },
            ]}
          >
            <Input.Password className="form-input" placeholder="Password" />
          </Form.Item>

          <div className="form-options">
            <Form.Item
              name="remember"
              valuePropName="checked"
              className="remember-me"
            >
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <Form.Item>
            <Button
              htmlType="submit"
              className="login-button"
              loading={isLoading}
            >
              Sign In
            </Button>
          </Form.Item>

          <p className="signup-link">
            Not Account Yet? <Link to="/signup">Sign Up</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Login;
