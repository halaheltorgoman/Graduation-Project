const User = require("../models/User");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer.js");
const bcrypt = require("bcrypt");
require("dotenv").config();

const sendEmail = require("../utils/WelcomeEmailSender.js");

//const { JWT_SECRET } = require("../config");

const createToken = (userId) => {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// register a new user
exports.register = async (req, res) => {
  //get name , email and password from request body(destructed object)
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    //if user email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, Message: "User already exists" });
    }
    //if user email doesnot exist (new user)
    const hashedPassword = await bcrypt.hash(password, 10);
    //create a new user
    const user = new User({ username, email, password: hashedPassword });
    //save new user in database
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send welcome email with HTML template
    await sendEmail(email, "🎉 Welcome to PCSmith!", "welcomeEmail.html", {
      email,
    });

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// login user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  //missing email or password
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and Password are required",
    });
  }
  try {
    //checks if user email is available
    const user = await User.findOne({ email });
    //if user doesnot exist (email not found)
    if (!user) {
      return res.json({ success: false, message: "Invalid Email" });
    }
    //checks if password user entered match password in database
    const isMatch = await bcrypt.compare(password, user.password);
    //passwords didnot match
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//sending verification OTP to user's Email
exports.sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }
    const OTP = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = OTP;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${OTP} Verify your account using this OTP`,
    };
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Verification OTP sent on Email",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//verify user's Email
exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!userId || !OTP) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== OTP) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Email Verified Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//check if user is authenticated
exports.isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//send password reset OTP
exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.json({ success: false, message: "User not found" });
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = OTP;
    user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is ${OTP}. 
      Use this OTP to proceed with resetting your password `,
    };

    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "OTP has been sent to your email",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//reset user password
exports.resetPassword = async (req, res) => {
  const { email, OTP, newPassword } = req.body;

  if (!email || !OTP || !newPassword) {
    return res.json({
      success: false,
      message: "Email , OTP and new Password are required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!email) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== OTP) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpiredAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiredAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
