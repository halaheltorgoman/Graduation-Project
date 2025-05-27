import React from "react";
import { Button, Checkbox, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import logo from "../../assets/images/logo.svg";

const Signup = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log('Success:', values);
    message.success('Account created successfully! Redirecting...');
    setTimeout(() => {
      navigate('/verify-signup-email');
    }, 1500);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Signup failed. Please check your information.');
  };

  return (
    <div className="signup-container">
             <Link to="/">
        <img 
          src={logo} 
          alt="PC Smith Logo" 
          className="verifyforgotpassword-logo"
        />
      </Link>
      <div className="signup-title-container">
        <h1 className="signup-title">Create Account</h1>
      </div>
      
      <div className="signup-form-container">
        <Form
          name="signup"
          className="signup-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <h2 className="form-title">Sign Up</h2>
          
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              className="form-input"
              placeholder="Username" 
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ 
              required: true, 
              type: 'email',
              message: 'Please input a valid email!' 
            }]}
          >
            <Input 
              className="form-input"
              placeholder="Email Address" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ 
              required: true, 
              message: 'Please input your password!',
              pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
              message: 'Password must be 8+ chars with letters and numbers!'
            }]}
          >
            <Input.Password 
              className="form-input"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { 
                required: true, 
                message: 'Please confirm your password!' 
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              className="form-input"
              placeholder="Confirm Password"
            />
          </Form.Item>

          <p className="password-requirement-text">
            Password must be a combination of minimum 8 letters and numbers.
          </p>

          <div className="form-options">
            <Form.Item 
              name="remember" 
              valuePropName="checked"
              className="remember-me"
            >
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
          </div>

          <Form.Item>
            <Button 
              htmlType="submit" 
              className="signup-button"
            >
              Sign Up
            </Button>
          </Form.Item>
          
          <p className="login-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default Signup;