const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
//const authMiddleware = require('../middleware/authMiddleware');
const authMiddleware = require('../middleware/userAuth');

// Public routes
router.get('/', communityController.getSharedBuilds);
router.get('/:id', communityController.getBuildDetails);


// Protected routes

router.post('/:id/share', authMiddleware, communityController.shareBuild);
router.post('/:id/comments', authMiddleware, communityController.addComment);
router.post('/:id/ratings', authMiddleware, communityController.addRating);
router.post('/:id/save', authMiddleware, communityController.saveBuild);

module.exports = router;