const ragService = require('./ragService');
const { extractRequirements, formatResponse } = require('../utils/chatUtils');

class ChatService {
    constructor() {
        this.conversationHistory = new Map(); // userId -> message history
        this.MAX_HISTORY = 3; // Keep last 3 messages for context
    }

    // Add a message to conversation history
    addToHistory(userId, message, isUser = true) {
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }
        
        const history = this.conversationHistory.get(userId);
        history.push({
            role: isUser ? 'user' : 'assistant',
            content: message,
            timestamp: new Date()
        });

        // Keep only the last MAX_HISTORY messages
        if (history.length > this.MAX_HISTORY) {
            this.conversationHistory.set(userId, history.slice(-this.MAX_HISTORY));
        }
    }

    // Get conversation history for a user
    getHistory(userId) {
        return this.conversationHistory.get(userId) || [];
    }

    // Process a user message and generate a response
    async processMessage(userId, message) {
        try {
            console.log('Starting message processing:', { userId, message });

            // Add user message to history
            this.addToHistory(userId, message);
            console.log('Message added to history');

            // Extract requirements and intent from the message
            const { requirements, intent, filters } = await extractRequirements(message);
            console.log('Extracted requirements:', { requirements, intent, filters });
            
            // Get relevant knowledge based on the message
            const knowledge = ragService.getRelevantKnowledge(message);
            console.log('Retrieved knowledge:', knowledge);
            
            // Get user preferences if available
            const userInfo = await ragService.getUserInfo(userId);
            console.log('Retrieved user info:', userInfo);
            
            let response;
            
            // Handle different intents
            switch (intent) {
                case 'build_recommendation':
                    try {
                        console.log('Generating build with requirements:', requirements);
                        // Generate a build based on requirements
                        const build = await ragService.generateBuild({
                            ...requirements,
                            preferences: userInfo?.preferences || []
                        });
                        console.log('Generated build:', build);

                        if (!build) {
                            response = "I couldn't generate a build with the given requirements. Please try adjusting your requirements or try again later.";
                        } else {
                            response = formatResponse('build', build);
                        }
                    } catch (error) {
                        console.error('Error in build generation:', {
                            error: error.message,
                            stack: error.stack,
                            requirements
                        });
                        response = "I encountered an error while generating the build. Please try again.";
                    }
                    break;
                    
                case 'component_advice':
                    try {
                        console.log('Getting components:', { componentType: requirements.componentType, filters });
                        // Get component recommendations
                        const components = await ragService.getComponents(
                            requirements.componentType,
                            filters
                        );
                        console.log('Retrieved components:', components);
                        response = formatResponse('components', components);
                    } catch (error) {
                        console.error('Error in component retrieval:', {
                            error: error.message,
                            stack: error.stack,
                            componentType: requirements.componentType,
                            filters
                        });
                        response = "I encountered an error while getting component recommendations. Please try again.";
                    }
                    break;
                    
                default:
                    try {
                        console.log('Generating general response');
                        // General advice using RAG
                        response = await ragService.generateResponse(message, {
                            knowledge,
                            history: this.getHistory(userId)
                        });
                        console.log('Generated response:', response);
                    } catch (error) {
                        console.error('Error in response generation:', {
                            error: error.message,
                            stack: error.stack,
                            message,
                            knowledge
                        });
                        response = "I encountered an error while generating a response. Please try again.";
                    }
            }

            // Add assistant response to history
            this.addToHistory(userId, response, false);
            console.log('Response added to history');

            return {
                response,
                requirements,
                intent
            };
        } catch (error) {
            console.error('Error in processMessage:', {
                error: error.message,
                stack: error.stack,
                userId,
                message
            });
            throw error;
        }
    }
}

module.exports = new ChatService(); 