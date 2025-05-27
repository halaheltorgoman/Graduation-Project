import React from 'react';
import { Button, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './Verifysignupemail.css';
import logo from "../../assets/images/logo.svg";

const Verifysignupemail = () => {
  const navigate = useNavigate();

  const onVerificationFinish = (values) => {
    console.log('Success:', values);
    message.success('Verification email sent!');
    setTimeout(() => {
      navigate('/signup-verification');
    }, 1500);
  };

  const onVerificationFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Please enter a valid email address');
  };

  return (
    <div className="verifysignupemail-container">
      <Link to="/">
        <img 
          src={logo} 
          alt="PC Smith Logo" 
          className="verifysignupemail-logo"
        />
      </Link>
      <div className="verifysignupemail-title-container">
        <h1 className="verifysignupemail-title">Verify Your Email</h1>
      </div>
      
      <div className="verifysignupemail-form-container">
        <Form
          name="verify-signup-email"
          className="verifysignupemail-form"
          onFinish={onVerificationFinish}
          onFinishFailed={onVerificationFailed}
          autoComplete="off"
        >
          <p className="verifysignupemail-instructions">
            Please provide your email address to receive your verification email
          </p>
          
          <Form.Item
            name="email"
            rules={[
              { 
                required: true, 
                message: 'Please input your email!' 
              },
              { 
                type: 'email',
                message: 'Please enter a valid email address'
              }
            ]}
          >
            <Input 
              className="verifysignupemail-input"
              placeholder="Email Address" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              htmlType="submit" 
              className="verifysignupemail-button"
            >
              Verify Email
            </Button>
          </Form.Item>

          <p className="verifysignupemail-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Verifysignupemail;