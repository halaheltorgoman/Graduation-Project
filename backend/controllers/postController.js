// const Post = require("../models/Post");
// const Build = require("../models/Build");
// const { cloudinary } = require("../config/cloudinary");

// exports.createPost = async (req, res) => {
//   try {
//     const { text, buildId } = req.body;
//     console.log("BODY:", req.body);
//     console.log("FILES:", req.files);
//     // Require at least text or buildId
//     if (!text && !buildId) {
//       return res.status(400).json({
//         success: false,
//         message: "Post must have text or a build.",
//       });
//     }

//     let build = null;
//     if (buildId) {
//       build = await Build.findOne({
//         _id: buildId,
//         user: req.userId,
//       });
//       if (!build) {
//         return res.status(403).json({
//           success: false,
//           message: "Build not found or unauthorized",
//         });
//       }
//     }

//     // Handle images (if any)
//     const images =
//       req.files?.map((file) => ({
//         public_id: file.public_id,
//         url: file.path,
//       })) || [];

//     // Create the post
//     const post = await Post.create({
//       user: req.userId,
//       text: text || "",
//       images,
//       build: build ? build._id : null,
//     });

//     // Populate user and build for response
//     const userWithSavedPosts = await User.findById(userId).populate({
//       path: "savedPosts",
//       populate: {
//         path: "user",
//         select: "username avatar",
//       },
//     });

//     res.status(201).json({
//       success: true,
//       message: "Post created successfully",
//       post: {
//         _id: populatedPost._id,
//         text: populatedPost.text,
//         images: populatedPost.images,
//         build: populatedPost.build,
//         user: {
//           _id: populatedPost.user._id,
//           username: populatedPost.user.username,
//           avatar: populatedPost.user.avatar,
//         },
//         createdAt: populatedPost.createdAt,
//       },
//     });
//   } catch (err) {
//     // Cleanup uploaded images if error occurs
//     if (req.files?.length) {
//       await Promise.all(
//         req.files.map((file) => cloudinary.uploader.destroy(file.public_id))
//       );
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to create post",
//       error: err.message,
//     });
//   }
// };
const Post = require("../models/Post");
const Build = require("../models/Build");
const User = require("../models/User"); // Missing import
const { cloudinary } = require("../config/cloudinary");

exports.createPost = async (req, res) => {
  try {
    const { text, buildId } = req.body;
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    // Require at least text or buildId
    if (!text && !buildId) {
      return res.status(400).json({
        success: false,
        message: "Post must have text or a build.",
      });
    }

    let build = null;
    if (buildId) {
      build = await Build.findOne({
        _id: buildId,
        user: req.userId,
      });
      if (!build) {
        return res.status(403).json({
          success: false,
          message: "Build not found or unauthorized",
        });
      }
    }

    // Handle images (if any)
    const images =
      req.files?.map((file) => ({
        public_id: file.filename, // Use filename instead of public_id for Cloudinary
        url: file.path,
      })) || [];

    // Create the post
    const post = await Post.create({
      user: req.userId,
      text: text || "",
      images,
      build: build ? build._id : null,
    });

    // Populate the post with user and build information
    const populatedPost = await Post.findById(post._id)
      .populate({
        path: "user",
        select: "username avatar",
      })
      .populate("build");

    // Remove the incorrect userWithSavedPosts query - it's unrelated to post creation
    // and uses undefined variables (userId instead of req.userId)

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: {
        _id: populatedPost._id,
        text: populatedPost.text,
        images: populatedPost.images,
        build: populatedPost.build,
        user: {
          _id: populatedPost.user._id,
          username: populatedPost.user.username,
          avatar: populatedPost.user.avatar,
        },
        createdAt: populatedPost.createdAt,
      },
    });
  } catch (err) {
    // Cleanup uploaded images if error occurs
    if (req.files?.length) {
      try {
        await Promise.all(
          req.files.map(
            (file) => cloudinary.uploader.destroy(file.filename) // Use filename instead of public_id
          )
        );
      } catch (cleanupError) {
        console.error("Error cleaning up images:", cleanupError);
      }
    }

    console.error("Error creating post:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: err.message,
    });
  }
};
