import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './Signupverification.css';
import logo from "../../assets/images/logo.svg";

const SignupVerification = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const handleCodeChange = (e, index) => {
    const newCode = [...code];
    newCode[index] = e.target.value;
    setCode(newCode);
    
    // Auto focus to next input
    if (e.target.value && index < 5) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  const onFinish = () => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6) {
      console.log('Verification code:', verificationCode);
      messageApi.success('Code verified successfully!');
      setTimeout(() => {
        navigate('/'); 
      }, 1500);
    } else {
      messageApi.error('Please enter a 6-digit verification code');
    }
  };

  const handleResendCode = () => {
    messageApi.info('New verification code sent to your email');
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
              We've sent a 6-digit verification code to your email. Please enter it below.
            </p>
            
            <div className="signupverification-code-container">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  id={`code-input-${index}`}
                  className="signupverification-code-input"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleCodeChange(e, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <Form.Item>
              <Button 
                htmlType="submit" 
                className="signupverification-button"
              >
                Verify
              </Button>
            </Form.Item>

            <p className="signupverification-resend">
              Didn't receive a code?{' '}
              <button 
                type="button" 
                className="signupverification-resend-button"
                onClick={handleResendCode}
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