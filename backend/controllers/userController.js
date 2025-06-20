const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Build = require("../models/Build");
const { cloudinary } = require("../config/cloudinary");

require("dotenv").config();

exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    }).select("username avatar bio createdAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      profile: {
        username: user.username,
        avatar: user.avatar?.url || null,
        bio: user.bio || "",
        memberSince: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updates = {};

    // Get current user to check if username is actually changing
    const currentUser = await User.findById(req.userId).select("username");
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (username && username !== currentUser.username) {
      // Validate username format
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Username must be 3-30 characters",
        });
      }

      // Check if username contains only allowed characters
      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        return res.status(400).json({
          success: false,
          message:
            "Username can only contain letters, numbers, dots, hyphens and underscores",
        });
      }

      // Check if username already exists (case-insensitive)
      const existingUser = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") },
        _id: { $ne: req.userId },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }

      updates.username = username;
    }

    if (bio !== undefined) {
      updates.bio = bio.substring(0, 150);
    }

    if (req.file) {
      // If user has existing avatar, delete it from cloudinary
      if (currentUser.avatar?.public_id) {
        try {
          await cloudinary.uploader.destroy(currentUser.avatar.public_id);
        } catch (error) {
          console.error("Error deleting old avatar:", error);
        }
      }

      updates.avatar = {
        public_id: req.file.public_id,
        url: req.file.path,
      };
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select("username avatar bio");

    if (!user) {
      if (req.file?.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        username: user.username,
        avatar: user.avatar?.url,
        bio: user.bio,
      },
    });
  } catch (err) {
    if (req.file?.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id);
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image provided" });
    }

    const user = await User.findById(req.userId);
    if (user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        avatar: {
          public_id: req.file.public_id,
          url: req.file.path,
        },
      },
      { new: true }
    ).select("avatar username");

    res.json({
      success: true,
      message: "Avatar updated",
      avatar: updatedUser.avatar.url,
      username: updatedUser.username,
    });
  } catch (err) {
    if (req.file?.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id);
    }
    res.status(500).json({
      success: false,
      message: "Failed to update avatar",
      error: err.message,
    });
  }
};

exports.getUserCompletedBuilds = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get the user's completed build IDs
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const buildIds = user.builds || [];

    // Fetch only builds in the user's builds array
    const builds = await Build.find({ _id: { $in: buildIds } })
      .populate([
        "components.cpu",
        "components.gpu",
        "components.motherboard",
        "components.memory",
        "components.storage",
        "components.psu",
        "components.case",
        "components.cooler",
      ])
      .sort({ updatedAt: -1 });

    res.json({ success: true, builds });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch completed builds",
      error: err.message,
    });
  }
};
