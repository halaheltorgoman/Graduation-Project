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

usersRouter.get("/profile", userAuth, userController.getProfile);
usersRouter.put("/profile", userAuth, userController.updateProfile);
usersRouter.get('/saved-builds', userAuth, userController.getSavedBuilds);
usersRouter.put(
  '/avatar',userAuth,
  uploadProfile.single('avatar'),
  userController.updateAvatar
);




module.exports = usersRouter;
