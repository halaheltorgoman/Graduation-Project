const axios = require("axios");
const ragService = require("../services/ragService");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

/**
 * Ask the AI assistant a question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.askAI = async (req, res) => {
  const { prompt, sessionId } = req.body;
  const currentSessionId = sessionId || req.cookies.sessionId || uuidv4();

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // Set session cookie if not exists
    if (!req.cookies.sessionId) {
      res.cookie('sessionId', currentSessionId, {
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }
    
    // Generate response using the RAG service
    const response = await ragService.generateResponse(prompt, currentSessionId, req);
    
    res.json({ response });
  } catch (error) {
    console.error("Error calling AI service:", error);
    res.status(500).json({ 
      error: "Failed to get AI response",
      details: error.message 
    });
  }
};

/**
 * Get all chat histories for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getChatHistory = async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
      return res.json({
        success: true,
        chatHistory: []
      });
    }

    const chatHistory = await ragService.getChatHistory(sessionId, req);
    
    res.json({
      success: true,
      chatHistory: chatHistory ? [chatHistory] : [] // Return as array for consistency
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      error: "Failed to fetch chat history",
      details: error.message
    });
  }
};

/**
 * Get chat history by session ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getChatHistoryById = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const chatHistory = await ragService.getChatHistory(sessionId, req);
    
    if (!chatHistory) {
      return res.status(404).json({
        error: "Chat history not found"
      });
    }

    res.json({
      success: true,
      messages: chatHistory.messages
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      error: "Failed to fetch chat history",
      details: error.message
    });
  }
};

/**
 * Associate an anonymous session with a user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.associateSession = async (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return res.status(400).json({ error: "No session found" });
  }

  try {
    const chatHistory = await ragService.associateSessionWithUser(sessionId, req.userId);
    res.json({ 
      success: true,
      message: "Session associated with user account",
      chatHistory: {
        messageCount: chatHistory.messages.length,
        lastUpdated: chatHistory.updatedAt
      }
    });
  } catch (error) {
    console.error("Error associating session:", error);
    res.status(500).json({ 
      error: "Failed to associate session",
      details: error.message 
    });
  }
};


