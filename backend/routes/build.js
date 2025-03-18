const express = require('express');
const router = express.Router();
const buildController = require('../controllers/buildController');
const authMiddleware = require('../middleware/userAuth');

// Builder workflow endpoints
router.post('/next-components', authMiddleware, buildController.getNextComponents);
router.post('/validate', authMiddleware, buildController.validateBuild);
router.post('/save', authMiddleware, buildController.saveBuild);
// router.put('/:buildId/share', builderController.shareBuild);

module.exports = router;