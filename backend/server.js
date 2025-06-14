const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoutes");
const componentRouter = require("./routes/components");
const buildRouter = require("./routes/build");
const usersRouter = require("./routes/usersRoutes");
const searchRouter = require("./routes/search");
const path = require("path");
// Import routes
const communityRoutes = require("./routes/community");
const app = express();
const postRoutes = require("./routes/createpost");
// Enhanced CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/components", componentRouter);
app.use("/api/users", usersRouter);
// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/posts", postRoutes);
// Routes
app.use("/api/community", communityRoutes);
app.use("/api/build", buildRouter);
app.use("/api/search", searchRouter);
// Error handling middleware (uncomment and implement your errorHandler)
// app.use(errorHandler);

app.use("/api/ai", require("./routes/aiAssistant"));

//app.use(errorHandler);

connectDB().then(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS configured for: ${corsOptions.origin}`);
  });
});
