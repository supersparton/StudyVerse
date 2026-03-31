/* ============================================================
   STUDYVERSE — Auth Middleware (middleware/authMiddleware.js)
   ============================================================
   PURPOSE:
   Protects routes so only logged-in users can access them.

   HOW IT WORKS:
   1. Client sends a request with the header:
      Authorization: Bearer eyJhbGciOi...  (the JWT token)
   2. This middleware extracts the token from the header
   3. It verifies the token using the same JWT_SECRET used to sign it
   4. If valid → attaches user info to req.user and calls next()
   5. If invalid/missing → sends 401 Unauthorized

   USAGE IN ROUTES:
   const authMiddleware = require('../middleware/authMiddleware');
   
   // Apply to a single route:
   router.get('/profile', authMiddleware, handler);
   
   // Apply to ALL routes in a router:
   router.use(authMiddleware);
   ============================================================ */

const jwt = require('jsonwebtoken');

// Read the secret key from environment variables
// This MUST match the secret used when creating tokens in auth.js
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * authMiddleware — Verifies the JWT token in the Authorization header.
 * If valid, attaches the decoded user data to req.user.
 * If invalid or missing, responds with 401 Unauthorized.
 *
 * @param {Object}   req  - The incoming request object
 * @param {Object}   res  - The outgoing response object
 * @param {Function} next - Calls the next middleware/route handler
 */
function authMiddleware(req, res, next) {
    // Step 1: Get the Authorization header
    // Expected format: "Bearer eyJhbGciOi..."
    const authHeader = req.headers.authorization;

    // Step 2: Check if the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided. Please log in first.'
        });
    }

    // Step 3: Extract the token (remove "Bearer " prefix)
    // "Bearer eyJhbGciOi..." → "eyJhbGciOi..."
    const token = authHeader.split(' ')[1];

    try {
        // Step 4: Verify the token using our secret key
        // jwt.verify() decodes the token AND checks if it's valid/expired
        // If invalid, it throws an error (caught by the catch block)
        const decoded = jwt.verify(token, JWT_SECRET);

        // Step 5: Attach the decoded user data to the request object
        // Now any route handler can access req.user.id, req.user.email, etc.
        req.user = decoded;

        // Step 6: Token is valid — continue to the next middleware/route
        next();

    } catch (err) {
        // Token is invalid, expired, or tampered with
        console.error('JWT verification failed:', err.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        });
    }
}

// Export so route files can use it
module.exports = authMiddleware;
