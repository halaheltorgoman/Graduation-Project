const CommunityPost = require('../models/CommunityPost');
const Build = require('../models/Build');
const { cloudinary } = require('../config/cloudinary');

exports.createPost = async (req, res) => {
  try {
    const { text, buildId } = req.body;
    

    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post text is required' 
      });
    }

    if (buildId) {
      const build = await Build.findOne({ 
        _id: buildId, 
        user: req.userId 
      });
      if (!build) {
        return res.status(403).json({ 
          success: false, 
          message: 'Build not found or unauthorized' 
        });
      }
    }

    const images = req.files?.map(file => ({
      public_id: file.public_id,
      url: file.path
    })) || [];

    const post = await CommunityPost.create({
      user: req.userId,
      text,
      images,
      build: buildId || null
    });

    // Populate user details in response
    const populatedPost = await CommunityPost.findById(post._id)
      .populate('user', 'username avatar')
      .populate('build', 'title');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        _id: populatedPost._id,
        text: populatedPost.text,
        images: populatedPost.images,
        build: populatedPost.build,
        user: {
          _id: populatedPost.user._id,
          username: populatedPost.user.username,
          avatar: populatedPost.user.avatar
        },
        createdAt: populatedPost.createdAt
      }
    });

  } catch (err) {
    // Cleanup uploaded images if error occurs
    if (req.files?.length) {
      await Promise.all(
        req.files.map(file => 
          cloudinary.uploader.destroy(file.public_id)
        )
      );
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: err.message
    });
  }
};