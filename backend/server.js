const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const authRouter = require("./routes/authRoutes");
const usersRouter = require("./routes/usersRoutes");
const chatRoutes = require('./routes/chatRoutes');

const app = express();
// middlewares
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/community", require("./routes/community"));
app.use("/api/components", require("./routes/components"));
app.use("/api/builds", require("./routes/build"));
app.use("/api/search", require("./routes/search"));
app.use("/api/post", require("./routes/createpost"));

//app.use("/api/guides", require("./routes/guides"));
app.use("/api/ai", require("./routes/aiAssistant"));
app.use('/api/chat', chatRoutes);
app.use("/api/guides", require("./routes/guides"));
//app.use("/api/ai", require("./routes/aiAssistant"));

//app.use(errorHandler);

connectDB().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
});
