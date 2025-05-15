const express = require("express");
const userController = require("../controllers/userController");
const usersRouter = express.Router();
const userAuth = require("../middleware/userAuth");
const { profileStorage } = require('../config/cloudinary');
const multer = require('multer');
const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

usersRouter.get("/data", userAuth, userController.getUserData);
usersRouter.get('/:username', userAuth, userController.getUserProfile);
usersRouter.get('/saved-posts', userAuth, userController.getSavedPosts);
usersRouter.get('/:username/builds', userAuth, userController.getUserBuilds);
usersRouter.put(
  '/avatar',userAuth,
  uploadProfile.single('avatar'),
  userController.updateAvatar
);
usersRouter.put(
  '/me/profile',
  userAuth, 
  uploadProfile.single('avatar'), 
  userController.updateMyProfile 
);




module.exports = usersRouter;
