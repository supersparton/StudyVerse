/* ============================================================
   STUDYVERSE — Resources Routes (routes/resources.js)
   ============================================================
   This file handles operations for the Resources feature:
   1. GET    /           → List all resources (supports ?category= filter)
   2. POST   /           → Create/upload a new resource
   3. DELETE /:id        → Delete a resource by its ID

   CONCEPTS USED:
   - Express Router       (groups routes under /api/resources)
   - Auth Middleware       (protects create/delete routes)
   - Query Parameters     (req.query.category for filtering)
   - Supabase client       (reads/writes "resources" table)

   DATABASE TABLE EXPECTED:
   - resources → id, user_id, title, description, url, category, created_at
   
   CATEGORIES (examples):
   - "notes", "videos", "articles", "books", "tools"
   ============================================================ */

const express = require('express');
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


/* ─────────────────────────────────────────────
   GET /api/resources
   GET /api/resources?category=videos
   ─────────────────────────────────────────────
   Lists ALL resources (public — no auth needed).
   
   QUERY PARAMETERS (optional):
   - category: Filter by category
     Example: GET /api/resources?category=videos
     This uses req.query.category to filter results.
   ───────────────────────────────────────────── */
router.get('/', async function (req, res, next) {
    try {
        // Start building the Supabase query
        let query = supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        // If a category filter was provided in the URL, add it to the query
        // Example: GET /api/resources?category=videos
        // req.query.category would be "videos"
        if (req.query.category) {
            query = query.eq('category', req.query.category);
        }

        // Execute the query
        const { data, error } = await query;

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        res.json({
            success: true,
            count: data.length,
            resources: data
        });

    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   POST /api/resources
   ─────────────────────────────────────────────
   Creates a NEW resource (requires login).
   
   EXPECTED REQUEST BODY:
   {
     "title": "Learn Express.js",
     "description": "A great tutorial",     (optional)
     "url": "https://example.com/tutorial",  (optional)
     "category": "articles"                  (optional)
   }
   ───────────────────────────────────────────── */
router.post('/', authMiddleware, async function (req, res, next) {
    try {
        const { title, description, url, category } = req.body;

        // Validate — title is required
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a title for the resource'
            });
        }

        const { data, error } = await supabase
            .from('resources')
            .insert([
                {
                    user_id: req.user.id,        // Track who uploaded it
                    title: title,
                    description: description || '',
                    url: url || null,
                    category: category || 'general'
                }
            ])
            .select();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        res.status(201).json({
            success: true,
            message: 'Resource created successfully!',
            resource: data[0]
        });

    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   DELETE /api/resources/:id
   ─────────────────────────────────────────────
   Deletes a resource by its ID (requires login).
   Only the user who created the resource can delete it.
   ───────────────────────────────────────────── */
router.delete('/:id', authMiddleware, async function (req, res, next) {
    try {
        const resourceId = req.params.id;

        // Delete — only if it belongs to the logged-in user
        const { data, error } = await supabase
            .from('resources')
            .delete()
            .eq('id', resourceId)
            .eq('user_id', req.user.id)     // Security: only delete YOUR resources
            .select();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found or you do not have permission to delete it'
            });
        }

        res.json({
            success: true,
            message: 'Resource deleted successfully!'
        });

    } catch (err) {
        next(err);
    }
});


module.exports = router;
