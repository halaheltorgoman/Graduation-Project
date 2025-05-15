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

router.get("/:type/:componentId", componentController.getComponentById);
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
module.exports = router;
