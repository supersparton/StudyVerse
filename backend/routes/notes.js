/* ============================================================
   STUDYVERSE — Notes Routes (routes/notes.js)
   ============================================================
   This file handles CRUD operations for the Notes feature:
   1. GET    /           → Fetch all notes for the logged-in user
   2. POST   /           → Create a new note
   3. PUT    /:id        → Update a note by its ID
   4. DELETE /:id        → Delete a note by its ID

   CONCEPTS USED:
   - Express Router      (groups related routes under /api/notes)
   - Auth Middleware      (protects routes — only logged-in users)
   - Supabase client      (reads/writes to the "notes" table)
   - req.user             (contains user info set by authMiddleware)

   ALL routes in this file are PROTECTED:
   router.use(authMiddleware) applies the auth check to every
   route below it, so you don't need to add it to each one.
   ============================================================ */

const express = require('express');
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new router instance
const router = express.Router();

// ─── Apply auth middleware to ALL routes in this file ───
// Any request to /api/notes/* must have a valid JWT token
router.use(authMiddleware);


/* ─────────────────────────────────────────────
   GET /api/notes
   ─────────────────────────────────────────────
   Fetches ALL notes belonging to the logged-in user.
   
   HOW IT WORKS:
   1. req.user.id comes from the JWT token (set by authMiddleware)
   2. We query Supabase: SELECT * FROM notes WHERE user_id = <id>
   3. Results are sorted by created_at (newest first)
   ───────────────────────────────────────────── */
router.get('/', async function (req, res, next) {
    try {
        // Query the "notes" table for this user's notes
        const { data, error } = await supabase
            .from('notes')                          // Target the "notes" table
            .select('*')                            // Get all columns
            .eq('user_id', req.user.id)             // WHERE user_id = logged-in user's ID
            .order('created_at', { ascending: false }); // Newest notes first

        // If Supabase returns an error, throw it to the error handler
        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);  // Pass to centralized error handler
        }

        // Success — return the array of notes
        res.json({
            success: true,
            count: data.length,    // How many notes were found
            notes: data            // The actual notes array
        });

    } catch (err) {
        // Unexpected errors (network issues, etc.) go to error handler
        next(err);
    }
});


/* ─────────────────────────────────────────────
   POST /api/notes
   ─────────────────────────────────────────────
   Creates a NEW note for the logged-in user.
   
   EXPECTED REQUEST BODY:
   {
     "title": "My Note Title",
     "content": "Note content goes here...",
     "subject": "Mathematics"    (optional)
   }
   ───────────────────────────────────────────── */
router.post('/', async function (req, res, next) {
    try {
        // Step 1: Extract fields from the request body
        const { title, content, subject } = req.body;

        // Step 2: Validate — title is required at minimum
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a title for the note'
            });
        }

        // Step 3: Insert the new note into Supabase
        const { data, error } = await supabase
            .from('notes')
            .insert([
                {
                    user_id: req.user.id,   // Link note to the logged-in user
                    title: title,
                    content: content || '',  // Default to empty string if not provided
                    subject: subject || null // Optional field
                }
            ])
            .select();  // Return the inserted row

        // If Supabase returns an error
        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        // Success — return the created note with 201 (Created) status
        res.status(201).json({
            success: true,
            message: 'Note created successfully!',
            note: data[0]
        });

    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   PUT /api/notes/:id
   ─────────────────────────────────────────────
   Updates an EXISTING note by its ID.
   
   :id is a URL parameter — e.g., PUT /api/notes/42
   req.params.id would be "42"
   
   EXPECTED REQUEST BODY (send only fields you want to update):
   {
     "title": "Updated Title",
     "content": "Updated content",
     "subject": "Physics"
   }
   ───────────────────────────────────────────── */
router.put('/:id', async function (req, res, next) {
    try {
        // Get the note ID from the URL parameter
        const noteId = req.params.id;

        const { title, content, subject, is_favorite } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (subject !== undefined) updates.subject = subject;
        if (is_favorite !== undefined) updates.is_favorite = is_favorite;

        // Update the note in Supabase
        // We use TWO .eq() filters to ensure:
        // 1. We're updating the right note (by ID)
        // 2. The note belongs to this user (security — prevents editing others' notes!)
        const { data, error } = await supabase
            .from('notes')
            .update(updates)
            .eq('id', noteId)               // WHERE id = the note's ID
            .eq('user_id', req.user.id)     // AND user_id = logged-in user
            .select();                       // Return the updated row

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        // If no rows were updated, the note doesn't exist or doesn't belong to this user
        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Note not found or you do not have permission to edit it'
            });
        }

        // Success — return the updated note
        res.json({
            success: true,
            message: 'Note updated successfully!',
            note: data[0]
        });

    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   DELETE /api/notes/:id
   ─────────────────────────────────────────────
   Deletes a note by its ID.
   Only the owner can delete their own notes.
   ───────────────────────────────────────────── */
router.delete('/:id', async function (req, res, next) {
    try {
        const noteId = req.params.id;

        // Delete the note — only if it belongs to the logged-in user
        const { data, error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)               // WHERE id = the note's ID
            .eq('user_id', req.user.id)     // AND user_id = logged-in user
            .select();                       // Return the deleted row

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        // If nothing was deleted, the note didn't exist or wasn't yours
        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Note not found or you do not have permission to delete it'
            });
        }

        // Success — confirm deletion
        res.json({
            success: true,
            message: 'Note deleted successfully!'
        });

    } catch (err) {
        next(err);
    }
});


// Export the router so server.js can mount it at /api/notes
module.exports = router;
