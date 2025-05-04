const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middleware/userAuth');


router.get('/', utcommunityController.getSharedBuilds);
router.get('/:buildId', communityController.getSharedBuildDetails);

router.post('/:buildId/comment', authMiddleware, communityController.addComment);
router.post('/:buildId/rate', authMiddleware, communityController.rateBuild);
router.post('/:buildId/save', authMiddleware, communityController.saveBuild);

module.exports = router;