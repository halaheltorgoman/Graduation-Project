const User = require("../models/User");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer.js");
const bcrypt = require("bcrypt");
require("dotenv").config();

const sendEmail = require("../utils/WelcomeEmailSender.js");

// OTP Email Template
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Your Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333;">Account Verification</h2>
        <p style="font-size: 16px;">Your verification code is:</p>
        <div style="background: #f5f5f5; padding: 10px 15px; font-size: 24px; font-weight: bold; letter-spacing: 2px; display: inline-block; margin: 10px 0;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #777;">This code expires in 5 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};
const setAuthCookie = (res, user) => {
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation checks (keep existing validation)
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if user exists (keep existing checks)
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already in use",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with OTP fields
    const user = new User({
      username,
      email,
      password: hashedPassword,
      isAccountVerified: false,
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = otpExpiry;

    await user.save();

    // Send OTP email instead of welcome email
    const otpSent = await sendOTPEmail(user.email, otp);
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to email.",
      userId: user._id,
      userEmail: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// exports.register = async (req, res) => {
//   try {
//     const { username, email, password, confirmPassword } = req.body;

//     // Validation checks
//     if (!username || !email || !password || !confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Passwords do not match",
//       });
//     }

//     // Check if user exists
//     const existingEmail = await User.findOne({ email });
//     if (existingEmail) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already in use",
//       });
//     }

//     const existingUsername = await User.findOne({ username });
//     if (existingUsername) {
//       return res.status(400).json({
//         success: false,
//         message: "Username already in use",
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user (without OTP initially)
//     const user = new User({
//       username,
//       email,
//       password: hashedPassword,
//       isAccountVerified: false,
//     });

//     await user.save();

//     // Send welcome email only
//     await sendEmail(email, "🎉 Welcome to Our Service!", "welcomeEmail.html", {
//       username,
//       email,
//     });

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully. Welcome email sent.",
//       userId: user._id,
//       userEmail: user.email,
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
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
    if (!user.isAccountVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    //checks if password user entered match password in database
    const isMatch = await bcrypt.compare(password, user.password);
    //passwords didnot match
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password" });
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // If there's an existing session then associate it with the user
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      try {
        const ragService = require("../services/ragService");
        await ragService.associateSessionWithUser(sessionId, user._id);
      } catch (error) {
        console.error("Error associating session:", error);
        // Don't fail the login if session association fails
      }
    }

    res.json({
      success: true,
      message: "Logged in successfully",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
exports.logout = async (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

exports.sendVerifyOtp = async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account already verified",
      });
    }

    // If email is provided in request, update user's email
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another account",
        });
      }
      user.email = email;
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = otpExpiry;
    await user.save();

    // Send OTP email
    const otpSent = await sendOTPEmail(user.email, otp);
    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
      email: user.email,
    });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

exports.verifyAccount = async (req, res) => {
  try {
    const { userId, OTP } = req.body;

    if (!userId || !OTP) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account already verified",
      });
    }

    // Check if OTP matches and is not expired
    if (user.verifyOtp !== OTP || new Date() > user.verifyOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark account as verified and clear OTP fields
    user.isAccountVerified = true;
    user.verifyOtp = undefined;
    user.verifyOtpExpireAt = undefined;
    await user.save();

    // Set auth cookie after successful verification
    setAuthCookie(res, user);

    res.json({
      success: true,
      message: "Account verified successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify account",
    });
  }
};
// login user
//send password reset OTP
// exports.sendResetOtp = async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.json({ success: false, message: "Email is required" });
//   }
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       res.json({ success: false, message: "User not found" });
//     }

//     const OTP = String(Math.floor(100000 + Math.random() * 900000));
//     user.resetOtp = OTP;
//     user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000;
//     await user.save();

//     const mailOptions = {
//       from: process.env.SENDER_EMAIL,
//       to: user.email,
//       subject: "Password Reset OTP",
//       text: `Your OTP for resetting your password is ${OTP}.
//       Use this OTP to proceed with resetting your password `,
//     };

//     await transporter.sendMail(mailOptions);
//     return res.json({
//       success: true,
//       message: "OTP has been sent to your email",
//     });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };
// Send password reset OTP
exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const OTP = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = OTP;
    user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is ${OTP}. It is valid for 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "OTP has been sent to your email",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
// Verify the OTP
exports.verifyResetOtp = async (req, res) => {
  const { email, OTP } = req.body;

  if (!email || !OTP) {
    return res.json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== OTP) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpiredAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//reset user password
// exports.resetPassword = async (req, res) => {
//   const { email, OTP, newPassword } = req.body;

//   if (!email || !OTP || !newPassword) {
//     return res.json({
//       success: false,
//       message: "Email , OTP and new Password are required",
//     });
//   }
//   try {
//     const user = await User.findOne({ email });
//     if (!email) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     if (user.resetOtp === "" || user.resetOtp !== OTP) {
//       return res.json({ success: false, message: "Invalid OTP" });
//     }

//     if (user.resetOtpExpiredAt < Date.now()) {
//       return res.json({ success: false, message: "OTP Expired" });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     user.resetOtp = "";
//     user.resetOtpExpiredAt = 0;

//     await user.save();

//     return res.json({
//       success: true,
//       message: "Password has been reset successfully",
//     });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };
// Reset password after OTP verification
exports.resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res.json({ success: false, message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.json({ success: false, message: "Passwords do not match" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiredAt = null;

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const { id } = req.query;
    const user = await User.findById(id).select(
      "-password -verifyOtp -verifyOtpExpireAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
    });
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
