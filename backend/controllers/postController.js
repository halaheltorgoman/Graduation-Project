const Post = require("../models/Post");
const Build = require("../models/Build");
const User = require("../models/User");
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

    const images =
      req.files?.map((file) => ({
        public_id: file.filename,
        url: file.path,
      })) || [];

    const post = await Post.create({
      user: req.userId,
      text: text || "",
      images,
      build: build ? build._id : null,
    });

    const populatedPost = await Post.findById(post._id)
      .populate({
        path: "user",
        select: "username avatar",
      })
      .populate("build");

    // Transform the response to ensure avatar is a string URL
    const responsePost = {
      id: populatedPost.id,
      text: populatedPost.text,
      images: populatedPost.images,
      build: populatedPost.build,
      user: {
        id: populatedPost.user.id,
        username: populatedPost.user.username,
        avatar:
          populatedPost.user.avatar &&
          typeof populatedPost.user.avatar === "object"
            ? populatedPost.user.avatar.url
            : populatedPost.user.avatar,
      },
      createdAt: populatedPost.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: responsePost,
    });
  } catch (err) {
    if (req.files?.length) {
      try {
        await Promise.all(
          req.files.map((file) => cloudinary.uploader.destroy(file.filename))
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
