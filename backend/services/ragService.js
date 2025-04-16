const axios = require('axios');
const User = require('../models/User');
const Build = require('../models/Build');
const CPU = require('../models/Components/CPU');
const GPU = require('../models/Components/GPU');
const Motherboard = require('../models/Components/MotherBoard');
const Memory = require('../models/Components/Memory');
const Storage = require('../models/Components/Storage');
const PSU = require('../models/Components/PSU');
const Cooler = require('../models/Components/Cooler');
const Case = require('../models/Components/Case');
const pcBuildingKnowledge = require('../data/pcBuildingKnowledge');

// Component models mapping
const componentModels = {
  cpu: CPU,
  gpu: GPU,
  motherboard: Motherboard,
  ram: Memory,
  storage: Storage,
  psu: PSU,
  case: Case,
  cooler: Cooler,
};

/**
 * RAG Service for PC Building Assistant
 * This service handles:
 * 1. Retrieving user information
 * 2. Accessing component database
 * 3. Generating responses with context
 * 4. Automating builds based on user needs
 */
const ragService = {
  /**
   * Get user information for context
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} - User information
   */
  getUserInfo: async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get user's saved builds
      const savedBuilds = await Build.find({ _id: { $in: user.savedBuilds } });
      const ownBuilds = await Build.find({ _id: { $in: user.builds } });
      
      return {
        username: user.username,
        savedBuilds,
        ownBuilds,
        favorites: user.favorites
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  },

  /**
   * Get component information from the database
   * @param {string} componentType - The type of component
   * @param {Object} filters - Filters to apply to the query
   * @returns {Promise<Array>} - Array of components
   */
  getComponents: async (componentType, filters = {}) => {
    try {
      const model = componentModels[componentType.toLowerCase()];
      if (!model) {
        throw new Error(`Invalid component type: ${componentType}`);
      }
      
      return await model.find(filters);
    } catch (error) {
      console.error(`Error getting ${componentType} components:`, error);
      throw error;
    }
  },

  /**
   * Get relevant knowledge based on the query
   * @param {string} query - The user's query
   * @returns {Object} - Relevant knowledge
   */
  getRelevantKnowledge: (query) => {
    // Simple keyword-based retrieval
    // In a real implementation, this would use vector embeddings and semantic search
    
    const relevantKnowledge = {
      concepts: [],
      components: {},
      buildTypes: []
    };
    
    // Check general concepts
    pcBuildingKnowledge.concepts.forEach(concept => {
      if (query.toLowerCase().includes(concept.title.toLowerCase()) || 
          concept.content.toLowerCase().includes(query.toLowerCase())) {
        relevantKnowledge.concepts.push(concept);
      }
    });
    
    // Check component-specific knowledge
    Object.keys(pcBuildingKnowledge.components).forEach(componentType => {
      relevantKnowledge.components[componentType] = [];
      
      pcBuildingKnowledge.components[componentType].forEach(knowledge => {
        if (query.toLowerCase().includes(componentType) || 
            query.toLowerCase().includes(knowledge.title.toLowerCase()) ||
            knowledge.content.toLowerCase().includes(query.toLowerCase())) {
          relevantKnowledge.components[componentType].push(knowledge);
        }
      });
    });
    
    // Check build types
    pcBuildingKnowledge.buildTypes.forEach(buildType => {
      if (query.toLowerCase().includes(buildType.title.toLowerCase()) || 
          buildType.content.toLowerCase().includes(query.toLowerCase())) {
        relevantKnowledge.buildTypes.push(buildType);
      }
    });
    
    return relevantKnowledge;
  },

  /**
   * Generate a response using the RAG model
   * @param {string} prompt - The user's prompt
   * @param {Object} context - Additional context for the response
   * @returns {Promise<string>} - The generated response
   */
  generateResponse: async (prompt, context = {}) => {
    try {
      // Get relevant knowledge based on the prompt
      const relevantKnowledge = ragService.getRelevantKnowledge(prompt);
      
      // Construct a prompt with context and knowledge
      const enhancedPrompt = `
        You are a PC building assistant. Use the following context and knowledge to answer the user's question:
        
        Context:
        ${JSON.stringify(context)}
        
        Relevant Knowledge:
        ${JSON.stringify(relevantKnowledge)}
        
        User Question: ${prompt}
        
        Please provide a helpful and accurate response based on the context, knowledge, and your understanding of PC building.
        If the user is asking about specific components, prioritize information from the context.
        If the user is asking general questions about PC building, use the relevant knowledge.
        Always be helpful, accurate, and concise.
      `;

      // Call the Ollama API
      const response = await axios.post(`${process.env.OLLAMA_URL}/api/generate`, {
        model: "llama3.2:latest",
        prompt: enhancedPrompt,
        stream: false,
      });

      return response.data.response;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  },

  /**
   * Generate a PC build based on user requirements
   * @param {Object} requirements - User requirements for the build
   * @returns {Promise<Object>} - The generated build
   */
  generateBuild: async (requirements) => {
    try {
      // Extract requirements
      const { budget, purpose, performance, preferences = [] } = requirements;
      
      // Find relevant build type based on requirements
      let relevantBuildType = null;
      
      if (purpose === 'gaming') {
        if (budget <= 800) {
          relevantBuildType = pcBuildingKnowledge.buildTypes.find(b => b.id === 'budget-gaming');
        } else if (budget <= 1500) {
          relevantBuildType = pcBuildingKnowledge.buildTypes.find(b => b.id === 'mid-range-gaming');
        } else {
          relevantBuildType = pcBuildingKnowledge.buildTypes.find(b => b.id === 'high-end-gaming');
        }
      } else if (purpose === 'productivity') {
        if (budget <= 800) {
          relevantBuildType = pcBuildingKnowledge.buildTypes.find(b => b.id === 'budget-productivity');
        } else {
          relevantBuildType = pcBuildingKnowledge.buildTypes.find(b => b.id === 'productivity');
        }
      }
      
      // If no specific build type is found, use a default
      if (!relevantBuildType) {
        relevantBuildType = pcBuildingKnowledge.buildTypes[0]; // Default to budget gaming
      }
      
      // Get components based on the build type
      // This is a simplified version - in a real implementation, you would query the database
      // for actual components that match the recommendations
      
      return {
        buildType: relevantBuildType.title,
        recommendations: relevantBuildType.content,
        requirements: {
          budget,
          purpose,
          performance,
          preferences
        },
        message: "This is a recommendation based on your requirements. For actual components, please use the component selection interface."
      };
    } catch (error) {
      console.error('Error generating build:', error);
      throw error;
    }
  }
};

module.exports = ragService; 