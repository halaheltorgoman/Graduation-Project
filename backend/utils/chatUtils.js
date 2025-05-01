const { extractPrice, extractComponentType } = require('./textUtils');

// Extract requirements and intent from natural language
async function extractRequirements(message) {
    const requirements = {
        budget: extractPrice(message),
        purpose: extractPurpose(message),
        performance: extractPerformance(message),
        componentType: extractComponentType(message)
    };

    const filters = {};
    if (requirements.budget) {
        filters.price = { $lte: requirements.budget };
    }

    const intent = determineIntent(message, requirements);

    return { requirements, intent, filters };
}

// Format responses based on type
function formatResponse(type, data) {
    switch (type) {
        case 'build':
            return formatBuildResponse(data);
        case 'components':
            return formatComponentsResponse(data);
        default:
            return data;
    }
}

// Format build recommendations
function formatBuildResponse(build) {
    if (!build || typeof build !== 'object' || Object.keys(build).length === 0) {
        return "I couldn't generate a build with the given requirements. Please try adjusting your requirements or try again later.";
    }

    let response = "Here's a recommended build for you:\n\n";
    
    try {
        Object.entries(build).forEach(([componentType, component]) => {
            if (!component || !component.name || !component.specs || !component.price) {
                console.warn(`Invalid component data for ${componentType}:`, component);
                return;
            }

            response += `${componentType.toUpperCase()}:\n`;
            response += `- ${component.name}\n`;
            response += `  Specs: ${Object.entries(component.specs)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}\n`;
            response += `  Price: $${component.price}\n\n`;
        });

        const totalPrice = Object.values(build)
            .filter(comp => comp && comp.price)
            .reduce((sum, comp) => sum + comp.price, 0);

        response += `Total Price: $${totalPrice}`;
    } catch (error) {
        console.error('Error formatting build response:', error);
        return "I encountered an error while formatting the build. Please try again.";
    }

    return response;
}

// Format component recommendations
function formatComponentsResponse(components) {
    if (!Array.isArray(components) || components.length === 0) {
        return "I couldn't find any components matching your requirements.";
    }

    let response = "Here are some components that might work for you:\n\n";
    
    try {
        components.forEach(component => {
            if (!component || !component.name || !component.specs || !component.price) {
                console.warn('Invalid component data:', component);
                return;
            }

            response += `- ${component.name}\n`;
            response += `  Specs: ${Object.entries(component.specs)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}\n`;
            response += `  Price: $${component.price}\n\n`;
        });
    } catch (error) {
        console.error('Error formatting components response:', error);
        return "I encountered an error while formatting the components. Please try again.";
    }

    return response;
}

// Helper functions
function extractPurpose(message) {
    const purposes = ['gaming', 'work', 'streaming', 'editing'];
    const lowerMessage = message.toLowerCase();
    return purposes.find(p => lowerMessage.includes(p)) || 'general';
}

function extractPerformance(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('high') || lowerMessage.includes('premium')) return 'high';
    if (lowerMessage.includes('medium') || lowerMessage.includes('balanced')) return 'medium';
    if (lowerMessage.includes('low') || lowerMessage.includes('budget')) return 'low';
    return 'medium';
}

function determineIntent(message, requirements) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('build') || 
        lowerMessage.includes('pc') || 
        lowerMessage.includes('computer')) {
        return 'build_recommendation';
    }
    
    if (requirements.componentType) {
        return 'component_advice';
    }
    
    return 'general_advice';
}

module.exports = {
    extractRequirements,
    formatResponse
}; 