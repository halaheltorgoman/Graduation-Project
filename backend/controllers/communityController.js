const CommunityPost = require('../models/CommunityPost');
const Build = require('../models/Build');
const User = require('../models/User');

exports.getSharedBuilds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await CommunityPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username')
      .populate({
        path: 'build',
        populate: {
          path: 'components.cpu components.gpu components.motherboard'
        }
      })
      .populate('ratings.user', 'username')
      .populate('comments.user', 'username');

    const total = await CommunityPost.countDocuments();

    res.json({
      success: true,
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community posts',
      error: err.message
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      user: req.userId,
      text
    });

    await post.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: err.message
    });
  }
};

exports.rateBuild = async (req, res) => {
  try {
    const { postId } = req.params;
    const { value } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existingRating = post.ratings.find(r => r.user.equals(req.userId));
    if (existingRating) {
      existingRating.value = value;
    } else {
      post.ratings.push({
        user: req.userId,
        value
      });
    }

    const sum = post.ratings.reduce((acc, curr) => acc + curr.value, 0);
    post.averageRating = sum / post.ratings.length;

    await post.save();

    res.json({
      success: true,
      message: 'Post rated successfully',
      averageRating: post.averageRating,
      userRating: value
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to rate post',
      error: err.message
    });
  }
};

exports.saveBuild = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Find the community post
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        $addToSet: { 
          savedBuilds: post.build 
        } 
      },
      { new: true } 
    );

  
    post.savesCount += 1;
    await post.save();

    res.json({
      success: true,
      message: 'Build saved to your profile',
      savedBuilds: user.savedBuilds 
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to save build',
      error: err.message
    });
  }
};

exports.removeSavedBuild = async (req, res) => {
  try {
    const { buildId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        $pull: { 
          savedBuilds: buildId 
        } 
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Build removed from saved builds',
      savedBuilds: user.savedBuilds
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved build',
      error: err.message
    });
  }
};
exports.getSharedBuildDetails = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId)
      .populate('user', 'username')
      .populate({
        path: 'build',
        populate: {
          path: 'components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler'
        }
      })
      .populate('ratings.user', 'username')
      .populate('comments.user', 'username');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    let userRating = null;
    if (req.userId) {
      const rating = post.ratings.find(r => r.user._id.equals(req.userId));
      if (rating) userRating = rating.value;
    }

    res.json({
      success: true,
      post,
      userRating
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to get post details',
      error: err.message
    });
  }
};