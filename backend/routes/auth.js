/* ============================================================
   STUDYVERSE — Authentication Routes (routes/auth.js)
   ============================================================
   This file handles two things:
   1. SIGNUP — Create a new user (hash password, save to database)
   2. LOGIN  — Check if email & password match a user in database
   
   CONCEPTS USED:
   - Express Router (groups related routes together)
   - bcryptjs (hashes passwords so we never store plain text)
   - Supabase client (reads/writes to our PostgreSQL database)
   ============================================================ */

const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../supabaseClient');

// Create a Router — this lets us define routes in a separate file
const router = express.Router();


/* ─────────────────────────────────────────────
   SIGNUP ROUTE: POST /api/auth/signup
   ─────────────────────────────────────────────
   What happens when someone fills the signup form:
   1. We receive their name, email, password
   2. We check if the email is already taken
   3. We hash the password (never store plain text!)
   4. We save the user to the Supabase "users" table
   ───────────────────────────────────────────── */
router.post('/signup', async function (req, res) {
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

        // Step 4: Hash the password
        // "10" is the salt rounds — higher = more secure but slower
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 5: Insert the new user into Supabase
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

        // Step 6: Success! Send back the user info (without password)
        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            user: {
                id: data[0].id,
                full_name: data[0].full_name,
                email: data[0].email
            }
        });

    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
});


/* ─────────────────────────────────────────────
   LOGIN ROUTE: POST /api/auth/login
   ─────────────────────────────────────────────
   What happens when someone fills the login form:
   1. We receive their email and password
   2. We find the user by email in the database
   3. We compare the typed password with the stored hash
   4. If they match → success! If not → error
   ───────────────────────────────────────────── */
router.post('/login', async function (req, res) {
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

        // Step 5: Password matches! Send back user info (without password)
        res.json({
            success: true,
            message: 'Login successful!',
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        });

    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.'
        });
    }
});


// Export the router so server.js can use it
module.exports = router;
