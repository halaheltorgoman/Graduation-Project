const express = require("express");
const buildController = require("../controllers/buildController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Save build to profile (with optional sharing)
router.post("/", authMiddleware, buildController.createBuild);

// Share/unshare a build (before or after saving)
router.put("/:id/share", authMiddleware, buildController.shareBuild);

module.exports = router;