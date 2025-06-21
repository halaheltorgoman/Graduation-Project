const Post = require("../models/Post");
const Build = require("../models/Build");
const User = require("../models/User");
const mongoose = require("mongoose");

// Updated getSharedBuilds function in communityController.js
// Updated getSharedBuilds function with proper avatar population
exports.getSharedBuilds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Handle sorting
    let sort = { createdAt: -1 }; // Default: newest first
    if (req.query.sortBy) {
      if (req.query.sortBy === "createdAt") {
        sort = { createdAt: 1 }; // Oldest first
      } else if (req.query.sortBy === "-averageRating") {
        sort = { averageRating: -1 }; // Highest rated
      } else if (req.query.sortBy === "averageRating") {
        sort = { averageRating: 1 }; // Lowest rated
      }
    }

    const posts = await Post.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("user", "username avatar") // Ensure avatar is populated
      .populate({
        path: "build",
        populate: {
          path: "components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler",
        },
      })
      .populate("ratings.user", "username")
      .populate("comments.user", "username avatar"); // Include avatar for comments

    const total = await Post.countDocuments(query);

    // Transform posts to ensure consistent avatar structure
    const transformedPosts = posts.map((post) => {
      const postObj = post.toObject();

      // Ensure user avatar is properly structured
      if (postObj.user && postObj.user.avatar) {
        // If avatar is stored as an object with url property
        if (
          typeof postObj.user.avatar === "object" &&
          postObj.user.avatar.url
        ) {
          postObj.user.avatar = postObj.user.avatar.url;
        }
      }

      // Also fix comment avatars if they exist
      if (postObj.comments && postObj.comments.length > 0) {
        postObj.comments = postObj.comments.map((comment) => {
          if (comment.user && comment.user.avatar) {
            if (
              typeof comment.user.avatar === "object" &&
              comment.user.avatar.url
            ) {
              comment.user.avatar = comment.user.avatar.url;
            }
          }
          return comment;
        });
      }

      return postObj;
    });

    // Debug: Log the first post's user data to check avatar
    if (transformedPosts.length > 0) {
      console.log("First post user data:", {
        userId: transformedPosts[0].user._id,
        username: transformedPosts[0].user.username,
        avatar: transformedPosts[0].user.avatar,
        avatarType: typeof transformedPosts[0].user.avatar,
      });
    }

    res.json({
      success: true,
      posts: transformedPosts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (err) {
    console.error("Error in getSharedBuilds:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch community posts",
      error: err.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    post.comments.push({
      user: req.userId,
      text,
      createdAt: Date.now(),
    });

    await post.save();
    const updatedPost = await Post.findById(postId).populate({
      path: "comments.user",
      select: "username avatar", // Include any other user fields you want
    });
    const newComment = updatedPost.comments.find(
      (comment) =>
        comment._id.toString() ===
        post.comments[post.comments.length - 1]._id.toString()
    );

    res.json({
      success: true,
      message: "Comment added successfully",
      comment: {
        _id: newComment._id,
        text: newComment.text,
        createdAt: newComment.createdAt,
        user: {
          _id: newComment.user._id,
          username: newComment.user.username,
          avatar: newComment.user.avatar,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: err.message,
    });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const post = await Post.findById(postId).populate({
      path: "comments.user",
      select: "username profile avatar",
    });

    // Sort comments: newest first
    const sortedComments = post.comments.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      comments: sortedComments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get comments",
      error: err.message,
    });
  }
};

exports.getSharedBuildDetails = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("user", "username")
      .populate({
        path: "build",
        populate: {
          path: "components.cpu components.gpu components.motherboard components.memory components.storage components.psu components.case components.cooler",
        },
      })
      .populate("ratings.user", "username")
      .populate("comments.user", "username");

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    let userRating = null;
    if (req.userId) {
      const rating = post.ratings.find((r) => r.user._id.equals(req.userId));
      if (rating) userRating = rating.value;
    }

    res.json({
      success: true,
      post,
      userRating,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get post details",
      error: err.message,
    });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if post is already saved
    const alreadySaved = user.savedPosts.some(
      (savedPostId) => savedPostId.toString() === postId.toString()
    );

    if (alreadySaved) {
      return res.status(200).json({
        success: true,
        message: "Post already saved",
        savesCount: post.savesCount || 0,
      });
    }

    // Add post to user's SavedPosts
    user.savedPosts.push(postId);
    await user.save();

    // Increment savesCount
    post.savesCount = (post.savesCount || 0) + 1;
    await post.save();

    res.json({
      success: true,
      message: "Post saved successfully",
      savesCount: post.savesCount,
    });
  } catch (err) {
    console.error("Error saving post:", err);
    res.status(500).json({
      success: false,
      message: "Failed to save post",
      error: err.message,
    });
  }
};

exports.removeSavedPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find and remove post from SavedPosts
    const postIndex = user.savedPosts.findIndex(
      (savedPostId) => savedPostId.toString() === postId.toString()
    );

    if (postIndex === -1) {
      return res.status(200).json({
        success: true,
        message: "Post was not saved",
        savesCount: post.savesCount || 0,
      });
    }

    user.savedPosts.splice(postIndex, 1);
    await user.save();

    // Decrement savesCount (but not below 0)
    post.savesCount = Math.max(0, (post.savesCount || 0) - 1);
    await post.save();

    res.json({
      success: true,
      message: "Post removed from saved",
      savesCount: post.savesCount,
    });
  } catch (err) {
    console.error("Error removing saved post:", err);
    res.status(500).json({
      success: false,
      message: "Failed to remove saved post",
      error: err.message,
    });
  }
};

// exports.getSavedPosts = async (req, res) => {
//   try {
//     // Use either req.user._id (recommended) or req.body.userId
//     const userId = req.userId;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "User ID not found in request",
//       });
//     }

//     const user = await User.findById(userId).populate("savedPosts").exec();

//     res.json({
//       success: true,
//       savedPosts: user.savedPosts || [],
//     });
//   } catch (error) {
//     console.error("Error fetching saved posts:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch saved posts",
//     });
//   }
// };
// controllers/communityController.js
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User ID not found in request" });
    }

    const user = await User.findById(userId)
      .populate({
        path: "savedPosts",
        populate: [
          {
            path: "build",
            populate: {
              path: "components",
              populate: {
                path: "cpu gpu motherboard case cooler memory storage psu",
              },
            },
          },
          { path: "user", select: "username avatar" },
          {
            path: "comments",
            populate: { path: "user", select: "username" },
          },
        ],
      })
      .exec();

    console.log(
      "Populated savedPosts with components:",
      JSON.stringify(user.savedPosts?.[0]?.build?.components, null, 2)
    );

    res.json({
      success: true,
      savedPosts: user.savedPosts || [],
    });
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved posts",
    });
  }
};

exports.rateBuild = async (req, res) => {
  try {
    const { postId } = req.params;
    let { value } = req.body;

    // Validate and normalize the rating value
    value = parseFloat(value);
    if (isNaN(value) || value < 0.5 || value > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0.5 and 5",
      });
    }

    // Round to nearest 0.5
    value = Math.round(value * 2) / 2;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check for existing rating
    const existingRatingIndex = post.ratings.findIndex((r) =>
      r.user.equals(req.userId)
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      post.ratings[existingRatingIndex].value = value;
    } else {
      // Add new rating
      post.ratings.push({
        user: req.userId,
        value,
      });
    }

    // Calculate new average
    const sum = post.ratings.reduce((acc, curr) => acc + curr.value, 0);
    post.averageRating = sum / post.ratings.length;
    post.ratingsCount = post.ratings.length;

    await post.save();

    res.json({
      success: true,
      averageRating: post.averageRating,
      userRating: value,
      ratingsCount: post.ratings.length,

      ratings: post.ratings, // Send the updated ratings array
    });
  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to rate post",
      error: err.message,
    });
  }
};
