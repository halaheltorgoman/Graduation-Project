const express = require("express");
const aiController = require("../controllers/aiController");
const router = express.Router();

// Chat endpoints
router.post("/chat", aiController.chat);
router.get("/history/:userId", aiController.getHistory);

// Route for asking the AI assistant a question
router.post("/ask", aiController.askAI);

// Route for generating a PC build based on requirements
router.post("/generate-build", aiController.generateBuild);

module.exports = router;
