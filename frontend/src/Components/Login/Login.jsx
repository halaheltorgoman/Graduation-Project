import React from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import logo from "../../assets/images/logo.svg";

const Login = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log('Success:', values);
    // Add your actual authentication logic here
    // For demo, we'll simulate a successful login
    message.success('Login successful! Redirecting...');
    setTimeout(() => {
      navigate('/'); // Redirect to home page
    }, 1500);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Login failed. Please check your credentials.');
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
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input 
              className="form-input"
              placeholder="Email Address" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              className="form-input"
              placeholder="Password"
            />
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