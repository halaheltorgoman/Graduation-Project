// routes/guides.js - CORRECTED ORDER
const guideController = require("../controllers/guideController");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// SPECIFIC routes must come FIRST (before parameterized routes)
// Remove the genres route since we're no longer using genres
router.get("/saved", authMiddleware, guideController.getSavedGuides);

// Build-related routes (specific IDs)
router.post(
  "/:buildId/convert-to-guide",
  authMiddleware,
  guideController.isAdmin,
  guideController.convertToGuide
);

// Rating route - Fixed to use guideId instead of buildId
router.post("/:guideId/rate", authMiddleware, guideController.rateGuide);

// Save/unsave guide route
router.post("/:guideId/save", authMiddleware, guideController.toggleSaveGuide);

// Get single guide by ID (this should come BEFORE category route)
router.get("/:id([0-9a-fA-F]{24})", guideController.getGuideById); // MongoDB ObjectId pattern

// CATEGORY route must be LAST (catches everything else)
router.get("/:category", guideController.getGuidesByCategory);

module.exports = router;
