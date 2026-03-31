/* ============================================================
   STUDYVERSE — Profile Routes (routes/profile.js)
   ============================================================
   This file handles the user's profile operations:
   1. GET /   → Get the logged-in user's profile
   2. PUT /   → Update the logged-in user's profile

   CONCEPTS USED:
   - Express Router       (groups routes under /api/profile)
   - Auth Middleware       (protects both routes — must be logged in)
   - Supabase client       (reads/writes "users" table)
   - req.user.id          (comes from JWT token via authMiddleware)

   NOTE: Both routes use "/" because the user ID comes from
   the JWT token, not from the URL. The server already knows
   WHO is making the request from the token.
   ============================================================ */

const express = require('express');
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Protect ALL profile routes — user must be logged in ───
router.use(authMiddleware);


/* ─────────────────────────────────────────────
   GET /api/profile
   ─────────────────────────────────────────────
   Returns the logged-in user's profile information.
   
   We exclude the password field from the response
   for security — you should NEVER send passwords
   back to the client, even hashed ones.
   ───────────────────────────────────────────── */
router.get('/', async function (req, res, next) {
    try {
        // Fetch the user from the "users" table by their ID
        // We select specific columns to EXCLUDE the password
        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, email, bio, avatar_url, created_at')
            .eq('id', req.user.id)     // WHERE id = logged-in user's ID
            .single();                  // Get one result (not an array)

        if (error || !user) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
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


/* ─────────────────────────────────────────────
   PUT /api/profile
   ─────────────────────────────────────────────
   Updates the logged-in user's profile.
   
   EXPECTED REQUEST BODY (send only fields to update):
   {
     "full_name": "Poojan Updated",
     "bio": "I love building web apps",
     "avatar_url": "https://example.com/avatar.jpg"
   }
   
   NOTE: We do NOT allow updating email or password here.
   Those should have separate, more secure flows
   (like email verification or password reset).
   ───────────────────────────────────────────── */
router.put('/', async function (req, res, next) {
    try {
        const { full_name, bio, avatar_url } = req.body;

        // Build an object with only the fields that were provided
        // This prevents accidentally overwriting fields with "undefined"
        const updates = {};
        if (full_name !== undefined) updates.full_name = full_name;
        if (bio !== undefined) updates.bio = bio;
        if (avatar_url !== undefined) updates.avatar_url = avatar_url;

        // Check if any fields were actually provided
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one field to update (full_name, bio, or avatar_url)'
            });
        }

        // Update the user's profile in the database
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.user.id)     // Only update the logged-in user's row
            .select('id, full_name, email, bio, avatar_url, created_at');  // Return updated data (no password!)

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully!',
            user: data[0]
        });

    } catch (err) {
        next(err);
    }
});


module.exports = router;
