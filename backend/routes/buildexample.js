const express = require('express');
const router = express.Router();
const buildController = require('../controllers/buildexample');
const authMiddleware = require('../middleware/userAuth');

// Create a new build
router.post('/', authMiddleware, buildController.createBuild);

// Get user's builds (optional)
//router.get('/', authMiddleware, buildController.getUserBuilds);

module.exports = router;