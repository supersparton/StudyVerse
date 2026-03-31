/* ============================================================
   STUDYVERSE — Communities Routes (routes/communities.js)
   ============================================================
   This file handles operations for the Communities feature:
   1. GET    /              → List all communities
   2. POST   /              → Create a new community
   3. POST   /:id/join      → Join a community
   4. POST   /:id/leave     → Leave a community

   CONCEPTS USED:
   - Express Router         (groups routes under /api/communities)
   - Auth Middleware         (protects create/join/leave routes)
   - Supabase client         (reads/writes "communities" & "community_members" tables)

   DATABASE TABLES EXPECTED:
   - communities        → id, name, description, created_by, created_at
   - community_members  → id, community_id, user_id, joined_at
   ============================================================ */

const express = require('express');
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


/* ─────────────────────────────────────────────
   GET /api/communities
   ─────────────────────────────────────────────
   Lists ALL communities (public — no auth needed).
   Anyone can browse communities without logging in.
   ───────────────────────────────────────────── */
router.get('/', async function (req, res, next) {
    try {
        const { data, error } = await supabase
            .from('communities')
            .select('*')
            .order('created_at', { ascending: false }); // Newest communities first

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        res.json({
            success: true,
            count: data.length,
            communities: data
        });

    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   POST /api/communities
   ─────────────────────────────────────────────
   Creates a NEW community (requires login).
   
   EXPECTED REQUEST BODY:
   {
     "name": "JavaScript Study Group",
     "description": "Learn JS together"    (optional)
   }
   ───────────────────────────────────────────── */
router.post('/', authMiddleware, async function (req, res, next) {
    try {
        const { name, description } = req.body;

        // Validate — community name is required
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a name for the community'
            });
        }

        // Insert the community — set created_by to the logged-in user
        const { data, error } = await supabase
            .from('communities')
            .insert([
                {
                    name: name,
                    description: description || '',
                    created_by: req.user.id     // Track who created it
                }
            ])
            .select();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        // Automatically add the creator as a member of the community
        // This way, the person who creates a community is already "in" it
        await supabase
            .from('community_members')
            .insert([
                {
                    community_id: data[0].id,
                    user_id: req.user.id
                }
            ]);

        res.status(201).json({
            success: true,
            message: 'Community created successfully!',
            community: data[0]
        });

    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   POST /api/communities/:id/join
   ─────────────────────────────────────────────
   Joins a community (requires login).
   
   :id is the community's ID from the URL.
   Example: POST /api/communities/5/join
   ───────────────────────────────────────────── */
router.post('/:id/join', authMiddleware, async function (req, res, next) {
    try {
        const communityId = req.params.id;

        // Check if the user is already a member
        const { data: existing } = await supabase
            .from('community_members')
            .select('id')
            .eq('community_id', communityId)
            .eq('user_id', req.user.id)
            .single();

        // If they're already a member, don't add them again
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this community'
            });
        }

        // Add the user as a member
        const { error } = await supabase
            .from('community_members')
            .insert([
                {
                    community_id: communityId,
                    user_id: req.user.id
                }
            ]);

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        res.json({
            success: true,
            message: 'Successfully joined the community!'
        });

    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   POST /api/communities/:id/leave
   ─────────────────────────────────────────────
   Leaves a community (requires login).
   
   Removes the logged-in user from the
   community_members table for this community.
   ───────────────────────────────────────────── */
router.post('/:id/leave', authMiddleware, async function (req, res, next) {
    try {
        const communityId = req.params.id;

        // Remove the user from the community_members table
        const { data, error } = await supabase
            .from('community_members')
            .delete()
            .eq('community_id', communityId)
            .eq('user_id', req.user.id)
            .select();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        // If nothing was deleted, the user wasn't a member
        if (!data || data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'You are not a member of this community'
            });
        }

        res.json({
            success: true,
            message: 'Successfully left the community'
        });

    } catch (err) {
        next(err);
    }
});


module.exports = router;
