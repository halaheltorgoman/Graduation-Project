/**
 * Test script for the RAG implementation
 * 
 * This script tests the RAG service by simulating API calls to the AI assistant.
 * Run this script with: node test-rag.js
 */

require('dotenv').config();
const ragService = require('./services/ragService');

// Mock user ID for testing
const mockUserId = '65f8a1b2c3d4e5f6a7b8c9d0';

// Test function to simulate asking the AI assistant
async function testAskAI() {
  console.log('Testing askAI functionality...');
  
  try {
    // Test with a simple prompt
    const prompt = 'What CPU should I get for gaming?';
    console.log(`Prompt: ${prompt}`);
    
    // Get relevant knowledge
    const relevantKnowledge = ragService.getRelevantKnowledge(prompt);
    console.log('Relevant knowledge retrieved successfully.');
    
    // Generate response
    const response = await ragService.generateResponse(prompt, {});
    console.log('\nResponse:');
    console.log(response);
    
    console.log('\nAskAI test completed successfully!');
  } catch (error) {
    console.error('Error testing askAI:', error);
  }
}

// Test function to simulate generating a build
async function testGenerateBuild() {
  console.log('\nTesting generateBuild functionality...');
  
  try {
    // Test with sample requirements
    const requirements = {
      budget: 1000,
      purpose: 'gaming',
      performance: 'high',
      preferences: ['rgb', 'quiet']
    };
    
    console.log('Requirements:', requirements);
    
    // Generate build
    const build = await ragService.generateBuild(requirements);
    console.log('\nGenerated Build:');
    console.log(JSON.stringify(build, null, 2));
    
    console.log('\nGenerateBuild test completed successfully!');
  } catch (error) {
    console.error('Error testing generateBuild:', error);
  }
}

// Test function to simulate getting user info
async function testGetUserInfo() {
  console.log('\nTesting getUserInfo functionality...');
  
  try {
    // This will fail if the user doesn't exist in the database
    // You can modify this to use a valid user ID from your database
    const userInfo = await ragService.getUserInfo(mockUserId);
    console.log('User info retrieved successfully:');
    console.log(JSON.stringify(userInfo, null, 2));
    
    console.log('\nGetUserInfo test completed successfully!');
  } catch (error) {
    console.error('Error testing getUserInfo:', error);
    console.log('Note: This error is expected if the mock user ID does not exist in your database.');
  }
}

// Test function to simulate getting components
async function testGetComponents() {
  console.log('\nTesting getComponents functionality...');
  
  try {
    // Test with CPU components
    const componentType = 'cpu';
    const filters = { price: { $lte: 300 } };
    
    console.log(`Getting ${componentType} components with filters:`, filters);
    
    // Get components
    const components = await ragService.getComponents(componentType, filters);
    console.log(`Retrieved ${components.length} components.`);
    
    if (components.length > 0) {
      console.log('First component:');
      console.log(JSON.stringify(components[0], null, 2));
    }
    
    console.log('\nGetComponents test completed successfully!');
  } catch (error) {
    console.error('Error testing getComponents:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting RAG tests...\n');
  
  // Test askAI
  await testAskAI();
  
  // Test generateBuild
  await testGenerateBuild();
  
  // Test getUserInfo (this may fail if the user doesn't exist)
  await testGetUserInfo();
  
  // Test getComponents
  await testGetComponents();
  
  console.log('\nAll tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
}); 