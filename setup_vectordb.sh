#!/bin/bash
# 1. Run in the terminal in the project root directory ==> chmod +x setup_vectordb.sh 
# 2. then run ==> ./setup_vectordb.sh

echo "Starting ChromaDB Setup..."

if ! docker ps &> /dev/null; then
  echo "Docker is not running. Please start Docker Desktop first."
  exit 1
fi

# Check if the container exists
if docker ps -a | grep -q chroma_db; then
  echo "Found existing ChromaDB container."
  if docker ps | grep -q chroma_db; then
    echo "ChromaDB is already running."
  else
    echo "Starting existing ChromaDB container..."
    docker start chroma_db
  fi
else
  echo "Creating new ChromaDB container..."
  # Create the volume if it doesn't exist
  if ! docker volume ls | grep -q chroma_data; then
    echo "Creating chroma_data volume..."
    docker volume create chroma_data
  fi

  docker run -d \
    -p 8001:8000 \
    --name chroma_db \
    --restart unless-stopped \
    -v chroma_data:/chroma/chroma \
    -e CHROMA_DB_IMPL=duckdb+parquet \
    -e PERSIST_DIRECTORY=/chroma/chroma \
    chromadb/chroma
fi

echo "Waiting for ChromaDB to start..."
sleep 15

# Check if ChromaDB is responding
max_retries=5
retry_count=0
while [ $retry_count -lt $max_retries ]; do
  if curl -s http://localhost:8001/api/v2/heartbeat > /dev/null 2>&1; then
    if curl -s http://localhost:8001/api/v2/heartbeat | grep -q "nanosecond"; then
      echo "ChromaDB is running and responding!"
      break
    fi
  fi
  
  retry_count=$((retry_count + 1))
  if [ $retry_count -eq $max_retries ]; then
    echo "Error: Could not connect to ChromaDB after $max_retries attempts"
    docker logs chroma_db
    exit 1
  fi
  
  echo "Waiting for ChromaDB to respond... (Attempt $retry_count of $max_retries)"
  sleep 5
done

echo "ChromaDB has been successfully set up and is running!"
echo "Data is being persisted in the 'chroma_data' volume"