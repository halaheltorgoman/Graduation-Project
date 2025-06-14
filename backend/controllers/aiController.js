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
  const { prompt, componentType, filters, requirements } = req.body;
  const sessionId = req.cookies.sessionId || uuidv4();

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // Set session cookie if not exists
    if (!req.cookies.sessionId) {
      res.cookie('sessionId', sessionId, {
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }
    
    // Generate response using the RAG service
    const response = await ragService.generateResponse(prompt, sessionId, req);
    
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
 * Generate a PC build based on user requirements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateBuild = async (req, res) => {
  const { requirements } = req.body;
  const sessionId = req.cookies.sessionId;

  if (!requirements) {
    return res.status(400).json({ error: "Requirements are required" });
  }

  try {
    // Generate a build based on requirements
    const build = await ragService.generateBuild(requirements);
    
    // If we have a session, update chat history with the build generation
    if (sessionId) {
      await ragService.updateChatHistory(sessionId, {
        content: `Generated build based on requirements: ${JSON.stringify(requirements)}`,
        role: 'system',
        timestamp: new Date()
      });
    }
    
    res.json({ build });
  } catch (error) {
    console.error("Error generating build:", error);
    res.status(500).json({ 
      error: "Failed to generate build",
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


