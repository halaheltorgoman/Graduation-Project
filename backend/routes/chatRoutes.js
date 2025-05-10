const express = require('express');
const router = express.Router();
const ragService = require('../services/ragService');
const sessionMiddleware = require('../middleware/sessionMiddleware');

// Apply session middleware to all chat routes
router.use(sessionMiddleware);

/**
 * POST /api/chat
 * Handles chat messages and generates responses
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    const { sessionId, userId } = req.session;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate response using RAG service
    const response = await ragService.generateResponse(
      message,
      sessionId,
      userId
    );

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/chat/history
 * Retrieves chat history for the current session
 */
router.get('/history', async (req, res) => {
  try {
    const { sessionId, userId } = req.session;
    const chatHistory = await ragService.getChatHistory(sessionId, userId);
    
    res.json(chatHistory);
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 