const { MongoClient } = require("mongodb");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

require("dotenv").config();

//const { JWT_SECRET } = require("../config");

const createToken = (userId) => {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.getUserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }
    res.json({
      success: true,
      useData: {
        username: user.username,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// update user profile
exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update fields
    user.username = username || user.username;
    user.email = email || user.email;
    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// add a component to favorites
exports.addFavorite = async (req, res) => {
  const { componentId, modelName } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFavorited = user.favorites.some(
      (fav) => fav.item.equals(componentId) && fav.onModel === modelName
    );

    // add component to favorites if not already added
    if (!alreadyFavorited) {
      user.favorites.push({ item: componentId, onModel: modelName });
      await user.save();
    }

    res.json({ message: "Component added to favorites", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// remove a component from favorites
exports.removeFavorite = async (req, res) => {
  const { componentId, modelName } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the favorite that matches both the componentId and modelName
    user.favorites = user.favorites.filter(
      (fav) => !(fav.item.equals(componentId) && fav.onModel === modelName)
    );
    await user.save();

    res.json({ message: "Component removed from favorites", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

