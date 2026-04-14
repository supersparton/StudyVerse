/* ============================================================
   STUDYVERSE — Express Server (server.js)
   ============================================================
   This is the ENTRY POINT of our backend.
   It does 5 things:
   1. Creates an Express app
   2. Sets up global middleware (CORS, JSON parsing, request logger)
   3. Mounts all route files under their URL prefixes
   4. Handles 404 (route not found) errors
   5. Registers the centralized error handler (must be LAST)

   Run this file with: node server.js
   ============================================================ */

// ─── Load environment variables from .env ───
// This reads the .env file and makes variables available via process.env
require('dotenv').config();

// ─── Import required packages ───
const express = require('express');  // Web framework for Node.js
const cors = require('cors');        // Allows React frontend to talk to this server
const http = require('http');        // required for socket.io
const { Server } = require('socket.io');

// ─── Import our middleware ───
const requestLogger = require('./middleware/logger');         // Logs every request
const errorHandler = require('./middleware/errorHandler');    // Catches all errors

// ─── Import our route files ───
const authRoutes = require('./routes/auth');                 // /api/auth/*
const notesRoutes = require('./routes/notes');               // /api/notes/*
const tasksRoutes = require('./routes/tasks');               // /api/tasks/*
const communitiesRoutes = require('./routes/communities');   // /api/communities/*
const resourcesRoutes = require('./routes/resources');       // /api/resources/*
const profileRoutes = require('./routes/profile');           // /api/profile/*
const pomodoroRoutes = require('./routes/pomodoro');         // /api/pomodoro/*
const analyticsRoutes = require('./routes/analytics');       // /api/analytics/*

// ─── Create the Express app ───
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Create HTTP Server & Socket.IO ───
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    // When a frontend user clicks a channel, they "join" a socket room specific to that channel
    socket.on('join_channel', (channelId) => {
        // Leave previous rooms if any
        Array.from(socket.rooms).forEach(room => {
            if(room !== socket.id) socket.leave(room);
        });
        socket.join('channel_' + channelId);
    });
});

// Middleware to make socket.io accessible inside our routes
app.use((req, res, next) => {
    req.io = io;
    next();
});


/* ─────────────────────────────────────────────
   GLOBAL MIDDLEWARE
   ─────────────────────────────────────────────
   Middleware = functions that run BEFORE your routes.
   Think of them as security guards and helpers 
   at the entrance.
   
   ORDER MATTERS! Middleware runs in the order
   it's registered. That's why:
   1. Logger goes first (logs ALL requests)
   2. CORS goes next (allows frontend access)
   3. JSON parser goes next (parses request bodies)
   4. Routes go next (handle the actual requests)
   5. 404 handler (catches unmatched routes)
   6. Error handler goes LAST (catches all errors)
   ───────────────────────────────────────────── */

// REQUEST LOGGER: Logs every incoming request (method + URL + timestamp)
// Example output: [2026-03-31T19:15:00.000Z]  POST /api/auth/login
app.use(requestLogger);

// CORS: Allow our React frontend (port 5173) to make requests to this server (port 5000)
// Without this, the browser would block all requests from React!
app.use(cors({
    origin: 'http://localhost:5173',  // Vite's default port
    credentials: true                 // Allow cookies/auth headers
}));

// JSON PARSER: Automatically converts incoming JSON data into JavaScript objects
// Without this, req.body would be undefined!
app.use(express.json());


/* ─────────────────────────────────────────────
   ROUTES
   ─────────────────────────────────────────────
   We tell Express: "Any request starting with
   [prefix] should go to [route file]"
   
   EXAMPLE:
   POST /api/auth/signup → routes/auth.js → signup handler
   GET  /api/notes       → routes/notes.js → get all handler
   PUT  /api/tasks/42    → routes/tasks.js → update handler
   
   The route file receives the URL WITHOUT the prefix.
   So /api/notes/42 becomes /:id inside notes.js
   ───────────────────────────────────────────── */

// ─── Auth routes (signup, login, me) ───
app.use('/api/auth', authRoutes);

// ─── Feature routes (all require JWT except community/resource listing) ───
app.use('/api/notes', notesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/communities', communitiesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/analytics', analyticsRoutes);

// Simple test route — visit http://localhost:5000/ in browser to check if server works
app.get('/', function (req, res) {
    res.json({ message: 'StudyVerse Backend is running! 🚀' });
});


/* ─────────────────────────────────────────────
   404 HANDLER — Route Not Found
   ─────────────────────────────────────────────
   If a request doesn't match ANY of the routes above,
   it falls through to here. We send a helpful 404 error.
   
   This must come AFTER all route registrations but
   BEFORE the error handler.
   ───────────────────────────────────────────── */
app.use(function (req, res) {
    res.status(404).json({
        success: false,
        message: 'Route not found: ' + req.method + ' ' + req.originalUrl,
        hint: 'Check the URL and HTTP method. Available prefixes: /api/auth, /api/notes, /api/tasks, /api/communities, /api/resources, /api/profile'
    });
});


/* ─────────────────────────────────────────────
   CENTRALIZED ERROR HANDLER
   ─────────────────────────────────────────────
   This MUST be registered LAST (after all routes).
   
   Any route can call next(err) to pass an error here.
   The error handler logs it and sends a clean JSON
   response to the client.
   
   Express recognizes this as an error handler because
   it has 4 parameters: (err, req, res, next)
   ───────────────────────────────────────────── */
app.use(errorHandler);


/* ─────────────────────────────────────────────
   START THE SERVER
   ───────────────────────────────────────────── */
server.listen(PORT, async function () {
    console.log('');
    console.log('  ✅ StudyVerse Backend is running!');
    console.log('  📡 Server:       http://localhost:' + PORT);
    console.log('');

    // ─── DATABASE CONNECTION CHECK ───
    // Test Supabase connectivity right at startup so we know immediately
    // if the database is reachable or not.
    console.log('  🔄 Checking Supabase connection...');
    try {
        const supabase = require('./supabaseClient');
        const { data, error } = await supabase.from('users').select('id').limit(1);

        if (error) {
            console.log('  ❌ Supabase ERROR: ' + error.message);
            console.log('  ⚠️  The server will run, but database calls will fail!');
            console.log('  💡 Check your SUPABASE_URL and SUPABASE_ANON_KEY in .env');
            console.log('  💡 Make sure your Supabase project is not paused');
        } else {
            console.log('  ✅ Supabase connected successfully!');
        }
    } catch (err) {
        console.log('  ❌ Cannot reach Supabase: ' + err.message);
        console.log('  ⚠️  Possible causes:');
        console.log('     1. No internet connection');
        console.log('     2. SUPABASE_URL in .env is incorrect');
        console.log('     3. Supabase project is paused (check dashboard)');
        console.log('     4. Firewall/proxy blocking the connection');
    }

    console.log('');
    console.log('  🔐 Auth Routes:');
    console.log('     POST /api/auth/signup');
    console.log('     POST /api/auth/login');
    console.log('     GET  /api/auth/me          (protected)');
    console.log('');
    console.log('  📝 Notes Routes:              (all protected)');
    console.log('     GET    /api/notes');
    console.log('     POST   /api/notes');
    console.log('     PUT    /api/notes/:id');
    console.log('     DELETE /api/notes/:id');
    console.log('');
    console.log('  ✅ Tasks Routes:              (all protected)');
    console.log('     GET    /api/tasks');
    console.log('     POST   /api/tasks');
    console.log('     PUT    /api/tasks/:id');
    console.log('     DELETE /api/tasks/:id');
    console.log('');
    console.log('  👥 Communities Routes:');
    console.log('     GET    /api/communities');
    console.log('     POST   /api/communities         (protected)');
    console.log('     POST   /api/communities/:id/join (protected)');
    console.log('     POST   /api/communities/:id/leave(protected)');
    console.log('');
    console.log('  📚 Resources Routes:');
    console.log('     GET    /api/resources');
    console.log('     POST   /api/resources            (protected)');
    console.log('     DELETE /api/resources/:id         (protected)');
    console.log('');
    console.log('  👤 Profile Routes:             (all protected)');
    console.log('     GET    /api/profile');
    console.log('     PUT    /api/profile');
    console.log('');
});
