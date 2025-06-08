const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");
const authMiddleware = require("../middleware/authMiddleware");
router.get("/saved-posts", authMiddleware, communityController.getSavedPosts);
router.post("/:postId/save", authMiddleware, communityController.savePost);
router.get("/", communityController.getSharedBuilds);
router.get("/:postId", communityController.getSharedBuildDetails);
router.get("/:postId/getcomments", communityController.getComments);
// Add this line
router.post("/:postId/comment", authMiddleware, communityController.addComment);
router.post("/:postId/rate", authMiddleware, communityController.rateBuild);

router.delete(
  "/:postId/unsave",
  authMiddleware,
  communityController.removeSavedPost
);

module.exports = router;
