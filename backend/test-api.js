/**
 * Test script for the AI Assistant API endpoints
 * 
 * This script tests the API endpoints by making HTTP requests to the server.
 * Run this script with: node test-api.js
 * 
 * Note: Make sure the server is running before running this script.
 */

const axios = require('axios');
require('dotenv').config();

// Base URL for the API
const baseUrl = 'http://localhost:5000/api';

// Mock user ID for testing
const mockUserId = '65f8a1b2c3d4e5f6a7b8c9d0';

// Test function to test the askAI endpoint
async function testAskAIEndpoint() {
  console.log('Testing askAI endpoint...');
  
  try {
    const response = await axios.post(`${baseUrl}/ai/ask`, {
      prompt: 'What CPU should I get for gaming?',
      userId: mockUserId,
      componentType: 'cpu',
      filters: { price: { $lte: 300 } }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    console.log('AskAI endpoint test completed successfully!');
  } catch (error) {
    console.error('Error testing askAI endpoint:', error.response ? error.response.data : error.message);
  }
}

// Test function to test the generateBuild endpoint
async function testGenerateBuildEndpoint() {
  console.log('\nTesting generateBuild endpoint...');
  
  try {
    const response = await axios.post(`${baseUrl}/ai/generate-build`, {
      requirements: {
        budget: 1000,
        purpose: 'gaming',
        performance: 'high',
        preferences: ['rgb', 'quiet']
      },
      userId: mockUserId
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    console.log('GenerateBuild endpoint test completed successfully!');
  } catch (error) {
    console.error('Error testing generateBuild endpoint:', error.response ? error.response.data : error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test askAI endpoint
  await testAskAIEndpoint();
  
  // Test generateBuild endpoint
  await testGenerateBuildEndpoint();
  
  console.log('\nAll API tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running API tests:', error);
}); 