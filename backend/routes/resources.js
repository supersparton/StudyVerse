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
const multer = require('multer');

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

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
            // Fetch the resource details PLUS the full_name and avatar of who uploaded it!
            .select('*, users(full_name, avatar_url)')
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
router.post('/', authMiddleware, upload.single('file'), async function (req, res, next) {
    try {
        const { title, description, category, semester } = req.body;
        let url = req.body.url || null;

        // Validate — title is required
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a title for the resource'
            });
        }

        // --- NEW: Handle file upload if present ---
        if (req.file) {
            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `resource_${req.user.id}_${Date.now()}.${fileExt}`;
            
            // Upload to Supabase Storage 'resources' bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('resources')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (uploadError) {
                console.error("Resource Upload Error:", uploadError.message);
                if (uploadError.message.toLowerCase().includes('size')) {
                    return res.status(400).json({ success: false, message: 'File is too large. Please upload a smaller file.' });
                }
                return res.status(500).json({ success: false, message: 'Failed to upload file' });
            }

            // Get the public URL of the uploaded file
            const { data: publicURLData } = supabase.storage
                .from('resources')
                .getPublicUrl(fileName);
                
            url = publicURLData.publicUrl;
        }

        const { data, error } = await supabase
            .from('resources')
            .insert([
                {
                    user_id: req.user.id,        // Track who uploaded it
                    title: title,
                    description: description || '',
                    url: url,
                    category: category || 'general',
                    semester: semester || '1'
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


/* ─────────────────────────────────────────────
   POST /api/resources/:id/view
   ─────────────────────────────────────────────
   Increments the view count for a specific resource
   ───────────────────────────────────────────── */
router.post('/:id/view', async function (req, res, next) {
    try {
        const resourceId = req.params.id;

        // Fetch current views
        const { data: current, error: fetchErr } = await supabase
            .from('resources')
            .select('view_count')
            .eq('id', resourceId)
            .single();

        if (fetchErr) {
            console.error("View Fetch Error:", fetchErr);
            return res.status(500).json({ success: false, message: 'DB Error: ' + fetchErr.message });
        }
        if (!current) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        // Increment it
        const { data, error } = await supabase
            .from('resources')
            .update({ view_count: (current.view_count || 0) + 1 })
            .eq('id', resourceId)
            .select();

        if (error) throw new Error(error.message);

        res.json({ success: true, view_count: data[0].view_count });
    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   POST /api/resources/:id/vote
   ─────────────────────────────────────────────
   Increments upvotes or downvotes 
   Expected Body: { direction: 'up' | 'down' }
   ───────────────────────────────────────────── */
router.post('/:id/vote', authMiddleware, async function (req, res, next) {
    try {
        const resourceId = req.params.id;
        const { direction, previous } = req.body;

        if (direction !== 'up' && direction !== 'down') {
            return res.status(400).json({ success: false, message: "Direction must be 'up' or 'down'" });
        }

        // Fetch current votes
        const { data: current, error: fetchErr } = await supabase
            .from('resources')
            .select('upvotes, downvotes')
            .eq('id', resourceId)
            .single();

        if (fetchErr) {
            console.error("Vote Fetch Error:", fetchErr);
            return res.status(500).json({ success: false, message: 'DB Error: ' + fetchErr.message });
        }
        if (!current) return res.status(404).json({ success: false, message: 'Resource not found' });

        const updates = { 
            upvotes: current.upvotes || 0, 
            downvotes: current.downvotes || 0 
        };

        // Logic for Reddit-style vote swapping!
        if (direction === previous) {
            // User clicked the SAME button — meaning they want to REMOVE their vote!
            if (direction === 'up') updates.upvotes = Math.max(0, updates.upvotes - 1);
            if (direction === 'down') updates.downvotes = Math.max(0, updates.downvotes - 1);
        } else {
            // User is casting a new vote, or swapping their vote
            if (direction === 'up') updates.upvotes += 1;
            if (direction === 'down') updates.downvotes += 1;
            
            // If they swapped, decrement the previous one they had active
            if (previous === 'up') updates.upvotes = Math.max(0, updates.upvotes - 1);
            if (previous === 'down') updates.downvotes = Math.max(0, updates.downvotes - 1);
        }

        // Update specific metric
        const { data, error } = await supabase
            .from('resources')
            .update(updates)
            .eq('id', resourceId)
            .select();

        if (error) {
            console.error("Vote Update Error:", error);
            throw new Error(error.message);
        }

        res.json({ 
            success: true, 
            upvotes: data[0].upvotes,
            downvotes: data[0].downvotes 
        });

    } catch (err) {
        next(err);
    }
});


module.exports = router;
