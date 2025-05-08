const express = require('express');
const router = express.Router();
const buildController = require('../controllers/buildController');
const authMiddleware = require('../middleware/userAuth');

router.post('/next-components', authMiddleware, buildController.getNextComponents);
router.post('/validate', authMiddleware, buildController.validateBuild);
router.put('/createbuild/:buildId/finalize', authMiddleware, buildController.finalizeBuild);
router.post('/createbuild', authMiddleware, buildController.createBuild);



module.exports = router;