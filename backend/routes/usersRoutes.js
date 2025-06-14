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
usersRouter.get(
  "/completed",
  authMiddleware,
  userController.getUserCompletedBuilds
);

usersRouter.get("/:username", authMiddleware, userController.getUserProfile);

usersRouter.put(
  "/avatar",
  authMiddleware,
  uploadProfile.single("avatar"),
  userController.updateAvatar
);
usersRouter.put(
  "/me/profile",
  authMiddleware,
  uploadProfile.single("avatar"),
  userController.updateMyProfile
);
usersRouter.get(
  "/completed",
  authMiddleware,
  userController.getUserCompletedBuilds
);
module.exports = usersRouter;
