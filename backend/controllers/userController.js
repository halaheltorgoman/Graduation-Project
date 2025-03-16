const { MongoClient } = require("mongodb");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config()
//const { JWT_SECRET } = require("../config");

const createToken=(userId)=>{
return jwt.sign({userId:userId},process.env.JWT_SECRET,{expiresIn:"30d"})
};
// register a new user
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "email already exists" });
    }

    // create new user
    const user = new User({ username, email, password });
    await user.save();

    // generate JWT token
    const token = createToken(user._id) //_id is for mongodb and userId is for jwt

    res.status(201).json({ token,email });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // find existing user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate JWT token
    const token = createToken(user._id)

    res.json({ token, email });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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
/* exports.addFavorite = async (req, res) => {
  const { componentId, modelName} = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFavorited = user.favorites.some(fav =>
      fav.item.equals(componentId) && fav.onModel === modelName
    );

    // add component to favorites if not already added
    if (!alreadyFavorited) {
      user.favorites.push({item: componentId, onModel: modelName});
      await user.save();
    }

    res.json({ message: "Component added to favorites", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}; */


