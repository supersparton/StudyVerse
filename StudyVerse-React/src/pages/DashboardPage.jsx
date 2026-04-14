/* ============================================================
   STUDYVERSE — Dashboard Page Component (DashboardPage.jsx)
   ============================================================
   The main overview page after login. Shows:
   - Welcome message with streak card
   - Stats grid (Focus Time, Tasks Pending, Resources Shared)
   - Upcoming tasks list with checkboxes
   - Community cards
   
   REACT CONCEPTS USED:
   - DashboardLayout (wraps page with sidebar)
   - useState (for task checkbox toggling)
   - Link (navigate to other pages)
   ============================================================ */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

function DashboardPage() {
    // ─── STATE variables ───
    const [userName, setUserName] = useState('Student');
    const [tasks, setTasks] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalStudyHours: '0h 0m',
        tasksPending: 0,
        productivityScore: 0,
        resourcesShared: 0,
        streakDays: 1
    });

    const API = import.meta.env.VITE_API_URL;

    function getToken() {
        var user = localStorage.getItem('studyverse-user');
        if (user) return JSON.parse(user).token;
        return null;
    }

    useEffect(function () {
        const saved = localStorage.getItem('studyverse-user');
        let parsedUser;
        if (saved) {
            parsedUser = JSON.parse(saved);
            setUserName(parsedUser.full_name);
        }

        async function fetchData() {
            try {
                let token = getToken();
                if (!token) return;

                // Fetch Tasks
                let taskRes = await fetch(API + '/api/tasks', { headers: { 'Authorization': 'Bearer ' + token } });
                let taskData = await taskRes.json();
                if (taskData.success) {
                    setTasks(taskData.tasks.filter(t => t.status !== 'completed').slice(0, 4));
                }

                // Fetch Communities
                let commRes = await fetch(API + '/api/communities');
                let commData = await commRes.json();
                if (commData.success) {
                    setCommunities(commData.communities.slice(0, 2));
                }

                // Fetch Analytics
                let analyticsRes = await fetch(API + '/api/analytics', { headers: { 'Authorization': 'Bearer ' + token } });
                let analyticsData = await analyticsRes.json();
                
                // Fetch Resources using general resources route
                let resRes = await fetch(API + '/api/resources');
                let resData = await resRes.json();

                if (analyticsData.success) {
                    setAnalytics({
                        totalStudyHours: analyticsData.stats.totalStudyHours,
                        tasksPending: analyticsData.stats.tasksPending,
                        productivityScore: analyticsData.stats.productivityScore,
                        streakDays: analyticsData.stats.streakDays,
                        // Calculate how many resources were uploaded by THIS user
                        resourcesShared: resData.success && parsedUser ? resData.resources.filter(r => r.user_id === parsedUser.id).length : 0 
                    });
                }

            } catch (err) {
                console.error("Dashboard fetch error:", err);
            }
        }
        fetchData();
    }, []);

    async function toggleTaskStatus(task) {
        try {
            await fetch(API + '/api/tasks/' + task.id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
                body: JSON.stringify({ status: 'completed' })
            });
            // Remove from UI immediately
            setTasks(prev => prev.filter(t => t.id !== task.id));
        } catch (e) {
            console.error('Failed to toggle task:', e);
        }
    }

    return (
        <DashboardLayout>
            {/* ─── Top Header ─── */}
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search notes, tasks, or communities..." />
                </div>
                <div className="header-actions">
                    <Link to="/notes" className="btn btn-outline text-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> New Note
                    </Link>
                    <Link to="/pomodoro" className="btn btn-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer</span> Start Focus Session
                    </Link>
                    <button className="icon-btn">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="notif-dot"></span>
                    </button>
                </div>
            </header>

            {/* ─── Scrollable Content ─── */}
            <div className="content-scroll">
                <div className="content-grid">

                    {/* ─── Welcome Section ─── */}
                    <section className="welcome-section fade-in-up">
                        <div className="welcome-text">
                            <h1>Good evening, {userName}! 👋</h1>
                            <p>You've achieved {analytics.productivityScore}% productivity. Keep up the momentum!</p>
                        </div>
                        <div className="streak-card">
                            <div className="streak-info">
                                <span className="streak-label">Current Streak</span>
                                <div className="streak-value">
                                    {analytics.streakDays} Days
                                    <span className="material-symbols-outlined fire-icon">local_fire_department</span>
                                </div>
                            </div>
                            <div className="streak-ring">{analytics.productivityScore}%</div>
                        </div>
                    </section>

                    {/* ─── Stats Grid ─── */}
                    <section className="stats-grid fade-in-up fade-in-up-delay-1">
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--indigo-light)', color: 'var(--primary)' }}>
                                    <span className="material-symbols-outlined">schedule</span>
                                </div>
                            </div>
                            <h3>{analytics.totalStudyHours}</h3>
                            <p>Focus Time</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>
                                    <span className="material-symbols-outlined">check_box</span>
                                </div>
                            </div>
                            <h3>{analytics.tasksPending}</h3>
                            <p>Tasks Pending</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--cyan-light)', color: 'var(--cyan)' }}>
                                    <span className="material-symbols-outlined">share</span>
                                </div>
                            </div>
                            <h3>{analytics.resourcesShared}</h3>
                            <p>Resources Shared</p>
                        </div>
                    </section>

                    {/* ─── Tasks + Communities ─── */}
                    <section className="main-grid fade-in-up fade-in-up-delay-2">
                        {/* Tasks */}
                        <div className="tasks-card">
                            <div className="card-header">
                                <h3>Upcoming Tasks</h3>
                                <Link to="/tasks">View All</Link>
                            </div>
                            <div className="task-list">
                                {tasks.length > 0 ? tasks.map(function (task) {
                                    return (
                                        <div className="task-item" key={task.id}>
                                            <div
                                                className="task-checkbox"
                                                onClick={function () { toggleTaskStatus(task); }}
                                            ></div>
                                            <div className="task-info">
                                                <span className="task-name">{task.title}</span>
                                                <span className="task-meta">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                                            </div>
                                            <span className={'badge ' + (task.priority === 'high' ? 'badge-red' : task.priority === 'low' ? 'badge-green' : 'badge-orange')}>
                                                {task.priority || 'med'}
                                            </span>
                                        </div>
                                    );
                                }) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>No upcoming tasks. Enjoy your day!</p>
                                )}
                            </div>
                        </div>

                        {/* Communities */}
                        <div className="communities-col">
                            <div className="col-header">
                                <h3>Your Communities</h3>
                                <Link to="/communities" className="icon-btn">
                                    <span className="material-symbols-outlined">add_circle</span>
                                </Link>
                            </div>
                            
                            {communities.length > 0 ? communities.map((c, i) => (
                                <div className="community-card" key={c.id}>
                                    <div className="cover" style={{ backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'][i % 4]}}></div>
                                    <div className="card-icon" style={{ background: 'var(--primary)' }}>
                                        <span className="material-symbols-outlined">groups</span>
                                    </div>
                                    <div className="card-body">
                                        <h4>{c.name}</h4>
                                        <p className="members">{c.description ? c.description.substring(0, 30) + '...' : 'Members Online'}</p>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>No communities yet.</p>
                            )}
                        </div>
                    </section>

                    <footer style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        © 2025 StudyVerse. Empowering Students Worldwide.
                    </footer>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default DashboardPage;
