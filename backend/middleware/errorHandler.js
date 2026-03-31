/* ============================================================
   STUDYVERSE — Centralized Error Handler (middleware/errorHandler.js)
   ============================================================
   PURPOSE:
   A single place to catch and format ALL errors in the app.

   WHY DO WE NEED THIS?
   Without a centralized handler, you'd have to write try/catch
   in every single route — and each might format errors differently.
   With this middleware, any route can simply call:
       next(error)
   and this handler will catch it, log it, and send a clean
   JSON response to the client.

   HOW EXPRESS ERROR HANDLERS WORK:
   Express recognizes a middleware as an error handler if it
   has EXACTLY 4 parameters: (err, req, res, next).
   This middleware must be registered LAST in server.js
   (after all routes) so it catches errors from everywhere.
   ============================================================ */

/**
 * errorHandler — Catches any error passed via next(err) and returns
 * a consistent JSON error response.
 *
 * @param {Error}    err  - The error object (thrown or passed via next())
 * @param {Object}   req  - The incoming request object
 * @param {Object}   res  - The outgoing response object
 * @param {Function} next - The next middleware (required for Express to
 *                          recognize this as an error handler, even though
 *                          we don't call it here)
 */
function errorHandler(err, req, res, next) {
    // Log the full error to the server console for debugging
    console.error('─── ERROR ───');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('─────────────');

    // Determine the HTTP status code to send:
    // - If the error already has a statusCode (set by our code), use it
    // - Otherwise, default to 500 (Internal Server Error)
    const statusCode = err.statusCode || 500;

    // Send a clean JSON response to the client
    // In production, you'd hide the stack trace for security
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',

        // Only show the stack trace in development mode
        // This helps with debugging but should be hidden in production
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
}

// Export the error handler so server.js can use it
module.exports = errorHandler;
