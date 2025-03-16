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
usersRouter.post("/favorites/add", authMiddleware, userController.addFavorite);
usersRouter.post(
  "/favorites/remove",
  authMiddleware,
  userController.removeFavorite
);

module.exports = usersRouter;
