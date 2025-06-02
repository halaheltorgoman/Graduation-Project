import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPasswordEmail.css";
import logo from "../../assets/images/logo.svg";
import axios from "axios";

const ForgotPasswordEmail = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:4000/api/auth/send-reset-otp",
        { email: values.email }
      );

      if (response.data.success) {
        messageApi.success("OTP sent to your email!");
        navigate("/verify-forgot-password", { state: { email: values.email } });
      } else {
        messageApi.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      messageApi.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {contextHolder}
      <Link to="/">
        <img src={logo} alt="Logo" className="verifyforgotpassword-logo" />
      </Link>

      <div className="login-title-container">
        <h1 className="login-title">Forgot Password?</h1>
      </div>

      <div className="login-form-container">
        <Form
          name="forgot-password"
          className="login-form"
          onFinish={onFinish}
          autoComplete="off"
        >
          <p className="forgot-instructions">
            Enter your email to receive a password reset OTP
          </p>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input className="form-input" placeholder="Email Address" />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              className="login-button"
              loading={isLoading}
            >
              Send OTP
            </Button>
          </Form.Item>

          <p className="signup-link">
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPasswordEmail;
