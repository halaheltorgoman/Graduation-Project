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
    const updatedPost = await CommunityPost.findById(postId)
      .populate({
        path: 'comments.user',
        select: 'username profilepic' // Include any other user fields you want
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
          profilepic: newComment.user.profilepic
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
          profilepic: comment.user.profilepic,
         
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

exports.saveBuild = async (req, res) => {
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
    if (user.savedBuilds.includes(post.build)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already saved this build' 
      });
    }

  
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { savedBuilds: post.build } },
      { new: true }
    );

    
    post.savesCount = await User.countDocuments({ 
      savedBuilds: post.build 
    });
    await post.save();

    res.json({
      success: true,
      message: 'Build saved to your profile',
      totalSaves: post.savesCount, 
      savedBuilds: updatedUser.savedBuilds
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

 
    const buildIndex = user.savedBuilds.indexOf(post.build);
    if (buildIndex === -1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Build not found in your saved items' 
      });
    }

   
    user.savedBuilds.splice(buildIndex, 1);
    await user.save();

  
    post.savesCount = await User.countDocuments({ savedBuilds: post.build });
    await post.save();

    res.json({
      success: true,
      message: 'Build removed from saved items',
      totalSaves: post.savesCount,
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