/* ============================================================
   STUDYVERSE — Tasks Routes (routes/tasks.js)
   ============================================================
   This file handles CRUD operations for the Tasks feature:
   1. GET    /           → Fetch all tasks for the logged-in user
   2. POST   /           → Create a new task
   3. PUT    /:id        → Update a task (title, status, due date, etc.)
   4. DELETE /:id        → Delete a task by its ID

   CONCEPTS USED:
   - Express Router      (groups related routes under /api/tasks)
   - Auth Middleware      (protects all routes below)
   - Supabase client      (reads/writes to the "tasks" table)

   TASK STATUS VALUES (example):
   - "pending"     → Task hasn't been started yet
   - "in_progress" → Task is currently being worked on
   - "completed"   → Task is done
   ============================================================ */

const express = require('express');
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Protect ALL task routes — user must be logged in ───
router.use(authMiddleware);


/* ─────────────────────────────────────────────
   GET /api/tasks
   ─────────────────────────────────────────────
   Fetches ALL tasks for the logged-in user.
   Tasks are ordered by due_date (soonest first),
   so the most urgent tasks appear at the top.
   ───────────────────────────────────────────── */
router.get('/', async function (req, res, next) {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', req.user.id)                 // Only this user's tasks
            .order('due_date', { ascending: true });     // Soonest deadline first

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        res.json({
            success: true,
            count: data.length,
            tasks: data
        });

    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   POST /api/tasks
   ─────────────────────────────────────────────
   Creates a NEW task for the logged-in user.
   
   EXPECTED REQUEST BODY:
   {
     "title": "Complete WAD assignment",
     "description": "Chapter 5 exercises",   (optional)
     "due_date": "2026-04-15",               (optional, ISO date)
     "priority": "high",                     (optional: low/medium/high)
     "status": "pending"                     (optional, defaults to "pending")
   }
   ───────────────────────────────────────────── */
router.post('/', async function (req, res, next) {
    try {
        const { title, description, due_date, priority, status } = req.body;

        // Validate — title is required
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a title for the task'
            });
        }

        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    user_id: req.user.id,
                    title: title,
                    description: description || '',
                    due_date: due_date || null,
                    priority: priority || 'medium',      // Default priority
                    status: status || 'pending'          // Default status
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
            message: 'Task created successfully!',
            task: data[0]
        });

    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   PUT /api/tasks/:id
   ─────────────────────────────────────────────
   Updates an EXISTING task by its ID.
   You can update any combination of fields.
   
   Common use case: Marking a task as "completed"
   PUT /api/tasks/42  →  { "status": "completed" }
   ───────────────────────────────────────────── */
router.put('/:id', async function (req, res, next) {
    try {
        const taskId = req.params.id;
        const { title, description, due_date, priority, status } = req.body;

        // Build an object with only the fields that were provided
        // This way, if the user only sends { status: "completed" },
        // we don't accidentally overwrite title/description with undefined
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (due_date !== undefined) updates.due_date = due_date;
        if (priority !== undefined) updates.priority = priority;
        if (status !== undefined) updates.status = status;

        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .eq('user_id', req.user.id)     // Security: only update YOUR tasks
            .select();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to edit it'
            });
        }

        res.json({
            success: true,
            message: 'Task updated successfully!',
            task: data[0]
        });

    } catch (err) {
        next(err);
    }
});


/* ─────────────────────────────────────────────
   DELETE /api/tasks/:id
   ─────────────────────────────────────────────
   Deletes a task by its ID.
   Only the owner can delete their own tasks.
   ───────────────────────────────────────────── */
router.delete('/:id', async function (req, res, next) {
    try {
        const taskId = req.params.id;

        const { data, error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)
            .eq('user_id', req.user.id)     // Security: only delete YOUR tasks
            .select();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to delete it'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully!'
        });

    } catch (err) {
        next(err);
    }
});


module.exports = router;
