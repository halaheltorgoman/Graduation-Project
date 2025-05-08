const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const authRouter = express.Router();
const userAuth = require("../middleware/userAuth");

// Public routes
authRouter.post("/signup", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/send-verify-otp", userAuth, authController.sendVerifyOtp);
authRouter.post("/verify-account", userAuth, authController.verifyEmail);
authRouter.post("/is-auth", userAuth, authController.isAuthenticated);
authRouter.post("/send-reset-otp", authController.sendResetOtp);
authRouter.post("/reset-password", authController.resetPassword);

module.exports = authRouter;
