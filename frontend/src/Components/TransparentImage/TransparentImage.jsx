import React, { useState, useEffect, useRef } from "react";

const TransparentImage = ({ src, alt, className }) => {
  const canvasRef = useRef(null);
  const [processedSrc, setProcessedSrc] = useState("");

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Threshold for white detection (adjust as needed)
      const threshold = 230;
      const edgeThreshold = 5; // Pixels from edge to start flood fill

      // Create a visited matrix
      const visited = new Array(width * height).fill(false);

      // Queue for flood fill
      const queue = [];

      // Add edge pixels to queue
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (
            x < edgeThreshold ||
            x >= width - edgeThreshold ||
            y < edgeThreshold ||
            y >= height - edgeThreshold
          ) {
            const index = y * width + x;
            if (!visited[index]) {
              const pixelIndex = index * 4;
              if (isWhite(data, pixelIndex, threshold)) {
                queue.push({ x, y });
                visited[index] = true;
              }
            }
          }
        }
      }

      // Flood fill algorithm to find connected white background
      while (queue.length > 0) {
        const { x, y } = queue.shift();
        const index = y * width + x;
        const pixelIndex = index * 4;

        // Make this white pixel transparent
        data[pixelIndex + 3] = 0;

        // Check 4-connected neighbors
        const neighbors = [
          { x: x - 1, y },
          { x: x + 1, y },
          { x, y: y - 1 },
          { x, y: y + 1 },
        ];

        for (const neighbor of neighbors) {
          if (
            neighbor.x >= 0 &&
            neighbor.x < width &&
            neighbor.y >= 0 &&
            neighbor.y < height
          ) {
            const neighborIndex = neighbor.y * width + neighbor.x;
            if (!visited[neighborIndex]) {
              const neighborPixelIndex = neighborIndex * 4;
              if (isWhite(data, neighborPixelIndex, threshold)) {
                queue.push(neighbor);
                visited[neighborIndex] = true;
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedSrc(canvas.toDataURL());
    };
  }, [src]);

  // Helper function to check if a pixel is white
  const isWhite = (data, index, threshold) => {
    return (
      data[index] > threshold &&
      data[index + 1] > threshold &&
      data[index + 2] > threshold
    );
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {processedSrc ? (
        <img src={processedSrc} alt={alt} className={className} />
      ) : (
        <img src={src} alt={alt} className={className} />
      )}
    </>
  );
};

export default TransparentImage;
