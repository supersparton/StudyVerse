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

        const filter = req.query.filter || 'This Week';
        console.log(`[Analytics] Received filter: "${filter}" for user: ${userId}`);

        let filterDate = new Date(0);
        const now = new Date();

        if (filter === 'Today') {
            filterDate = new Date(new Date().setHours(0, 0, 0, 0));
        } else if (filter === 'This Week') {
            filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (filter === 'This Month') {
            filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        console.log(`[Analytics] Filtering sessions since: ${filterDate.toISOString()}`);

        const filteredSessions = (sessions || []).filter(s => new Date(s.created_at) >= filterDate);
        console.log(`[Analytics] Found ${sessions?.length || 0} total sessions. After filter: ${filteredSessions.length}`);

        // 1. Calculate stats based on FILTERED sessions (except for streak/total)
        let filteredFocusSeconds = 0;
        filteredSessions.forEach(s => {
            filteredFocusSeconds += (Number(s.focus_seconds) || 0);
        });

        // 2. Global totals (always total)
        let totalFocusSeconds = (sessions || []).reduce((acc, s) => acc + (Number(s.focus_seconds) || 0), 0);

        // 3. Weekly Data (always for the last 7 days regardless of main filter for the list)
        let weeklyDataMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);

        (sessions || []).forEach(s => {
            const sessionDate = new Date(s.created_at);
            if (sessionDate >= oneWeekAgo) {
                const dayName = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });
                if (weeklyDataMap[dayName] !== undefined) {
                    weeklyDataMap[dayName] += (Number(s.focus_seconds) || 0) / 3600;
                }
            }
        });

        // Formatted strings
        const formatTime = (totalSecs) => {
            const h = Math.floor(totalSecs / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            if (h === 0 && m === 0 && totalSecs > 0) return `${totalSecs}s`;
            return `${h}h ${m}m`;
        };

        // Graph scaling logic
        const maxHours = Math.max(...Object.values(weeklyDataMap));
        const weeklyData = Object.keys(weeklyDataMap).map(day => {
            const hours = weeklyDataMap[day];
            let percentage = 0;
            if (maxHours > 0) {
                // Use a minimum 5% height for any non-zero day so it's visible
                percentage = Math.max(hours > 0 ? 5 : 0, (hours / maxHours) * 100);
            }
            return {
                day: day,
                hours: parseFloat(hours.toFixed(2)),
                height: percentage + '%'
            };
        });

        const tasksCompleted = (tasks || []).filter(t => t.status === 'completed').length;
        const tasksPending = (tasks || []).filter(t => t.status !== 'completed').length;

        // Streak Logic (Full history)
        let streakDays = 0;
        if (sessions && sessions.length > 0) {
            const uniqueDates = Array.from(new Set(sessions.map(s => {
                const d = new Date(s.created_at);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }))).sort().reverse();
            if (uniqueDates.length > 0) {
                const nowRef = new Date();
                const todayStr = `${nowRef.getFullYear()}-${String(nowRef.getMonth() + 1).padStart(2, '0')}-${String(nowRef.getDate()).padStart(2, '0')}`;
                const yesterday = new Date(nowRef.getTime() - 24 * 60 * 60 * 1000);
                const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
                if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
                    streakDays = 1;
                    for (let i = 0; i < uniqueDates.length - 1; i++) {
                        const current = new Date(uniqueDates[i]);
                        const prevDate = new Date(uniqueDates[i + 1]);
                        const diffTime = Math.abs(current - prevDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays === 1) streakDays++;
                        else break;
                    }
                }
            }
        }

        const currentTodayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
        const sessionsToday = (sessions || []).filter(s => {
            const d = new Date(s.created_at);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === currentTodayStr;
        }).length;

        res.set('Cache-Control', 'no-store');
        res.json({
            success: true,
            serverTime: new Date().toISOString(),
            sessionsToday: sessionsToday,
            stats: {
                totalStudyHours: formatTime(totalFocusSeconds),
                filteredStudyHours: formatTime(filteredFocusSeconds),
                last24hFocusTime: formatTime((sessions || []).filter(s => new Date(s.created_at) >= new Date(new Date().getTime() - 24 * 60 * 60 * 1000)).reduce((a, b) => a + Number(b.focus_seconds), 0)),
                tasksCompleted: tasksCompleted,
                tasksTotal: tasks.length,
                tasksPending: tasksPending,
                streakDays: streakDays,
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
