import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Input, Alert } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./SignupVerification.css";
import logo from "../../assets/images/logo.svg";
import axios from "axios";

const Signupverification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const { state } = location;
    if (!state?.userId) {
      showAlertMessage("User ID not found. Please sign up again.");
      navigate("/signup");
      return;
    }

    const fetchUserEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/auth/user-info?id=${state.userId}`
        );

        if (response.data.success) {
          setEmail(response.data.user.email);
          startTimer();
        } else {
          navigate("/signup");
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
        navigate("/signup");
      }
    };

    fetchUserEmail();
  }, [location, navigate]);

  const showAlertMessage = (message) => {
    setError(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

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
    const { state } = location;

    if (!state?.userId) {
      showAlertMessage("User ID not found. Please sign up again.");
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/verify-account",
        {
          userId: state.userId,
          OTP: verificationCode,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        showAlertMessage("Email verified successfully!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setError(response.data.message || "Verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err.response?.data || err);
      setError(
        err.response?.data?.message ||
          "An error occurred during verification. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    const { state } = location;
    setError("");

    if (!state?.userId) {
      showAlertMessage("User ID not found. Please sign up again.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/send-verify-otp",
        { userId: state.userId },
        { withCredentials: true }
      );

      if (response.data.success) {
        showAlertMessage("New verification code sent to your email!");
        setTimeLeft(60);
        startTimer();
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Resend OTP error:", err.response?.data || err);
      setError(
        err.response?.data?.message ||
          "An error occurred while sending OTP. Please try again."
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="signupverification-container">
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
        <img
          src={logo}
          alt="PC Smith Logo"
          className="verifyforgotpassword-logo"
        />
      </Link>

      <div className="signupverification-title-container">
        <h1 className="signupverification-title">Welcome to PC Smith</h1>
      </div>

      <div className="signupverification-form-container">
        <Form
          className="signupverification-form"
          onFinish={onFinish}
          autoComplete="off"
        >
          <h3 className="signupverification-subtitle">Please Verify Code</h3>
          <p className="signupverification-instructions">
            We've sent a 6-digit verification code to{" "}
            <strong>{email || "your email"}</strong>. Please enter it below.
          </p>

          {error && !showAlert && (
            <div className="signupverification-error-message">{error}</div>
          )}

          <div className="signupverification-code-container">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                className="signupverification-code-input"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
                disabled={isSubmitting}
                autoFocus={index === 0}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          <div className="signupverification-timer">
            {timeLeft > 0 ? (
              <p>Code expires in: {formatTime(timeLeft)}</p>
            ) : (
              <p className="expired-message">Code has expired</p>
            )}
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="signupverification-button"
              loading={isSubmitting}
              disabled={isSubmitting || timeLeft === 0}
              block
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </Form.Item>

          <div className="signupverification-resend-container">
            <p className="signupverification-resend-text">
              Didn't receive a code?{" "}
              <Button
                type="link"
                className="signupverification-resend-button"
                onClick={handleResendCode}
                disabled={timeLeft > 0 && timeLeft < 60}
              >
                Resend code
              </Button>
            </p>
          </div>

          <div className="signupverification-login-link">
            Remember your password? <Link to="/login">Sign In</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Signupverification;
