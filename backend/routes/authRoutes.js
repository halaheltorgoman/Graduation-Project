const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const authRouter = express.Router();

// Public routes
authRouter.post("/signup", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/send-verify-otp", authController.sendVerifyOtp);
authRouter.post("/verify-account", authController.verifyAccount);
authRouter.get("/user-info", authController.getUserInfo);
authRouter.post("/is-auth", authMiddleware, authController.isAuthenticated);
authRouter.post("/send-reset-otp", authController.sendResetOtp);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.get("/me", authMiddleware, authController.getMe);

module.exports = authRouter;
