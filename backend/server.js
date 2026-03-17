/* ============================================================
   STUDYVERSE — Express Server (server.js)
   ============================================================
   This is the ENTRY POINT of our backend.
   It does 3 things:
   1. Creates an Express app
   2. Sets up middleware (CORS + JSON parsing)
   3. Connects our auth routes and starts listening
   
   Run this file with: node server.js
   ============================================================ */

// ─── Load environment variables from .env ───
require('dotenv').config();

// ─── Import required packages ───
const express = require('express');  // Web framework for Node.js
const cors = require('cors');        // Allows React frontend to talk to this server

// ─── Import our route files ───
const authRoutes = require('./routes/auth');

// ─── Create the Express app ───
const app = express();
const PORT = process.env.PORT || 5000;


/* ─────────────────────────────────────────────
   MIDDLEWARE
   ─────────────────────────────────────────────
   Middleware = functions that run BEFORE your routes.
   Think of them as security guards at the entrance.
   ───────────────────────────────────────────── */

// CORS: Allow our React frontend (port 5173) to make requests to this server (port 5000)
// Without this, the browser would block all requests from React!
app.use(cors({
    origin: 'http://localhost:5173',  // Vite's default port
    credentials: true
}));

// JSON Parser: Automatically converts incoming JSON data into JavaScript objects
// Without this, req.body would be undefined!
app.use(express.json());


/* ─────────────────────────────────────────────
   ROUTES
   ─────────────────────────────────────────────
   We tell Express: "Any request starting with 
   /api/auth should go to the authRoutes file"
   
   So POST /api/auth/signup → routes/auth.js → signup handler
      POST /api/auth/login  → routes/auth.js → login handler
   ───────────────────────────────────────────── */
app.use('/api/auth', authRoutes);

// Simple test route — visit http://localhost:5000/ in browser to check if server works
app.get('/', function (req, res) {
    res.json({ message: 'StudyVerse Backend is running! 🚀' });
});


/* ─────────────────────────────────────────────
   START THE SERVER
   ───────────────────────────────────────────── */
app.listen(PORT, function () {
    console.log('');
    console.log('  ✅ StudyVerse Backend is running!');
    console.log('  📡 Server:  http://localhost:' + PORT);
    console.log('  🔗 Signup:  POST http://localhost:' + PORT + '/api/auth/signup');
    console.log('  🔗 Login:   POST http://localhost:' + PORT + '/api/auth/login');
    console.log('');
});
