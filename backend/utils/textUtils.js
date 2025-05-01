// Extract price from natural language
function extractPrice(message) {
    const priceRegex = /\$(\d+)/;
    const match = message.match(priceRegex);
    return match ? parseInt(match[1]) : null;
}

// Extract component type from natural language
function extractComponentType(message) {
    const componentTypes = {
        cpu: ['cpu', 'processor', 'central processing unit'],
        gpu: ['gpu', 'graphics card', 'video card', 'graphics processing unit'],
        ram: ['ram', 'memory', 'random access memory'],
        storage: ['storage', 'ssd', 'hard drive', 'hdd'],
        motherboard: ['motherboard', 'mobo', 'mainboard'],
        psu: ['psu', 'power supply', 'power supply unit'],
        case: ['case', 'pc case', 'computer case']
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [type, keywords] of Object.entries(componentTypes)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            return type;
        }
    }

    return null;
}

// Format component specifications
function formatSpecs(specs) {
    return Object.entries(specs)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
}

// Format price range
function formatPriceRange(min, max) {
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
}

module.exports = {
    extractPrice,
    extractComponentType,
    formatSpecs,
    formatPriceRange
}; 