const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Public routes
router.post("/signup", userController.register);
router.post("/login", userController.login);

// Protected routes (require authentication)
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.post("/favorites/add", authMiddleware, userController.addFavorite);
router.post("/favorites/remove", authMiddleware, userController.removeFavorite);

module.exports = router;