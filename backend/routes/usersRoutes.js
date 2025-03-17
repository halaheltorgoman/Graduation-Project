const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const usersRouter = express.Router();
const userAuth = require("../middleware/userAuth");

// Protected routes (require authentication)

usersRouter.get("/data", userAuth, userController.getUserData);

usersRouter.get("/profile", authMiddleware, userController.getProfile);
usersRouter.put("/profile", authMiddleware, userController.updateProfile);


module.exports = usersRouter;
