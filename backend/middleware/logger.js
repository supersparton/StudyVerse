/* ============================================================
   STUDYVERSE — Request Logger Middleware (middleware/logger.js)
   ============================================================
   PURPOSE:
   Logs every HTTP request BEFORE and AFTER it is processed.

   WHAT IS MIDDLEWARE?
   Middleware are functions that run BETWEEN receiving a request
   and sending a response. They can:
   - Read/modify the request (req)
   - Read/modify the response (res)
   - End the request-response cycle
   - Call next() to pass control to the next middleware

   THIS MIDDLEWARE RUNS TWICE:
   ┌─────────────────────────────────────────────────┐
   │  BEFORE: ➡️  Incoming: GET /api/notes           │
   │  (route handler processes the request...)       │
   │  AFTER:  ✅  Completed: GET /api/notes 200 45ms │
   └─────────────────────────────────────────────────┘
   
   The "after" part uses res.on('finish') — an event that
   fires when the response has been fully sent to the client.
   ============================================================ */

/**
 * requestLogger — Logs BEFORE and AFTER every request.
 *
 * BEFORE: Logs the method + URL when request arrives
 * AFTER:  Logs the status code + time taken when response is sent
 *
 * @param {Object}   req  - The incoming request object
 * @param {Object}   res  - The outgoing response object
 * @param {Function} next - Calls the next middleware in the chain
 */
function requestLogger(req, res, next) {
    // Record the start time (used to calculate how long the request took)
    const startTime = Date.now();

    // Get the current date/time as an ISO string
    const timestamp = new Date().toISOString();

    // ─── BEFORE REQUEST PROCESSING ───
    // This runs immediately when the request comes in, BEFORE the route handler
    console.log(`[${timestamp}]  ➡️  Incoming: ${req.method} ${req.originalUrl}`);

    // ─── AFTER RESPONSE IS GENERATED ───
    // res.on('finish') fires AFTER the response has been sent to the client
    // This is how we run code AFTER the route handler is done
    res.on('finish', function () {
        // Calculate how many milliseconds the request took
        const duration = Date.now() - startTime;

        // res.statusCode contains the HTTP status (200, 404, 500, etc.)
        console.log(`[${new Date().toISOString()}]  ✅  Completed: ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });

    // IMPORTANT: Always call next() so the request continues to the route handler.
    // If you forget next(), the request will hang forever!
    next();
}

// Export the middleware so server.js can use it
module.exports = requestLogger;
