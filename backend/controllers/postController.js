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

// In your communityController.js

exports.getAllPosts = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || '-createdAt';
    const validSortFields = ['createdAt', 'savesCount', 'commentsCount', 'averageRating'];
    const sortField = sortBy.replace(/^-/, '');
    const sortOrder = sortBy.startsWith('-') ? -1 : 1;
    
    if (!validSortFields.includes(sortField)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort field'
      });
    }

    // Filtering
    const filter = {};
    if (req.query.hasBuild === 'true') {
      filter.build = { $exists: true, $ne: null };
    } else if (req.query.hasBuild === 'false') {
      filter.build = null;
    }

    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    // Search
    if (req.query.search) {
      filter.$or = [
        { text: { $regex: req.query.search, $options: 'i' } },
        { 'build.title': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [posts, total] = await Promise.all([
      CommunityPost.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username avatar')
        .populate({
          path: 'build',
          populate: {
            path: 'components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler',
            select: 'title image_source'
          }
        })
        .populate('comments.user', 'username avatar')
        .lean(),
      CommunityPost.countDocuments(filter)
    ]);

    // Check if user has saved each post
    let postsWithSaveStatus = posts;
    if (req.userId) {
      const user = await User.findById(req.userId).select('savedPosts');
      postsWithSaveStatus = posts.map(post => ({
        ...post,
        isSaved: user.savedPosts.includes(post._id)
      }));
    }

    res.json({
      success: true,
      posts: postsWithSaveStatus.map(post => ({
        _id: post._id,
        text: post.text,
        images: post.images,
        createdAt: post.createdAt,
        savesCount: post.savesCount,
        commentsCount: post.comments.length,
        averageRating: post.averageRating || 0,
        isSaved: post.isSaved || false,
        user: {
          _id: post.user._id,
          username: post.user.username,
          avatar: post.user.avatar?.url
        },
        build: post.build ? {
          _id: post.build._id,
          title: post.build.title,
          components: {
            cpu: post.build.components.cpu?.title,
            gpu: post.build.components.gpu?.title,
            motherboard: post.build.components.motherboard?.title,
            memory: post.build.components.memory?.title,
            storage: post.build.components.storage?.title,
            psu: post.build.components.psu?.title,
            case: post.build.components.case?.title,
            cooler: post.build.components.cooler?.title
          }
        } : null
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: err.message
    });
  }
};