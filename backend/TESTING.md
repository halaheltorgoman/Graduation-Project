# Testing the RAG Implementation

This guide provides instructions on how to test the RAG (Retrieval-Augmented Generation) implementation for the PC Building Assistant.

## Prerequisites

Before testing, make sure you have:

1. Node.js installed
2. MongoDB running
3. Ollama running with the llama3.2 model
4. All dependencies installed (`npm install`)

## Testing Options

There are three ways to test the RAG implementation:

1. **Direct Service Testing**: Test the RAG service directly without starting the server
2. **API Testing**: Test the API endpoints by making HTTP requests
3. **Manual Testing**: Test the API endpoints manually using tools like Postman or curl

## 1. Direct Service Testing

This method tests the RAG service directly without starting the server.

```bash
# Navigate to the backend directory
cd backend

# Run the test script
node test-rag.js
```

This will test:
- The `getRelevantKnowledge` function
- The `generateResponse` function
- The `generateBuild` function
- The `getUserInfo` function (may fail if the user doesn't exist)
- The `getComponents` function

## 2. API Testing

This method tests the API endpoints by making HTTP requests to the server.

First, start the test server:

```bash
# Navigate to the backend directory
cd backend

# Start the test server
node run-test-server.js
```

Then, in a new terminal, run the API test script:

```bash
# Navigate to the backend directory
cd backend

# Run the API test script
node test-api.js
```

This will test:
- The `/api/ai/ask` endpoint
- The `/api/ai/generate-build` endpoint

## 3. Manual Testing

You can also test the API endpoints manually using tools like Postman or curl.

### Using curl

#### Test the askAI endpoint

```bash
curl -X POST http://localhost:5000/api/ai/ask \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What CPU should I get for gaming?",
    "userId": "65f8a1b2c3d4e5f6a7b8c9d0",
    "componentType": "cpu",
    "filters": { "price": { "$lte": 300 } }
  }'
```

#### Test the generateBuild endpoint

```bash
curl -X POST http://localhost:5000/api/ai/generate-build \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": {
      "budget": 1000,
      "purpose": "gaming",
      "performance": "high",
      "preferences": ["rgb", "quiet"]
    },
    "userId": "65f8a1b2c3d4e5f6a7b8c9d0"
  }'
```

### Using Postman

1. Create a new request
2. Set the method to POST
3. Enter the URL (e.g., `http://localhost:5000/api/ai/ask`)
4. Set the Content-Type header to application/json
5. Enter the request body in JSON format
6. Send the request

## Troubleshooting

If you encounter issues during testing:

1. **MongoDB Connection Error**: Make sure MongoDB is running and the connection string in `.env` is correct.
2. **Ollama API Error**: Make sure Ollama is running and the URL in `.env` is correct.
3. **User Not Found Error**: This is expected if the mock user ID doesn't exist in your database. You can modify the test scripts to use a valid user ID.
4. **Component Not Found Error**: This is expected if there are no components in your database. You can modify the test scripts to use valid component types and filters.

## Next Steps

After testing, if everything works as expected, you can commit the changes to your branch. If you encounter issues, you can modify the code and test again. 