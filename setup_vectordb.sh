#!/bin/bash
# 1. Run in the terminal in the project root directory ==> chmod +x setup_vectordb.sh 
# 2. then run ==> ./setup_vectordb.sh

echo "Starting ChromaDB Setup..."

if ! docker ps &> /dev/null; then
  echo "Docker is not running. Please start Docker Desktop first."
  exit 1
fi

if docker ps -a | grep -q chroma_db; then
  echo "Found existing ChromaDB container. Removing it..."
  docker rm -f chroma_db
fi

echo "Starting ChromaDB container..."
docker run -d \
  -p 8001:8000 \
  --name chroma_db \
  -v chroma_data:/chroma/chroma \
  chromadb/chroma

sleep 15

if ! curl -s http://localhost:8001/api/v2/heartbeat > /dev/null 2>&1; then
  echo "Error: Could not connect to ChromaDB"
  docker logs chroma_db
  exit 1
fi

if ! curl -s http://localhost:8001/api/v2/heartbeat | grep -q "nanosecond"; then
  echo "Error: ChromaDB heartbeat check failed"
  docker logs chroma_db
  exit 1
fi

echo "ChromaDB has been successfully set up and is running!"