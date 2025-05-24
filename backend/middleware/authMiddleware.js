const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

module.exports = (req, res, next) => {
  // Check for token in Authorization header
  const headerToken = req.header("Authorization")?.replace("Bearer ", "");
  // Check for token in cookies
  const cookieToken = req.cookies?.authToken;

  // Use whichever token is available
  const token = cookieToken || headerToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};
