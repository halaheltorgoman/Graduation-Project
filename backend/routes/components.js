const express = require('express');
const router = express.Router();
const componentController = require('../controllers/componentController');
const authMiddleware = require('../middleware/authMiddleware');

//get components 
router.get('/:type', componentController.getComponentsByType);

// favs
router.post('/favorites', authMiddleware, componentController.addToFavorites);
router.post('/favorites/:id', authMiddleware, componentController.removeFavorite);
// search
router.get('/:type/search', componentController.searchComponents);

module.exports = router;