// const jwt = require('jsonwebtoken');

// /**
//  * Middleware to handle session management and authentication
//  * This middleware:
//  * 1. Generates or retrieves session ID
//  * 2. Verifies JWT token if present
//  * 3. Attaches user and session info to request
//  */
// const sessionMiddleware = (req, res, next) => {
//   try {
//     // Get or generate session ID
//     let sessionId = req.cookies?.sessionId;
//     if (!sessionId) {
//       // Generate a simple session ID using timestamp and random number
//       sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
//       res.cookie('sessionId', sessionId, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
//       });
//     }

//     // Get user ID from JWT token if present
//     let userId = null;
//     const authHeader = req.headers.authorization;
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.split(' ')[1];
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         userId = decoded.userId;
//       } catch (error) {
//         // Token is invalid or expired, but we still allow the request
//         // with a null userId (guest session)
//       }
//     }

//     // Attach session info to request
//     req.session = {
//       sessionId,
//       userId
//     };

//     next();
//   } catch (error) {
//     console.error('Session middleware error:', error);
//     next(error);
//   }
// };

// module.exports = sessionMiddleware; 