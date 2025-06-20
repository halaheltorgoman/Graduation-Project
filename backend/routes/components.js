const express = require("express");
const router = express.Router();
const componentController = require("../controllers/componentController");
const authMiddleware = require("../middleware/authMiddleware");

//get components
router.get("/:type", componentController.getComponentsByType);
router.get("/:type/max-price", componentController.getMaxPriceForComponentType);

// Favorites routes
router.post("/favorites", authMiddleware, componentController.addToFavorites);
// FIXED: Change from POST to DELETE and update the route path
router.delete(
  "/favorites/:id",
  authMiddleware,
  componentController.removeFavorite
);
router.get(
  "/favorites/user",
  authMiddleware,
  componentController.getUserFavorites
);
router.get(
  "/favorites/components",
  authMiddleware,
  componentController.getUserFavoriteComponents
);

router.get("/:type/:componentId", componentController.getComponentById);

module.exports = router;
