# PC Building Assistant with RAG

This project implements a Retrieval-Augmented Generation (RAG) model to assist users with the PC building process. The AI assistant can provide information about components, answer questions about PC building, and generate build recommendations based on user requirements.

## Features

- **User Information Retrieval**: The assistant can access user information to provide personalized recommendations.
- **Component Database Access**: The assistant can access the component database to provide accurate information about available components.
- **Build Automation**: The assistant can generate build recommendations based on user requirements.
- **Knowledge Base**: The assistant uses a knowledge base of PC building concepts, compatibility rules, and best practices.

## Implementation

The RAG implementation consists of the following components:

1. **Knowledge Base**: A collection of documents about PC building concepts, compatibility rules, and best practices.
2. **Retrieval**: A simple keyword-based retrieval system that finds relevant knowledge based on the user's query.
3. **Generation**: An enhanced prompt that includes the retrieved knowledge and context to generate a response.
4. **Build Generation**: Logic to generate build recommendations based on user requirements.

## Future Improvements

The current implementation uses a simple keyword-based retrieval system. Future improvements could include:

1. **Vector Embeddings**: Implement vector embeddings for the knowledge base and user queries to enable semantic search.
2. **Vector Database**: Use a vector database like Pinecone, Weaviate, or MongoDB Atlas Vector Search to store and retrieve embeddings.
3. **Enhanced Build Generation**: Implement more sophisticated logic to generate builds based on user requirements, including compatibility checking.
4. **User Preference Learning**: Implement a system to learn from user preferences and improve recommendations over time.
5. **Component Comparison**: Add functionality to compare components and provide detailed explanations of differences.
6. **Price Tracking**: Integrate with price tracking services to provide up-to-date pricing information.
7. **Build Visualization**: Add functionality to visualize builds and provide 3D renderings of the components.

## API Endpoints

### Ask AI Assistant

```
POST /api/ai/ask
```

Request body:
```json
{
  "prompt": "What CPU should I get for gaming?",
  "userId": "user_id",
  "componentType": "cpu",
  "filters": { "price": { "$lte": 300 } }
}
```

Response:
```json
{
  "response": "For gaming, you should focus on single-core performance..."
}
```

### Generate Build

```
POST /api/ai/generate-build
```

Request body:
```json
{
  "requirements": {
    "budget": 1000,
    "purpose": "gaming",
    "performance": "high",
    "preferences": ["rgb", "quiet"]
  },
  "userId": "user_id"
}
```

Response:
```json
{
  "build": {
    "buildType": "Mid-Range Gaming PC",
    "recommendations": "A mid-range gaming PC offers good performance...",
    "requirements": {
      "budget": 1000,
      "purpose": "gaming",
      "performance": "high",
      "preferences": ["rgb", "quiet"]
    },
    "message": "This is a recommendation based on your requirements..."
  }
}
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Start the server: `npm start`

## Environment Variables

- `OLLAMA_URL`: URL of the Ollama API
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT authentication

## Dependencies

- Express.js
- MongoDB
- Mongoose
- Axios
- JWT
- bcryptjs
- validator
