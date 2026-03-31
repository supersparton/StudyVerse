/* ============================================================
   STUDYVERSE — Authentication Routes (routes/auth.js)
   ============================================================
   This file handles three things:
   1. SIGNUP — Create a new user (hash password, save to database, return JWT)
   2. LOGIN  — Check credentials and return JWT
   3. ME     — Get current user info from JWT token (protected route)

   CONCEPTS USED:
   - Express Router    (groups related routes together)
   - bcryptjs          (hashes passwords so we never store plain text)
   - jsonwebtoken      (creates JWTs — secure tokens for authentication)
   - Supabase client    (reads/writes to our PostgreSQL database)
   - Auth Middleware    (protects the /me route)

   WHAT IS A JWT (JSON Web Token)?
   - A JWT is like a digital ID card the server gives you after login
   - The client sends this token with every future request
   - The server can verify it without hitting the database each time
   - It contains: { id, email } + an expiration time
   ============================================================ */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');           // NEW: For creating/verifying tokens
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware'); // NEW: For protecting /me route

const router = express.Router();

// Read the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * generateToken — Creates a JWT token for a user.
 *
 * @param {Object} user - The user object (must have id and email)
 * @returns {string}    - A signed JWT token string
 *
 * HOW IT WORKS:
 * jwt.sign() takes 3 arguments:
 * 1. Payload  — the data to store inside the token (id, email)
 * 2. Secret   — a secret key used to sign/verify the token
 * 3. Options  — expiresIn sets when the token becomes invalid
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },   // Payload: data stored in the token
        JWT_SECRET,                            // Secret key (from .env)
        { expiresIn: '7d' }                    // Token expires in 7 days
    );
}


/* ─────────────────────────────────────────────
   POST /api/auth/signup
   ─────────────────────────────────────────────
   Creates a new user account.
   
   EXPECTED REQUEST BODY:
   {
     "full_name": "Poojan",
     "email": "poojan@example.com",
     "password": "mySecurePassword123"
   }
   
   RESPONSE: User info + JWT token
   ───────────────────────────────────────────── */
router.post('/signup', async function (req, res, next) {
    try {
        // Step 1: Get the data from the request body
        const { full_name, email, password } = req.body;

        // Step 2: Validate — make sure nothing is empty
        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all fields'
            });
        }

        // Step 3: Check if this email already exists in our database
        const { data: existingUser } = await supabase
            .from('users')           // Look in the "users" table
            .select('id')            // We only need the id column
            .eq('email', email)      // WHERE email = the email they typed
            .single();               // Get one result (not an array)

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        // Step 4: Hash the password before storing it
        // bcrypt.hash(password, 10) — the "10" is the salt rounds
        // Higher number = more secure but slower. 10 is a good default.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 5: Insert the new user into the database
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    full_name: full_name,
                    email: email,
                    password: hashedPassword   // Store the HASH, never the real password!
                }
            ])
            .select();  // Return the inserted row

        // If Supabase returned an error
        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to create account. Please try again.'
            });
        }

        // Step 6: Generate a JWT token for the new user
        // This way, users are automatically "logged in" after signing up
        const token = generateToken(data[0]);

        // Step 7: Success! Send back the user info + token (without password)
        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            token: token,       // NEW: JWT token for authentication
            user: {
                id: data[0].id,
                full_name: data[0].full_name,
                email: data[0].email
            }
        });

    } catch (err) {
        // Pass unexpected errors to the centralized error handler
        next(err);
    }
});


/* ─────────────────────────────────────────────
   POST /api/auth/login
   ─────────────────────────────────────────────
   Logs in an existing user.
   
   EXPECTED REQUEST BODY:
   {
     "email": "poojan@example.com",
     "password": "mySecurePassword123"
   }
   
   RESPONSE: User info + JWT token
   ───────────────────────────────────────────── */
router.post('/login', async function (req, res, next) {
    try {
        // Step 1: Get email and password from the request
        const { email, password } = req.body;

        // Step 2: Validate
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please enter both email and password'
            });
        }

        // Step 3: Find the user by email in Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')             // Get all columns
            .eq('email', email)      // WHERE email = typed email
            .single();               // Get one result

        // If no user found with this email
        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Step 4: Compare the typed password with the hashed password in database
        // bcrypt.compare() hashes the typed password and checks if it matches
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Step 5: Generate a JWT token for the authenticated user
        const token = generateToken(user);

        // Step 6: Password matches! Send back user info + token (without password)
        res.json({
            success: true,
            message: 'Login successful!',
            token: token,           // NEW: JWT token for authentication
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        });

    } catch (err) {
        // Pass unexpected errors to the centralized error handler
        next(err);
    }
});


/* ─────────────────────────────────────────────
   GET /api/auth/me
   ─────────────────────────────────────────────
   Returns the currently logged-in user's info.
   
   This is a PROTECTED route — authMiddleware runs first.
   If the token is valid, req.user is set and this handler runs.
   If the token is invalid/missing, authMiddleware sends 401.
   
   USE CASE:
   When the React app loads, it can call GET /api/auth/me
   with the stored token to check if the user is still
   logged in and get their latest info.
   ───────────────────────────────────────────── */
router.get('/me', authMiddleware, async function (req, res, next) {
    try {
        // req.user.id was set by authMiddleware from the JWT token
        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, email, bio, avatar_url, created_at')  // No password!
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user
        });

    } catch (err) {
        next(err);
    }
});


module.exports = router;
