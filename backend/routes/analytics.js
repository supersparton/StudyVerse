const express = require('express');
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/* ─────────────────────────────────────────────
   GET /api/analytics
   ─────────────────────────────────────────────
   Aggregates data for the user:
   - Total Study Hours (from study_sessions)
   - Tasks Completed (from tasks)
   - Weekly graph data
   ───────────────────────────────────────────── */
router.get('/', authMiddleware, async function (req, res, next) {
    try {
        const userId = req.user.id;

        // 1. Fetch study sessions for focus time
        const { data: sessions, error: sessionsError } = await supabase
            .from('study_sessions')
            .select('focus_seconds, created_at')
            .eq('user_id', userId);

        if (sessionsError) throw new Error(sessionsError.message);

        // 2. Fetch tasks for "Tasks Pending" and "Tasks Completed"
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('status')
            .eq('user_id', userId);

        if (tasksError) throw new Error(tasksError.message);

        // Calculate totals
        let totalFocusSeconds = 0;
        let weeklyDataMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        (sessions || []).forEach(s => {
            totalFocusSeconds += s.focus_seconds;

            const sessionDate = new Date(s.created_at);
            if (sessionDate >= oneWeekAgo) {
                // Determine day of week
                const dayName = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });
                if (weeklyDataMap[dayName] !== undefined) {
                    weeklyDataMap[dayName] += s.focus_seconds / 3600; // Store hours
                }
            }
        });

        // Format weekly data for charting
        let maxHours = Math.max(...Object.values(weeklyDataMap), 1); // Avoid division by 0
        const weeklyData = Object.keys(weeklyDataMap).map(day => {
            const hours = weeklyDataMap[day];
            let percentage = (hours / maxHours) * 100;
            return {
                day: day,
                hours: parseFloat(hours.toFixed(1)),
                height: percentage + '%'
            };
        });

        const totalHours = Math.floor(totalFocusSeconds / 3600);
        const totalMinutes = Math.floor((totalFocusSeconds % 3600) / 60);

        const tasksCompleted = (tasks || []).filter(t => t.status === 'completed').length;
        const tasksPending = (tasks || []).filter(t => t.status !== 'completed').length;

        // Send all stats in one payload
        res.json({
            success: true,
            stats: {
                totalStudyHours: `${totalHours}h ${totalMinutes}m`,
                rawFocusSeconds: totalFocusSeconds,
                tasksCompleted: tasksCompleted,
                tasksTotal: tasks.length,
                tasksPending: tasksPending,
                streakDays: 1, // Optional: Calculate real streak
                productivityScore: Math.min(100, Math.floor((tasksCompleted / (tasks.length || 1)) * 100))
            },
            weeklyData: weeklyData
        });

    } catch (err) {
        err.statusCode = 500;
        next(err);
    }
});

module.exports = router;
