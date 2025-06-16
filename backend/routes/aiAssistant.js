const express = require("express");
const aiController = require("../controllers/aiController");
const userAuth = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/ask",userAuth, aiController.askAI);

// Chat history endpoints
router.get("/chat-history", userAuth, aiController.getChatHistory);
router.get("/chat-history/:sessionId", userAuth, aiController.getChatHistoryById);
router.post("/chat-history/associate", userAuth,  aiController.associateSession);

// Test endpoint to check environment
router.get("/test", (req, res) => {
  res.json({
    ollamaUrl: process.env.OLLAMA_URL,
    mongoUri: process.env.MONGO_URI ? "Set" : "Not Set",
    nodeEnv: process.env.NODE_ENV
  });
});

module.exports = router;
