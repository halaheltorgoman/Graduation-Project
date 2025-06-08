// // // const express = require("express");
// // // const router = express.Router();
// // // const communityController = require("../controllers/communityController");

// // // const authMiddleware = require("../middleware/authMiddleware");
// // // const { upload } = require("../middleware/uploadMiddleware"); // For handling file uploads

// // // // Public routes
// // // router.get("/", communityController.getAllPosts);
// // // router.get("/:id", communityController.getPostById);

// // // // Protected routes that require authentication
// // // router.use(authMiddleware);

// // // // Post CRUD operations
// // // router.post("/", upload.array("images", 5), communityController.createPost);
// // // router.put("/:id", upload.array("images", 5), communityController.updatePost);
// // // router.delete("/:id", communityController.deletePost);

// // // // Post interactions
// // // router.post("/:id/comments", communityController.addComment);
// // // router.delete("/:id/comments/:commentId", communityController.deleteComment);
// // // router.post("/:id/ratings", communityController.addRating);
// // // router.post("/:id/bookmark", communityController.bookmarkPost);
// // // router.post("/:id/share", communityController.sharePost);

// // // // User-specific routes
// // // router.get("/me/bookmarks", communityController.getUserBookmarks);
// // // router.get("/user/:userId", communityController.getUserPosts);

// // // module.exports = router;
// // const express = require("express");
// // const router = express.Router();
// // const communityController = require("../controllers/communityController");
// // const authMiddleware = require("../middleware/authMiddleware");
// // const { upload } = require("../middleware/uploadMiddleware"); // For handling file uploads

// // router.get("/", communityController.getSharedBuilds);
// // router.get("/:postId", communityController.getSharedBuildDetails);

// // router.post("/:postId/comment", authMiddleware, communityController.addComment);
// // router.post("/:postId/rate", authMiddleware, communityController.rateBuild);
// // router.post("/:postId/save", authMiddleware, communityController.saveBuild);
// // router.post("/:postId/share", authMiddleware, communityController.sharePost);
// // router.delete(
// //   "/:postId/save",
// //   authMiddleware,
// //   communityController.removeSavedBuild
// // );
// // router.get("/:postId/comments", communityController.getComments);
// // router.post(
// //   "/",
// //   authMiddleware,
// //   upload.array("images", 5),
// //   communityController.createPost
// // );
// // module.exports = router;
// const express = require("express");
// const router = express.Router();
// const communityController = require("../controllers/communityController");
// const authMiddleware = require("../middleware/authMiddleware");
// const { upload } = require("../middleware/uploadMiddleware");

// // Public routes
// router.get("/", communityController.getSharedBuilds);
// router.get("/:postId", communityController.getSharedBuildDetails);
// router.get("/:postId/comments", communityController.getComments);

// // Protected routes
// router.use(authMiddleware);

// // Post CRUD operations
// router.post("/", upload.array("images", 5), communityController.createPost);

// // Post interactions
// router.post("/:postId/comment", communityController.addComment);
// router.post("/:postId/rate", communityController.rateBuild);
// router.post("/:postId/save", communityController.saveBuild);
// router.delete("/:postId/save", communityController.removeSavedBuild);
// router.post("/:postId/share", communityController.sharePost);

// module.exports = router;
// const express = require("express");
// const router = express.Router();
// const communityController = require("../controllers/communityController");
// const authMiddleware = require("../middleware/authMiddleware");
// const { upload } = require("../middleware/uploadMiddleware");

// // Public routes
// router.get("/", communityController.getSharedBuilds);
// router.get("/saved/:userId", communityController.getSavedBuilds);
// router.get("/:postId", communityController.getSharedBuildDetails);
// router.get("/:postId/comments", communityController.getComments);

// // Protected routes
// router.use(authMiddleware);

// // Post CRUD operations
// router.post("/", upload.array("images", 5), communityController.createPost);

// // Post interactions
// router.post("/:postId/comment", communityController.addComment);
// router.post("/:postId/rate", communityController.rateBuild);
// router.post("/:postId/save", communityController.saveBuild);
// router.delete("/:postId/save", communityController.removeSavedBuild);
// router.post("/:postId/share", communityController.sharePost);

// module.exports = router;
// const express = require("express");
// const router = express.Router();
// const communityController = require("../controllers/communityController");
// const authMiddleware = require("../middleware/authMiddleware");
// const { upload } = require("../middleware/uploadMiddleware");

// // Public routes
// router.get("/", communityController.getSharedBuilds);
// router.get("/saved/:userId", communityController.getSavedBuilds);
// router.get("/:postId", communityController.getSharedBuildDetails);
// router.get("/:postId/comments", communityController.getComments);

// // Protected routes
// router.use(authMiddleware);

// // Post CRUD operations
// router.post("/", upload.array("images", 5), communityController.createPost);

// // Post interactions
// router.post("/:postId/comment", communityController.addComment);
// router.post("/:postId/rate", communityController.rateBuild);
// router.post("/:postId/save", communityController.saveBuild);
// router.delete("/:postId/save", communityController.removeSavedBuild);
// router.post("/:postId/share", communityController.sharePost);

// module.exports = router;
//latest update
// const express = require("express");
// const router = express.Router();
// const communityController = require("../controllers/communityController");
// const authMiddleware = require("../middleware/authMiddleware");
// const { upload } = require("../middleware/uploadMiddleware");

// // Public routes
// router.get("/", communityController.getSharedBuilds);
// router.get("/saved/:userId", communityController.getSavedBuilds);
// router.get("/:postId", communityController.getSharedBuildDetails);
// router.get("/:postId/comments", communityController.getComments);

// // Protected routes
// router.use(authMiddleware);

// // Post CRUD operations
// router.post("/", upload.array("images", 5), communityController.createPost);

// // Post interactions
// router.post("/:postId/comment", communityController.addComment);
// router.post("/:postId/rate", communityController.rateBuild);
// router.post("/:postId/save", communityController.saveBuild);
// router.delete("/:postId/save", communityController.removeSavedBuild);
// router.post("/:postId/share", communityController.sharePost);

// module.exports = router;
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
