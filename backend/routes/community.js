const express = require("express");
const communityController = require("../controllers/communityController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// public route (no authentication required)
router.get("/shared", communityController.getSharedBuilds);

// protected routes (require authentication)
router.post("/save", authMiddleware, communityController.saveBuild);
router.post("/:id/rate", authMiddleware, communityController.rateBuild);
router.post("/:id/comment", authMiddleware, communityController.addComment);

module.exports = router;