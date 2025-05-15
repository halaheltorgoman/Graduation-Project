
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const { cloudinary } = require('../config/cloudinary');


require("dotenv").config();


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

exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    }).select('username avatar bio createdAt');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      profile: {
        username: user.username,
        avatar: user.avatar?.url || null,
        bio: user.bio || '',
        memberSince: user.createdAt
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.updateMyProfile = async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updates = {};

    if (username) {
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({
          success: false,
          message: 'Username must be 3-20 characters'
        });
      }
      updates.username = username;
    }

    if (bio !== undefined) {
      updates.bio = bio.substring(0, 150); 
    }

    if (req.file) {
      updates.avatar = {
        public_id: req.file.public_id,
        url: req.file.path
      };
    }

  
    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select('username avatar bio');

    if (!user) {
  
      if (req.file?.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id);
      }
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated',
      profile: {
        username: user.username,
        avatar: user.avatar?.url,
        bio: user.bio
      }
    });

  } catch (err) {

    if (req.file?.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id);
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Profile update failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


exports.updateAvatar = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
   
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
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
          url: req.file.path
        }
      },
      { new: true }
    ).select('avatar username');

    res.json({
      success: true,
      message: 'Avatar updated',
      avatar: updatedUser.avatar.url,
      username: updatedUser.username
    });

  } catch (err) {
 
    if (req.file?.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update avatar',
      error: err.message
    });
  }
};

exports.getSavedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(req.userId)
      .select('savedPosts')
      .populate({
        path: 'savedPosts',
        populate: [
          { path: 'user', select: 'username avatar' },
          { 
            path: 'build', 
            populate: {
              path: 'components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler',
              select: 'name image_source'
            }
          }
        ],
        options: {
          skip: parseInt(skip),
          limit: parseInt(limit),
          sort: { createdAt: -1 }
        }
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const totalCount = await User.findById(req.userId)
      .then(user => user.savedPosts.length);

    res.json({
      success: true,
      totalSaved: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      savedPosts: user.savedPosts.map(post => ({
        _id: post._id,
        text: post.text,
        images: post.images,
        createdAt: post.createdAt,
        savesCount: post.savesCount,
        commentsCount: post.comments.length,
        averageRating: post.averageRating,
        user: {
          _id: post.user._id,
          username: post.user.username,
          avatar: post.user.avatar?.url
        },
        build: post.build ? {
          _id: post.build._id,
          title: post.build.title,
          components: {
            cpu: post.build.components.cpu?.name,
            gpu: post.build.components.gpu?.name,
            motherboard: post.build.components.motherboard?.name,
            memory: post.build.components.memory?.name,
            storage: post.build.components.storage?.name,
            psu: post.build.components.psu?.name,
            case: post.build.components.case?.name,
            cooler: post.build.components.cooler?.name
          }
        } : null
      }))
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved posts',
      error: err.message
    });
  }
};

exports.getUserBuilds = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    }).select('username avatar builds');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    const builds = await Build.find({ _id: { $in: user.builds } })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({
        path: 'components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler',
        select: 'title image_source price'
      })
      .lean();

    const buildsWithPrices = builds.map(build => {
      let totalPrice = 0;
      Object.values(build.components).forEach(component => {
        if (component && component.price) {
          totalPrice += component.price;
        }
      });
      return {
        ...build,
        totalPrice
      };
    });
    const totalCount = user.builds.length;

    res.json({
      success: true,
      builds: buildsWithPrices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalBuilds: totalCount
      },
      user: {
        username: user.username,
        avatar: user.avatar?.url || null
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user builds',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};