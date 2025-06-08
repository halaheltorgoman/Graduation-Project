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

router.post(
  "/create",
  authMiddleware,
  uploadPostImages,
  postController.createPost
);

module.exports = router;
