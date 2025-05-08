const express = require("express");
const router = express.Router();
const componentController = require("../controllers/componentController");
const authMiddleware = require("../middleware/authMiddleware");

//get components
router.get("/:type", componentController.getComponentsByType);
router.get("/:type/max-price", componentController.getMaxPriceForComponentType);

// favs
router.post("/favorites", authMiddleware, componentController.addToFavorites);
router.post(
  "/favorites/:id",
  authMiddleware,
  componentController.removeFavorite
);
router.get("/:type/suggestions", componentController.getSearchSuggestions);
// search
router.get("/:type/search", componentController.searchComponents);
// New route for component details

router.get("/:type/:componentId", componentController.getComponentById);

module.exports = router;
