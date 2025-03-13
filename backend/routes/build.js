// backend/routes/buildRoutes.js
const express = require('express');
const router = express.Router();
const buildController = require('../controllers/buildController');
const auth = require('../middleware/authMiddleware');

// Component selection
router.post('/components/:type', auth, buildController.getComponents);

// Build management
router.post('/builds', auth, buildController.createBuild);
router.get('/builds/:id', auth, buildController.getBuild);
router.put('/builds/:id', auth, buildController.updateBuild);
router.delete('/builds/:id', auth, buildController.deleteBuild);

// Compatibility & Sharing
router.post('/builds/check-compatibility', auth, buildController.checkCompatibility);
router.put('/builds/:id/share', auth, buildController.shareBuild);

module.exports = router;