const express = require("express");
const userController = require("../controllers/userController");
const usersRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { profileStorage } = require("../config/cloudinary");
const multer = require("multer");

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Order matters! More specific routes should come before parameterized routes

// Get user's completed builds
usersRouter.get(
  "/completed",
  authMiddleware,
  userController.getUserCompletedBuilds
);

// Update user's own profile (this is what your frontend is calling)
usersRouter.put(
  "/profile",
  authMiddleware,
  uploadProfile.single("avatar"),
  userController.updateMyProfile
);

// Update only avatar
usersRouter.put(
  "/avatar",
  authMiddleware,
  uploadProfile.single("avatar"),
  userController.updateAvatar
);

// Get user profile by username (this should be last because it has a parameter)
usersRouter.get("/:username", authMiddleware, userController.getUserProfile);

module.exports = usersRouter;
