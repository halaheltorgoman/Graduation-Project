const express = require("express"); // <-- THIS LINE IS REQUIRED
const router = express.Router();
const buildController = require("../controllers/buildController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/next-components",
  authMiddleware,
  buildController.getNextComponents
);
router.post("/validate", authMiddleware, buildController.validateBuild);
router.put(
  "/createbuild/:buildId/finalize",
  authMiddleware,
  buildController.finalizeBuild
);
router.post("/createbuild", authMiddleware, buildController.createBuild);
router.get(
  "/:buildId/price",
  authMiddleware,
  buildController.getBuildTotalPrice
);
router.get(
  "/user/completed",
  authMiddleware,
  buildController.getUserCompletedBuilds
);
// To this:

router.get(
  "/:buildId/reconfigure",
  authMiddleware,
  buildController.getBuildForReconfigure
);
router.put(
  "/:buildId/update-component",
  authMiddleware,
  buildController.updateBuildComponent
);
// Add the delete route
router.delete("/:buildId", authMiddleware, buildController.deleteBuild);

module.exports = router;
