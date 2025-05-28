// const express = require('express');
// const router = express.Router();
// const buildController = require('../controllers/buildController');
// const authMiddleware = require('../middleware/userAuth');

// // Builder workflow endpoints
// router.post('/next-components', authMiddleware, buildController.getNextComponents);
// router.post('/validate', authMiddleware, buildController.validateBuild);
// router.post('/save', authMiddleware, buildController.saveBuild);
// // router.put('/:buildId/share', builderController.shareBuild);

// module.exports = router;const express = require('express');
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
module.exports = router; // <-- also fix this line, should be 'router', not 'buildRouter'
