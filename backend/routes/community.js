const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authMiddleware = require('../middleware/userAuth');


router.get('/', communityController.getSharedBuilds);
router.get('/:postId', communityController.getSharedBuildDetails);
router.get('/:postId/getcomments', communityController.getComments);

router.post('/:postId/comment', authMiddleware, communityController.addComment);
router.post('/:postId/rate', authMiddleware, communityController.rateBuild);
router.post('/:postId/save-post', authMiddleware, communityController.savePost);
router.delete('/:postId/unsave-post', authMiddleware, communityController.unsavePost);



module.exports = router;