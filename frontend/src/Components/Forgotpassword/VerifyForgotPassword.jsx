import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Input, Alert, message } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./VerifyForgotPassword.css";
import logo from "../../assets/images/logo.svg";
import axios from "axios";

const VerifyForgotPassword = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [email] = useState(location.state?.email || "");
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start timer when component mounts
  useEffect(() => {
    if (email) {
      startTimer();
    }
  }, [email]);

  const showAlertMessage = (message) => {
    setError(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(60); // Reset to 60 seconds

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCodeChange = (index, value) => {
    const newCode = [...code];
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onFinish = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      showAlertMessage("Please enter a 6-digit verification code");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:4000/api/auth/verify-reset-otp",
        {
          email,
          OTP: verificationCode,
        }
      );

      if (response.data.success) {
        messageApi.success("OTP verified successfully!");
        navigate("/forgot-password", {
          state: { email },
        });
      } else {
        showAlertMessage(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      showAlertMessage(
        error.response?.data?.message || "An error occurred during verification"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      if (!email) {
        showAlertMessage("Email is required to resend OTP");
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/api/auth/send-reset-otp",
        {
          email,
        }
      );

      if (response.data.success) {
        showAlertMessage("New OTP has been sent to your email");
        startTimer(); // Reset the timer
      } else {
        showAlertMessage(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      showAlertMessage(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="verifyforgotpassword-container">
      {contextHolder}
      {showAlert && (
        <div className="alert-top">
          <Alert
            message={error}
            type="info"
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
        <img src={logo} alt="Logo" className="verifyforgotpassword-logo" />
      </Link>

      <div className="verifyforgotpassword-title-container">
        <h1 className="verifyforgotpassword-title">Verify OTP</h1>
      </div>

      <div className="verifyforgotpassword-form-container">
        <Form
          className="verifyforgotpassword-form"
          onFinish={onFinish}
          autoComplete="off"
        >
          <p className="verifyforgotpassword-instructions">
            We've sent a 6-digit verification code to{" "}
            <strong>{email || "your email"}</strong>. Please enter it below.
          </p>

          <div className="verifyforgotpassword-code-container">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                className="verifyforgotpassword-code-input"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
                disabled={isLoading}
                autoFocus={index === 0}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          <div className="verifyforgotpassword-timer">
            {timeLeft > 0 ? (
              <p>Code expires in: {formatTime(timeLeft)}</p>
            ) : (
              <p className="expired-message">Code has expired</p>
            )}
          </div>

          <Form.Item>
            <Button
              htmlType="submit"
              className="verifyforgotpassword-button"
              loading={isLoading}
              disabled={isLoading || timeLeft === 0}
            >
              Verify OTP
            </Button>
          </Form.Item>

          <div className="verifyforgotpassword-resend-container">
            <p className="verifyforgotpassword-resend-text">
              Didn't receive a code?{" "}
              <Button
                type="link"
                className="verifyforgotpassword-resend-button"
                onClick={handleResendCode}
                disabled={timeLeft > 0 && timeLeft < 60}
              >
                Resend code
              </Button>
            </p>
          </div>

          <p className="verifyforgotpassword-login-link">
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default VerifyForgotPassword;
