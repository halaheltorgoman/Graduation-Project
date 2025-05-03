const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized. Please Login Again",
    });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.userId = tokenDecode.id; 
    } else {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please Login Again",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

module.exports = userAuth;

