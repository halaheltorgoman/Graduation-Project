const axios = require('axios');
const { OllamaEmbeddings } = require('@langchain/community/embeddings/ollama');
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { Document } = require('langchain/document');
const User = require('../models/User');
const Build = require('../models/Build');
const ChatHistory = require('../models/ChatHistory');
const CPU = require('../models/Components/CPU');
const GPU = require('../models/Components/GPU');
const Motherboard = require('../models/Components/MotherBoard');
const Memory = require('../models/Components/Memory');
const Storage = require('../models/Components/Storage');
const PSU = require('../models/Components/PSU');
const Cooler = require('../models/Components/Cooler');
const Case = require('../models/Components/Case');
const pcBuildingKnowledge = require('../data/pcBuildingKnowledge');

// Initialize Ollama embeddings
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: `${process.env.OLLAMA_URL}`
});

// Initialize text splitter for chunking
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", " ", ""]
});

// Create vector store for knowledge base
let vectorStore = null;

/**
 * Split text into chunks and create documents
 * @param {string} text - The text to split
 * @param {Object} metadata - Metadata for the document
 * @returns {Array<Document>} - Array of chunked documents
 */
const createChunkedDocuments = async (text, metadata) => {
  const chunks = await textSplitter.splitText(text);
  return chunks.map(chunk => new Document({
    pageContent: chunk,
    metadata: {
      ...metadata,
      chunkIndex: chunks.indexOf(chunk),
      totalChunks: chunks.length
    }
  }));
};

/**
 * Initialize the vector store with PC building knowledge
 */
const initializeVectorStore = async () => {
  try {
    const documents = [];

    // Add concepts
    for (const concept of pcBuildingKnowledge.concepts) {
      const conceptText = `${concept.title}\n${concept.content}`;
      const chunkedDocs = await createChunkedDocuments(conceptText, {
        type: 'concept',
        id: concept.id,
        title: concept.title
      });
      documents.push(...chunkedDocs);
    }

    // Add component knowledge
    for (const [componentType, knowledgeList] of Object.entries(pcBuildingKnowledge.components)) {
      for (const knowledge of knowledgeList) {
        const componentText = `${knowledge.title}\n${knowledge.content}`;
        const chunkedDocs = await createChunkedDocuments(componentText, {
          type: 'component',
          componentType,
          id: knowledge.id,
          title: knowledge.title
        });
        documents.push(...chunkedDocs);
      }
    }

    // Add build types
    for (const buildType of pcBuildingKnowledge.buildTypes) {
      const buildTypeText = `${buildType.title}\n${buildType.content}`;
      const chunkedDocs = await createChunkedDocuments(buildTypeText, {
        type: 'buildType',
        id: buildType.id,
        title: buildType.title
      });
      documents.push(...chunkedDocs);
    }

    console.log(`Total documents to be added to vector store: ${documents.length}`);

    // First try to load existing collection
    try {
      vectorStore = await Chroma.load({
        collectionName: "pc_building_knowledge",
        url: "http://localhost:8001",
        apiVersion: "v2",
        embeddings
      });

      const collection = await vectorStore.ensureCollection();
      const count = await collection.count();
      console.log(`Found existing collection with ${count} documents`);

      if (count === 0) {
        throw new Error('Empty collection, reinitializing...');
      }
    } catch (error) {
      console.log('Creating new vector store collection...');
      // Create new persistent vector store with ChromaDB
      vectorStore = await Chroma.fromDocuments(documents, embeddings, {
        collectionName: "pc_building_knowledge",
        url: "http://localhost:8001",
        apiVersion: "v2"
      });

      // Verify the collection exists and get document count
      const collection = await vectorStore.ensureCollection();
      const count = await collection.count();
      console.log(`Vector store initialized with ${count} documents`);
    }

    console.log('Vector store initialized successfully with ChromaDB');
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
};

// Initialize vector store on startup
initializeVectorStore().catch(console.error);

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
 * 1. Retrieving user information and chat history
 * 2. Accessing component database
 * 3. Generating responses with context
 * 4. Automating builds based on user needs
 */
const ragService = {
  /**
   * Get or create chat history for a session
   * @param {string} sessionId - The session ID
   * @param {string} userId - Optional user ID
   * @returns {Promise<Object>} - Chat history
   */
  getChatHistory: async (sessionId, userId = null) => {
    try {
      let chatHistory = await ChatHistory.findOne({ sessionId });
      
      if (!chatHistory) {
        chatHistory = new ChatHistory({
          sessionId,
          userId,
          messages: [],
          summary: {
            knownPreferences: {
              budgetRange: [],
              preferredBrands: [],
              useCases: []
            }
          }
        });
        await chatHistory.save();
      }
      
      return chatHistory;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },

  /**
   * Update chat history with a new message
   * @param {string} sessionId - The session ID
   * @param {Object} message - The message to add
   * @returns {Promise<void>}
   */
  updateChatHistory: async (sessionId, message) => {
    try {
      await ChatHistory.findOneAndUpdate(
        { sessionId },
        {
          $push: { messages: message },
          $set: { updatedAt: new Date() }
        }
      );
    } catch (error) {
      console.error('Error updating chat history:', error);
      throw error;
    }
  },

  /**
   * Update user preferences in chat history
   * @param {string} sessionId - The session ID
   * @param {Object} preferences - The preferences to update
   * @returns {Promise<void>}
   */
  updateUserPreferences: async (sessionId, preferences) => {
    try {
      await ChatHistory.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            'summary.knownPreferences': preferences,
            updatedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  },

  /**
   * Get user information and context
   * @param {string} userId - The user ID
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object>} - User information and context
   */
  getUserContext: async (userId, sessionId) => {
    try {
      const chatHistory = await ragService.getChatHistory(sessionId, userId);
      let userInfo = null;
      
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          const savedBuilds = await Build.find({ _id: { $in: user.savedBuilds } });
          const ownBuilds = await Build.find({ _id: { $in: user.builds } });
          
          userInfo = {
            username: user.username,
            savedBuilds,
            ownBuilds,
            favorites: user.favorites
          };
        }
      }
      
      return {
        userInfo,
        chatHistory: chatHistory.messages,
        preferences: chatHistory.summary.knownPreferences
      };
    } catch (error) {
      console.error('Error getting user context:', error);
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
   * Get relevant knowledge using semantic search with Ollama embeddings
   * @param {string} query - The user's query
   * @returns {Promise<Object>} - Relevant knowledge
   */
  getRelevantKnowledge: async (query) => {
    try {
      if (!vectorStore) {
        console.log('Vector store not initialized, attempting to initialize...');
        await initializeVectorStore();
      }

      console.log(`Performing similarity search for query: "${query}"`);
      
      // Perform semantic search with ChromaDB
      const results = await vectorStore.similaritySearch(query, 10);

      console.log(`Search returned ${results.length} results`);

      if (results.length === 0) {
        console.log('No results found. Checking vector store status...');
        const collection = await vectorStore.ensureCollection();
        const count = await collection.count();
        console.log(`Current document count in vector store: ${count}`);
        
        if (count === 0) {
          console.log('Vector store is empty, reinitializing...');
          await initializeVectorStore();
          // Try search again
          results = await vectorStore.similaritySearch(query, 10);
          console.log(`After reinitialization, search returned ${results.length} results`);
        }
      }

      const relevantKnowledge = {
        concepts: [],
        components: {},
        buildTypes: []
      };

      // Organize results by type and merge chunks
      const processedDocs = new Map(); // To track processed documents

      results.forEach(result => {
        const { type, componentType, id, title, chunkIndex, totalChunks } = result.metadata;
        const content = result.pageContent;

        // Skip if we've already processed this document
        if (processedDocs.has(id)) {
          return;
        }

        // If this is a chunk, try to get all chunks
        if (chunkIndex !== undefined) {
          // Get all chunks for this document
          const allChunks = results.filter(r => 
            r.metadata.id === id && 
            r.metadata.type === type
          ).sort((a, b) => a.metadata.chunkIndex - b.metadata.chunkIndex);

          // If we have all chunks, process the complete document
          if (allChunks.length === totalChunks) {
            const fullContent = allChunks.map(c => c.pageContent).join('\n');
            processedDocs.set(id, true);

            switch (type) {
              case 'concept':
                relevantKnowledge.concepts.push({
                  id,
                  title,
                  content: fullContent
                });
                break;
              case 'component':
                if (!relevantKnowledge.components[componentType]) {
                  relevantKnowledge.components[componentType] = [];
                }
                relevantKnowledge.components[componentType].push({
                  id,
                  title,
                  content: fullContent
                });
                break;
              case 'buildType':
                relevantKnowledge.buildTypes.push({
                  id,
                  title,
                  content: fullContent
                });
                break;
            }
          }
        } else {
          // Process non-chunked documents
          switch (type) {
            case 'concept':
              relevantKnowledge.concepts.push({
                id,
                title,
                content
              });
              break;
            case 'component':
              if (!relevantKnowledge.components[componentType]) {
                relevantKnowledge.components[componentType] = [];
              }
              relevantKnowledge.components[componentType].push({
                id,
                title,
                content
              });
              break;
            case 'buildType':
              relevantKnowledge.buildTypes.push({
                id,
                title,
                content
              });
              break;
          }
        }
      });

      // If no results found, return basic knowledge
      if (Object.keys(relevantKnowledge.components).length === 0 &&
          relevantKnowledge.concepts.length === 0 &&
          relevantKnowledge.buildTypes.length === 0) {
        relevantKnowledge.concepts.push(pcBuildingKnowledge.concepts[0]);
      }

      return relevantKnowledge;
    } catch (error) {
      console.error('Error in getRelevantKnowledge:', error);
      // Fallback to basic knowledge
      return {
        concepts: [pcBuildingKnowledge.concepts[0]],
        components: {},
        buildTypes: []
      };
    }
  },

  /**
   * Generate a response using the RAG model
   * @param {string} prompt - The user's prompt
   * @param {string} sessionId - The session ID
   * @param {string} userId - Optional user ID
   * @returns {Promise<string>} - The generated response
   */
  generateResponse: async (prompt, sessionId, userId = null) => {
    try {
      // Get user context and chat history
      const context = await ragService.getUserContext(userId, sessionId);
      
      // Get relevant knowledge based on the prompt
      const relevantKnowledge = await ragService.getRelevantKnowledge(prompt);
      
      // Construct a prompt with context and knowledge
      const enhancedPrompt = `
        You are a PC building assistant. Use the following context and knowledge to answer the user's question:
        
        User Context:
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

      // Update chat history with the new message
      await ragService.updateChatHistory(sessionId, {
        content: prompt,
        role: 'user',
        timestamp: new Date(),
        metadata: {
          componentsMentioned: [], // TODO: Extract from prompt
          buildTypes: [], // TODO: Extract from prompt
          preferencesDetected: [] // TODO: Extract from prompt
        }
      });

      await ragService.updateChatHistory(sessionId, {
        content: response.data.response,
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          componentsMentioned: [], // TODO: Extract from response
          buildTypes: [], // TODO: Extract from response
          preferencesDetected: [] // TODO: Extract from response
        }
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