const axios = require("axios");
const ragService = require("../services/ragService");
const chatService = require('../services/chatService');
require("dotenv").config();

/**
 * Ask the AI assistant a question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.askAI = async (req, res) => {
  const { prompt, userId, componentType, filters, requirements } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    let context = {};
    
    // Get user information if userId is provided
    if (userId) {
      try {
        context.userInfo = await ragService.getUserInfo(userId);
      } catch (error) {
        console.error("Error getting user info:", error);
        // Continue without user info
      }
    }
    
    // Get component information if componentType is provided
    if (componentType) {
      try {
        context.components = await ragService.getComponents(componentType, filters);
      } catch (error) {
        console.error("Error getting components:", error);
        // Continue without component info
      }
    }
    
    // Generate a build if requirements are provided
    if (requirements) {
      try {
        context.build = await ragService.generateBuild(requirements);
      } catch (error) {
        console.error("Error generating build:", error);
        // Continue without build info
      }
    }
    
    // Generate response using the RAG service
    const response = await ragService.generateResponse(prompt, context);
    
    res.json({ response });
  } catch (error) {
    console.error("Error calling AI service:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};

/**
 * Generate a PC build based on user requirements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateBuild = async (req, res) => {
  const { requirements, userId } = req.body;

  if (!requirements) {
    return res.status(400).json({ error: "Requirements are required" });
  }

  try {
    let context = {};
    
    // Get user information if userId is provided
    if (userId) {
      try {
        context.userInfo = await ragService.getUserInfo(userId);
      } catch (error) {
        console.error("Error getting user info:", error);
        // Continue without user info
      }
    }
    
    // Generate a build based on requirements
    const build = await ragService.generateBuild(requirements);
    
    res.json({ build });
  } catch (error) {
    console.error("Error generating build:", error);
    res.status(500).json({ error: "Failed to generate build" });
  }
};

// Handle chat messages
exports.chat = async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message || !userId) {
            return res.status(400).json({
                error: 'Message and userId are required'
            });
        }

        console.log('Processing chat message:', { message, userId });
        
        const result = await chatService.processMessage(userId, message);
        console.log('Chat processing result:', result);

        res.json({
            response: result.response,
            requirements: result.requirements,
            intent: result.intent
        });
    } catch (error) {
        console.error('Error in chat controller:', {
            error: error.message,
            stack: error.stack,
            requestBody: req.body
        });
        res.status(500).json({
            error: 'Failed to process message',
            details: error.message
        });
    }
};

// Get conversation history
exports.getHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                error: 'UserId is required'
            });
        }

        const history = chatService.getHistory(userId);

        res.json({
            history
        });
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({
            error: 'Failed to get conversation history'
        });
    }
};


