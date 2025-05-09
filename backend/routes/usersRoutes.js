const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const usersRouter = express.Router();
const userAuth = require("../middleware/userAuth");

usersRouter.get("/data", userAuth, userController.getUserData);

usersRouter.get("/profile", userAuth, userController.getProfile);
usersRouter.put("/profile", userAuth, userController.updateProfile);
usersRouter.get('/saved-builds', userAuth, getSavedBuilds);


module.exports = usersRouter;
