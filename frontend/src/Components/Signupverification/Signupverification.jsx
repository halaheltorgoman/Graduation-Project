import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Input, message } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Signupverification.css";
import logo from "../../assets/images/logo.svg";
import axios from "axios";

const SignupVerification = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    const { state } = location;
    if (!state?.userId) {
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
        } else {
          navigate("/signup");
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
        navigate("/signup");
      }
    };

    fetchUserEmail();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [location, navigate]);

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
      setError("User ID not found. Please sign up again.");
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
        messageApi.success("Email verified successfully!");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(response.data.message || "Verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err.response?.data || err);
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    const { state } = location;

    if (!state?.userId) {
      setError("User ID not found. Please sign up again.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/send-verify-otp",
        { userId: state.userId },
        { withCredentials: true }
      );

      if (response.data.success) {
        messageApi.info("New verification code sent to your email");
        setTimeLeft(60);
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Resend OTP error:", err.response?.data || err);
      setError(
        err.response?.data?.message || "An error occurred while sending OTP"
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      {contextHolder}
      <div className="signupverification-container">
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
              We've sent a 6-digit verification code to {email || "your email"}.
              Please enter it below.
            </p>

            {error && <div className="signupverification-error">{error}</div>}

            <div className="signupverification-code-container">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  id={`code-input-${index}`}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="signupverification-code-input"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  disabled={isSubmitting}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="signupverification-timer">
              {timeLeft > 0 ? (
                <p>Code expires in: {formatTime(timeLeft)}</p>
              ) : (
                <p>Code has expired</p>
              )}
            </div>

            <Form.Item>
              <Button
                htmlType="submit"
                className="signupverification-button"
                loading={isSubmitting}
                disabled={timeLeft === 0}
              >
                {isSubmitting ? "Verifying..." : "Verify"}
              </Button>
            </Form.Item>

            <p className="signupverification-resend">
              Didn't receive a code?{" "}
              <button
                type="button"
                className="signupverification-resend-button"
                onClick={handleResendCode}
                disabled={timeLeft > 30}
              >
                Resend code
              </button>
            </p>

            <p className="signupverification-login-link">
              Remember your password? <Link to="/login">Sign In</Link>
            </p>
          </Form>
        </div>
      </div>
    </>
  );
};

export default SignupVerification;
