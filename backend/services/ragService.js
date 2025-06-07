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
const buildService = require('../services/buildService');

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

    for (const concept of pcBuildingKnowledge.concepts) {
      const conceptText = `${concept.title}\n${concept.content}`;
      const chunkedDocs = await createChunkedDocuments(conceptText, {
        type: 'concept',
        id: concept.id,
        title: concept.title
      });
      documents.push(...chunkedDocs);
    }

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

    // Add retry logic for ChromaDB connection
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1} to connect to ChromaDB...`);
        
        // Try to load existing collection using the correct method
        vectorStore = await Chroma.fromExistingCollection(embeddings, {
          collectionName: "pc_building_knowledge",
          url: "http://localhost:8001",
          apiVersion: "v2"
        });

        const collection = await vectorStore.ensureCollection();
        const count = await collection.count();
        console.log(`Found existing collection with ${count} documents`);

        if (count === 0) {
          console.log('Collection is empty, adding documents...');
          await vectorStore.addDocuments(documents);
          const newCount = await collection.count();
          console.log(`Added ${newCount} documents to empty collection`);
        } else {
          console.log('Collection already has documents, skipping initialization');
        }

        // If we get here, everything worked
        console.log('Vector store initialized successfully with ChromaDB');
        return;
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${retryCount + 1} failed:`, error.message);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`Waiting 5 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    // If we get here, all retries failed
    console.log('All retries failed, creating new collection...');
    vectorStore = await Chroma.fromDocuments(documents, embeddings, {
      collectionName: "pc_building_knowledge",
      url: "http://localhost:8001",
      apiVersion: "v2"
    });

    const collection = await vectorStore.ensureCollection();
    const count = await collection.count();
    console.log(`Created new collection with ${count} documents`);
    console.log('Vector store initialized successfully with ChromaDB');
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
};

// Initialize vector store on startup
initializeVectorStore().catch(console.error);

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
 * Extract component mentions and preferences from a message
 * @param {string} message - The message to analyze
 * @returns {Object} - Extracted information
 */
const extractMessageContext = (message) => {
  const context = {
    componentsMentioned: [],
    buildTypes: [],
    preferencesDetected: []
  };

  const componentTypes = Object.keys(componentModels);
  componentTypes.forEach(type => {
    const regex = new RegExp(`\\b${type}\\b`, 'gi');
    if (regex.test(message)) {
      context.componentsMentioned.push(type);
    }
  });

  pcBuildingKnowledge.buildTypes.forEach(buildType => {
    if (message.toLowerCase().includes(buildType.title.toLowerCase())) {
      context.buildTypes.push(buildType.id);
    }
  });

  const budgetRegex = /\$(\d+)/g;
  const budgetMatches = [...message.matchAll(budgetRegex)];
  if (budgetMatches.length > 0) {
    const maxBudget = Math.max(...budgetMatches.map(m => parseInt(m[1])));
    context.preferencesDetected.push(`budget:${maxBudget}`);
  }

  const brands = ['NVIDIA', 'AMD', 'Intel', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Samsung', 'Western Digital'];
  brands.forEach(brand => {
    if (message.toLowerCase().includes(brand.toLowerCase())) {
      context.preferencesDetected.push(`brand:${brand}`);
    }
  });

  const useCases = ['gaming', 'productivity', 'streaming', 'editing', 'workstation'];
  useCases.forEach(useCase => {
    if (message.toLowerCase().includes(useCase.toLowerCase())) {
      context.preferencesDetected.push(`useCase:${useCase}`);
    }
  });

  return context;
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
   * @param {Object} req - Request object
   * @returns {Promise<Object>} - Chat history
   */
  getChatHistory: async (sessionId, req) => {
    try {
      // Check for expired sessions
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      await ChatHistory.deleteMany({ updatedAt: { $lt: twelveHoursAgo } });

      let chatHistory = await ChatHistory.findOne({ sessionId });
      
      if (!chatHistory) {
        chatHistory = new ChatHistory({
          sessionId,
          userId: req?.userId || null,
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
      } else if (req?.userId && !chatHistory.userId) {
        // If user is logged in and this was an anonymous session, associate it with the user
        chatHistory.userId = req.userId;
        await chatHistory.save();
      }
      
      return chatHistory;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },

  /**
   * Associate an anonymous session with a user account
   * @param {string} sessionId - The session ID to associate
   * @param {string} userId - The user ID to associate with
   * @returns {Promise<Object>} - Updated chat history
   */
  associateSessionWithUser: async (sessionId, userId) => {
    try {
      const chatHistory = await ChatHistory.findOne({ sessionId });
      
      if (!chatHistory) {
        throw new Error('Session not found');
      }

      if (chatHistory.userId) {
        throw new Error('Session already associated with a user');
      }

      chatHistory.userId = userId;
      await chatHistory.save();

      return chatHistory;
    } catch (error) {
      console.error('Error associating session with user:', error);
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
      const chatHistory = await ragService.getChatHistory(sessionId);
      
      const messageContext = extractMessageContext(message.content);
      
      message.metadata = {
        ...message.metadata,
        ...messageContext
      };

      // Check message limit
      if (chatHistory.messages.length >= 100) {
        chatHistory.messages.shift();
      }

      chatHistory.messages.push(message);
      
      messageContext.preferencesDetected.forEach(pref => {
        const [type, value] = pref.split(':');
        switch (type) {
          case 'budget':
            const budget = parseInt(value);
            if (!chatHistory.summary.knownPreferences.budgetRange.includes(budget)) {
              chatHistory.summary.knownPreferences.budgetRange.push(budget);
              chatHistory.summary.knownPreferences.budgetRange.sort((a, b) => a - b);
            }
            break;
          case 'brand':
            if (!chatHistory.summary.knownPreferences.preferredBrands.includes(value)) {
              chatHistory.summary.knownPreferences.preferredBrands.push(value);
            }
            break;
          case 'useCase':
            if (!chatHistory.summary.knownPreferences.useCases.includes(value)) {
              chatHistory.summary.knownPreferences.useCases.push(value);
            }
            break;
        }
      });

      await chatHistory.save();
    } catch (error) {
      console.error('Error updating chat history:', error);
      throw error;
    }
  },

  /**
   * Get user information and context
   * @param {Object} req - Request object
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object>} - User information and context
   */
  getUserContext: async (req, sessionId) => {
    try {
      const chatHistory = await ragService.getChatHistory(sessionId, req);
      let userInfo = null;
      
      if (req?.userId) {
        const user = await User.findById(req.userId);
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
      const processedDocs = new Map();

      results.forEach(result => {
        const { type, componentType, id, title, chunkIndex, totalChunks } = result.metadata;
        const content = result.pageContent;

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
   * Check compatibility between components
   * @param {Object} components - Object containing component data by type
   * @returns {Object} - Compatibility results
   */
  checkComponentCompatibility: async (components) => {
    const compatibilityResults = {
      valid: true,
      checks: {},
      issues: []
    };

    try {
      // Skip compatibility check if no components are provided
      if (!components || Object.keys(components).length === 0) {
        return compatibilityResults;
      }

      if (components.cpu && components.cpu.length > 0 && components.motherboard && components.motherboard.length > 0) {
        const cpu = {
          ...components.cpu[0],
          socket: components.cpu[0].socket,
          MB_chipsets: components.cpu[0].MB_chipsets
        };
        const motherboard = {
          ...components.motherboard[0],
          MB_socket: components.motherboard[0].socket,
          chipset: components.motherboard[0].chipset
        };
        const check = buildService.checkCpuMotherboard(cpu, motherboard);
        compatibilityResults.checks.cpu_motherboard = check;
        if (!check.valid) {
          compatibilityResults.valid = false;
          compatibilityResults.issues.push(`CPU-Motherboard: ${check.message}`);
        }
      }

      if (components.motherboard && components.motherboard.length > 0 && components.case && components.case.length > 0) {
        const motherboard = {
          ...components.motherboard[0],
          MB_form: components.motherboard[0].formFactor
        };
        const pcCase = {
          ...components.case[0],
          supported_motherboards: components.case[0].supported_motherboards
        };
        const check = buildService.checkMotherboardCase(motherboard, pcCase);
        compatibilityResults.checks.motherboard_case = check;
        if (!check.valid) {
          compatibilityResults.valid = false;
          compatibilityResults.issues.push(`Motherboard-Case: ${check.message}`);
        }
      }

      if (components.ram && components.ram.length > 0 && components.motherboard && components.motherboard.length > 0) {
        const memory = {
          ...components.ram[0],
          DDR_generation: components.ram[0].type
        };
        const motherboard = {
          ...components.motherboard[0],
          supported_memory: components.motherboard[0].supported_memory
        };
        const check = buildService.checkMemoryMotherboard(memory, motherboard);
        compatibilityResults.checks.memory_motherboard = check;
        if (!check.valid) {
          compatibilityResults.valid = false;
          compatibilityResults.issues.push(`Memory-Motherboard: ${check.message}`);
        }
      }

      if (components.cpu && components.cpu.length > 0 && components.cooler && components.cooler.length > 0) {
        const cpu = {
          ...components.cpu[0],
          socket: components.cpu[0].socket
        };
        const cooler = {
          ...components.cooler[0],
          compatible_cpu_sockets: components.cooler[0].compatible_sockets
        };
        const check = buildService.checkCoolingCpu(cooler, cpu);
        compatibilityResults.checks.cooling_cpu = check;
        if (!check.valid) {
          compatibilityResults.valid = false;
          compatibilityResults.issues.push(`Cooler-CPU: ${check.message}`);
        }
      }

      return compatibilityResults;
    } catch (error) {
      console.error('Error checking component compatibility:', error);
      return {
        valid: false,
        checks: {},
        issues: ['Error checking compatibility: ' + error.message]
      };
    }
  },

  /**
   * Generate a response using the RAG model
   * @param {string} prompt - The user's prompt
   * @param {string} sessionId - The session ID
   * @param {Object} req - Request object
   * @returns {Promise<string>} - The generated response
   */
  generateResponse: async (prompt, sessionId, req) => {
    try {
      const userContext = await ragService.getUserContext(req, sessionId);
      
      const relevantKnowledge = await ragService.getRelevantKnowledge(prompt);
      
      const messageContext = extractMessageContext(prompt);
      const componentData = {};

      const componentTypes = Object.keys(componentModels);
      for (const componentType of componentTypes) {
        try {
          const filters = {};
          
          if (userContext.preferences?.budgetRange?.length > 0) {
            const maxBudget = Math.max(...userContext.preferences.budgetRange);
            const budgetAllocation = {
              cpu: 0.25,
              gpu: 0.35,
              motherboard: 0.15,
              ram: 0.10,
              storage: 0.10,
              psu: 0.05
            };
            filters.price = {
              $lte: maxBudget * (budgetAllocation[componentType] || 0.1)
            };
          }

          if (userContext.preferences?.preferredBrands?.length > 0) {
            filters.brand = { $in: userContext.preferences.preferredBrands };
          }

          if (userContext.preferences?.useCases?.length > 0) {
            if (userContext.preferences.useCases.includes('gaming')) {
              if (componentType === 'gpu') {
                filters.memorySize = { $gte: 6 };
              }
            }
            if (userContext.preferences.useCases.includes('productivity')) {
              if (componentType === 'cpu') {
                filters.cores = { $gte: 6 };
              }
            }
          }

          const components = await ragService.getComponents(componentType, filters);

          componentData[componentType] = components
            .sort((a, b) => {
              const ratingDiff = (b.rating || 0) - (a.rating || 0);
              if (ratingDiff !== 0) return ratingDiff;
              return a.price - b.price;
            })
            .slice(0, 5)
            .map(comp => ({
              name: comp.product_name,
              brand: comp.brand,
              price: comp.price,
              rating: comp.rating,
              specifications: comp.specifications || {},
              ...(componentType === 'cpu' && {
                cores: comp.cores,
                threads: comp.threads,
                socket: comp.socket,
                MB_chipsets: comp.MB_chipsets
              }),
              ...(componentType === 'gpu' && {
                memorySize: comp.memorySize,
                memoryType: comp.memoryType
              }),
              ...(componentType === 'motherboard' && {
                socket: comp.MB_socket,
                chipset: comp.chipset,
                formFactor: comp.MB_form,
                supported_memory: comp.supported_memory
              }),
              ...(componentType === 'ram' && {
                capacity: comp.memory_size,
                speed: comp.speed,
                type: comp.DDR_generation
              })
            }));
        } catch (error) {
          console.error(`Error fetching ${componentType} components:`, error);
        }
      }

      const compatibilityResults = await ragService.checkComponentCompatibility(componentData);
      
      // Construct a prompt with context, knowledge, and actual component data
      const enhancedPrompt = `
        You are a PC building assistant. Use the following context, knowledge, and actual component data to answer the user's question:
        
        User Context:
        ${JSON.stringify(userContext)}
        
        Relevant Knowledge:
        ${JSON.stringify(relevantKnowledge)}
        
        Available Components from Database:
        ${JSON.stringify(componentData)}
        
        Component Compatibility Results:
        ${JSON.stringify(compatibilityResults)}
        
        User Question: ${prompt}
        
        Please provide a helpful and accurate response based on:
        1. The user's context and preferences
        2. The relevant knowledge about PC building
        3. The actual components available in our database
        4. The compatibility between components
        
        Guidelines:
        - Always use real components from our database when making recommendations
        - Include specific prices, ratings, and specifications from our database
        - Consider the user's preferences (budget, brands, use cases) when recommending components
        - Ensure recommended components are compatible with each other
        - For general questions about PC building, use the relevant knowledge
        - Always be helpful, accurate, and concise
        - When recommending components, explain why they're good choices based on:
          * The user's preferences and requirements
          * The component's specifications and ratings
          * Price-to-performance ratio
          * Compatibility with other components
        - If there are compatibility issues, explain them clearly and suggest alternatives
      `;

      const response = await axios.post(`${process.env.OLLAMA_URL}/api/generate`, {
        model: "llama3.2:latest",
        prompt: enhancedPrompt,
        stream: false,
      });

      await ragService.updateChatHistory(sessionId, {
        content: prompt,
        role: 'user',
        timestamp: new Date()
      });

      await ragService.updateChatHistory(sessionId, {
        content: response.data.response,
        role: 'assistant',
        timestamp: new Date()
      });

      return response.data.response;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  },

//   /**
//    * Generate a PC build based on user requirements
//    * @param {Object} requirements - User requirements for the build
//    * @returns {Promise<Object>} - The generated build
//    */
//   generateBuild: async (requirements) => {
//     try {
//       const { budget, purpose, performance, preferences = [] } = requirements;
      
//       // Find relevant build type based on requirements
//       let relevantBuildType = null;
      
//       if (purpose === 'gaming') {
//         if (budget <= 800) {
//           relevantBuildType = pcBuildingKnowledge.buildTypes.find(b => b.id === 'budget-gaming');
//         } else if (budget <= 1500) {
//           relevantBuildType = pcBuildingKnowledge.buildTypes.find(b => b.id === 'mid-range-gaming');
//         } else {
//           relevantBuildType = pcBuildingKnowledge.buildTypes.find(b => b.id === 'high-end-gaming');
//         }
//       } else if (purpose === 'productivity') {
//         if (budget <= 800) {
//           relevantBuildType = pcBuildingKnowledge.buildTypes.find(b => b.id === 'budget-productivity');
//         } else {
//           relevantBuildType = pcBuildingKnowledge.buildTypes.find(b => b.id === 'productivity');
//         }
//       }
      
//       // If no specific build type is found, use a default
//       if (!relevantBuildType) {
//         relevantBuildType = pcBuildingKnowledge.buildTypes[0]; // Default to budget gaming
//       }
      
//       return {
//         buildType: relevantBuildType.title,
//         recommendations: relevantBuildType.content,
//         requirements: {
//           budget,
//           purpose,
//           performance,
//           preferences
//         },
//         message: "This is a recommendation based on your requirements. For actual components, please use the component selection interface."
//       };
//     } catch (error) {
//       console.error('Error generating build:', error);
//       throw error;
//     }
//   }
};

module.exports = ragService; 