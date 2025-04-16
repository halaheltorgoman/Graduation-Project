const axios = require("axios");
const ragService = require("../services/ragService");
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


