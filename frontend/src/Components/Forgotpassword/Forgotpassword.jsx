import React from 'react';
import { Button, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './Forgotpassword.css'; // Reusing the same CSS file
import logo from "../../assets/images/logo.svg";


const ForgotPassword = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log('Success:', values);
    message.success('Password reset email sent!');
    setTimeout(() => {
      navigate('/verify-forgot-password'); // Redirect back to login after sending
    }, 1500);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Please enter a valid email address');
  };

  return (
    <div className="login-container">
             <Link to="/">
        <img 
          src={logo} 
          alt="PC Smith Logo" 
          className="verifyforgotpassword-logo"
        />
      </Link>
      <div className="login-title-container">
        <h1 className="login-title">Forgot Password?</h1>
      </div>
      
      <div className="login-form-container">
        <Form
          name="forgot-password"
          className="login-form"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <p className="forgot-instructions">
            Provide your email address to receive your password reset email
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
              className="form-input"
              placeholder="Email Address" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              htmlType="submit" 
              className="login-button"
            >
              Next
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

export default ForgotPassword;