const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middleware/userAuth');


router.get('/', communityController.getSharedBuilds);
router.get('/:postId', communityController.getSharedBuildDetails);

router.post('/:postId/comment', authMiddleware, communityController.addComment);
router.post('/:postId/rate', authMiddleware, communityController.rateBuild);
router.post('/:postId/save', authMiddleware, communityController.saveBuild);
router.get('/:postId/getcomments', getComments);

module.exports = router;