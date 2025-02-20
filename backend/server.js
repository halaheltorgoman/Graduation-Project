const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config()
const errorHandler = require("./middleware/errorHandler");

const app = express();

// middlewares
app.use(cors());

app.use(express.json());

app.use("/api/users", require("./routes/users"));
//app.use("/api/users", require("./routes/community"));
//app.use("/api/components", require("./routes/components"));
//app.use("/api/builds", require("./routes/build"));
//app.use("/api/guides", require("./routes/guides"));
//app.use("/api/ai", require("./routes/aiAssistant"));


//app.use(errorHandler);


connectDB().then(() => {
  app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
});