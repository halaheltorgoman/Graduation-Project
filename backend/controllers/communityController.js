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
      text,
      createdAt: Date.now
    });

    await post.save();
    const updatedPost = await CommunityPost.findById(postId)
      .populate({
        path: 'comments.user',
        select: 'username avatar' // Include any other user fields you want
      });
      const newComment = updatedPost.comments.find(comment => 
        comment._id.toString() === post.comments[post.comments.length - 1]._id.toString()
      );
  

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: {
        _id: newComment._id,
        text: newComment.text,
        createdAt: newComment.createdAt,
        user: {
          _id: newComment.user._id,
          username: newComment.user.username,
          avatar: newComment.user.avatar
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: err.message
    });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { 
      page = 1,    
      limit = 10,    
      sort = '-createdAt' 
    } = req.query;

    const postExists = await CommunityPost.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    const post = await CommunityPost.findById(postId)
      .populate({
        path: 'comments.user',
        select: 'username profile avatar'
      })
      .select('comments')
      .slice('comments', [ 
        (page - 1) * limit, 
        parseInt(limit)
      ]);


    const formattedComments = post.comments
      .sort((a, b) => {
        if (sort === '-createdAt') return b.createdAt - a.createdAt;
        return a.createdAt - b.createdAt;
      })
      .map(comment => ({
        _id: comment._id,
        text: comment.text,
        createdAt: comment.createdAt,
        user: {
          _id: comment.user._id,
          username: comment.user.username,
          avatar: comment.user.avatar,
         
        }
      }));

    const commentCount = (await CommunityPost.findById(postId)).comments.length;

    res.json({
      success: true,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(commentCount / limit),
        totalComments: commentCount
      },
      comments: formattedComments
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
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
      userRating: value,
      totalRatings: post.ratings.length 
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to rate post',
      error: err.message
    });
  }
};

// Add these new controller functions

exports.savePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const user = await User.findById(req.userId);
    
    // Check if post is already saved
    if (user.savedPosts.includes(postId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post already saved' 
      });
    }

    // Add post to savedPosts
    user.savedPosts.push(postId);
    await user.save();

    // Update saves count on the post
    post.savesCount = await User.countDocuments({ savedPosts: postId });
    await post.save();

    res.json({
      success: true,
      message: 'Post saved successfully',
      totalSaves: post.savesCount
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to save post',
      error: err.message
    });
  }
};

exports.unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const [post, user] = await Promise.all([
      CommunityPost.findById(postId),
      User.findById(req.userId)
    ]);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Remove post from savedPosts
    const index = user.savedPosts.indexOf(postId);
    if (index === -1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post not found in saved items' 
      });
    }

    user.savedPosts.splice(index, 1);
    await user.save();

    // Update saves count on the post
    post.savesCount = await User.countDocuments({ savedPosts: postId });
    await post.save();

    res.json({
      success: true,
      message: 'Post removed from saved items',
      totalSaves: post.savesCount
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to unsave post',
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

