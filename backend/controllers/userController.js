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

exports.getSavedBuilds = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(req.userId)
      .select('savedBuilds')
      .populate({
        path: 'savedBuilds',
        populate: [
          { path: 'user', select: 'username profilepic' },
          { path: 'components.cpu', select: 'name image_source' },
          { path: 'components.gpu', select: 'name image_source' },
          { path: 'components.cooler', select: 'name image_source' },
          { path: 'components.memory', select: 'name image_source' },
          { path: 'components.motherboard', select: 'name image_source' },
          { path: 'components.psu', select: 'name image_source' },
          { path: 'components.storage', select: 'name image_source' },
          { path: 'components.case', select: 'name image_source' },
        ],
        options: {
          skip: parseInt(skip),
          limit: parseInt(limit),
          sort: { createdAt: -1 }
        }
      });
    const totalCount = await User.findById(req.userId)
      .then(user => user.savedBuilds.length);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      totalSaved: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      savedBuilds: user.savedBuilds.map(build => ({
        _id: build._id,
        title: build.title,
        description: build.description,
        createdAt: build.createdAt,
        user: {
          _id: build.user._id,
          username: build.user.username,
          profilepic: build.user.profilepic
        },
        components: {
          cpu: build.components.cpu?.name,
          gpu: build.components.gpu?.name,
          gpu: build.components.cooler?.name,
          gpu: build.components.memory?.name,
          gpu: build.components.motherboard?.name,
          gpu: build.components.psu?.name,
          gpu: build.components.storage?.name,
          gpu: build.components.case?.name
          
        },
        images: build.images,
        savesCount: build.savesCount
      }))
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved builds',
      error: err.message
    });
  }
};
