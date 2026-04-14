const express = require('express');
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/* ─────────────────────────────────────────────
   POST /api/pomodoro/session
   ─────────────────────────────────────────────
   Logs a completed Pomodoro focus session.
   EXPECTED BODY:
   {
       "focus_seconds": 1500
   }
   ───────────────────────────────────────────── */
router.post('/session', authMiddleware, async function (req, res, next) {
    try {
        const { focus_seconds } = req.body;

        if (!focus_seconds) {
            return res.status(400).json({
                success: false,
                message: 'focus_seconds is required'
            });
        }

        const { data, error } = await supabase
            .from('study_sessions')
            .insert([{
                user_id: req.user.id,
                focus_seconds: focus_seconds
            }])
            .select();

        if (error) {
            const err = new Error(error.message);
            err.statusCode = 500;
            return next(err);
        }

        res.status(201).json({
            success: true,
            message: 'Session logged successfully',
            session: data[0]
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
