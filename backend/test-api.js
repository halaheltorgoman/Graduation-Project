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
const baseUrl = 'http://localhost:4000/api';

// Mock user ID for testing
const mockUserId = '67b4b87322cc907db1be4c3a';

// Test function to test the chat endpoint
async function testChatEndpoint() {
  console.log('Testing chat endpoint...');
  
  try {
    const response = await axios.post(`${baseUrl}/ai/chat`, {
      message: 'I need a gaming PC under $1000',
      userId: mockUserId
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    console.log('Chat endpoint test completed successfully!');
  } catch (error) {
    console.error('Error testing chat endpoint:', error.response ? error.response.data : error.message);
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
  
  // Test chat endpoint
  await testChatEndpoint();
  
  // Test generateBuild endpoint
  await testGenerateBuildEndpoint();
  
  console.log('\nAll API tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running API tests:', error);
}); 