const guideController = require('../controllers/guideController');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/userAuth');

router.post(
  '/:buildId/convert-to-guide', 
  authMiddleware, 
  guideController.isGuideCreator,
 guideController.convertToGuide
);

router.get(
  '/guides/:category',
  guideController.getGuidesByCategory
);

router.post(
  '/guides/:buildId/save',
  authMiddleware,
  guideController.toggleSaveGuide
);

router.post(
  '/guides/:buildId/rate',
  authMiddleware,
  guideController.rateGuide
);

router.get(
  '/guides/saved',
  authMiddleware,
  guideController.getSavedGuides
);

module.exports = router;