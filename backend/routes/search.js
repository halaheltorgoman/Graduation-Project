const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchController");
router.get("/:type", searchController.searchComponents);
router.get("/all/components", searchController.getAllComponentsForSearch);
module.exports = router;
