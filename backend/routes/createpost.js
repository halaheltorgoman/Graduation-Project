const express = require("express");
const router = express.Router();
const { postStorage } = require("../config/cloudinary");
const multer = require("multer");
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

const uploadPostImages = multer({
  storage: postStorage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpe?g|png|webp)$/i)) {
      return cb(new Error("Only JPEG, PNG, or WebP images are allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
}).array("images", 5);

// Custom error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB per file.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 5 files allowed.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field. Only 'images' field is allowed.",
      });
    }
  } else if (err.message === "Only JPEG, PNG, or WebP images are allowed") {
    return res.status(400).json({
      success: false,
      message:
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
    });
  }

  // Pass other errors to the next middleware
  next(err);
};

router.post(
  "/create",
  authMiddleware,
  uploadPostImages,
  handleMulterError,
  postController.createPost
);

module.exports = router;
