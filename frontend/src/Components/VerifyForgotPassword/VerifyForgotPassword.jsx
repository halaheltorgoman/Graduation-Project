import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './VerifyForgotPassword.css';
import logo from "../../assets/images/logo.svg"; // Update with your actual logo path

const VerifyForgotPassword = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const handleCodeChange = (e, index) => {
    const newCode = [...code];
    newCode[index] = e.target.value;
    setCode(newCode);
    
    if (e.target.value && index < 5) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  const onFinish = () => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6) {
      messageApi.success('Code verified successfully!');
      setTimeout(() => navigate('/'), 1500);
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
      <div className="verifyforgotpassword-container">
        {/* Add the logo here */}
       <Link to="/">
  <img 
    src={logo} 
    alt="PC Smith Logo" 
    className="verifyforgotpassword-logo"
  />
</Link>
        
        <div className="verifyforgotpassword-title-container">
          <h1 className="verifyforgotpassword-title">Verify Code</h1>
        </div>
        
        <div className="verifyforgotpassword-form-container">
          <Form
            className="verifyforgotpassword-form"
            onFinish={onFinish}
            autoComplete="off"
          >
            <p className="verifyforgotpassword-instructions">
              We've sent a 6-digit verification code to your email. Please enter it below.
            </p>
            
            <div className="verifyforgotpassword-code-container">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  id={`code-input-${index}`}
                  className="verifyforgotpassword-code-input"
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
                className="verifyforgotpassword-button"
              >
                Verify
              </Button>
            </Form.Item>

            <p className="verifyforgotpassword-resend">
              Didn't receive a code?{' '}
              <button 
                type="button" 
                className="verifyforgotpassword-resend-button"
                onClick={handleResendCode}
              >
                Resend code
              </button>
            </p>

            <p className="verifyforgotpassword-login-link">
              Remember your password? <Link to="/login">Sign In</Link>
            </p>
          </Form>
        </div>
      </div>
    </>
  );
};

export default VerifyForgotPassword;