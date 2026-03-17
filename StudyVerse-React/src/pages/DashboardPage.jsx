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
    // ─── STATE: Track which tasks are checked ───
    const [checkedTasks, setCheckedTasks] = useState([false, false, false, false]);

    // ─── STATE: Logged-in user's name ───
    const [userName, setUserName] = useState('Student');

    // ─── Read the logged-in user's name from localStorage ───
    useEffect(function () {
        const saved = localStorage.getItem('studyverse-user');
        if (saved) {
            const user = JSON.parse(saved);
            setUserName(user.full_name);
        }
    }, []);

    // Toggle a specific task's checked state
    function toggleTask(index) {
        // Create a copy of the array (never modify state directly!)
        const updated = [...checkedTasks];
        updated[index] = !updated[index]; // Flip true↔false
        setCheckedTasks(updated);
    }

    // ─── Task data (hardcoded for now) ───
    const tasks = [
        { name: 'Review Calculus Chapter 4', meta: 'Math 201 • Today', priority: 'High', badgeClass: 'badge-red' },
        { name: 'Submit History Essay Draft', meta: 'History 101 • Tomorrow', priority: 'Med', badgeClass: 'badge-orange' },
        { name: 'Group Project Meeting', meta: 'Design 300 • Wed, 2:00 PM', priority: 'Low', badgeClass: 'badge-green' },
        { name: 'Read Chapter 5: Organic Chemistry', meta: 'Chemistry 101 • Wed', priority: 'Low', badgeClass: 'badge-green' },
    ];

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
                            <p>You've completed 80% of your weekly goals. Keep up the momentum!</p>
                        </div>
                        <div className="streak-card">
                            <div className="streak-info">
                                <span className="streak-label">Current Streak</span>
                                <div className="streak-value">
                                    5 Days
                                    <span className="material-symbols-outlined fire-icon">local_fire_department</span>
                                </div>
                            </div>
                            <div className="streak-ring">80%</div>
                        </div>
                    </section>

                    {/* ─── Stats Grid ─── */}
                    <section className="stats-grid fade-in-up fade-in-up-delay-1">
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--indigo-light)', color: 'var(--primary)' }}>
                                    <span className="material-symbols-outlined">schedule</span>
                                </div>
                                <span className="stat-trend">
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
                                    +10%
                                </span>
                            </div>
                            <h3>12h 30m</h3>
                            <p>Focus Time this week</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>
                                    <span className="material-symbols-outlined">check_box</span>
                                </div>
                                <span className="badge badge-orange">1 Urgent</span>
                            </div>
                            <h3>4</h3>
                            <p>Tasks Pending</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--cyan-light)', color: 'var(--cyan)' }}>
                                    <span className="material-symbols-outlined">share</span>
                                </div>
                            </div>
                            <h3>12</h3>
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
                                {tasks.map(function (task, index) {
                                    return (
                                        <div className="task-item" key={index}>
                                            <div
                                                className={'task-checkbox' + (checkedTasks[index] ? ' checked' : '')}
                                                onClick={function () { toggleTask(index); }}
                                            ></div>
                                            <div className="task-info">
                                                <span className="task-name">{task.name}</span>
                                                <span className="task-meta">{task.meta}</span>
                                            </div>
                                            <span className={'badge ' + task.badgeClass}>{task.priority}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Communities */}
                        <div className="communities-col">
                            <div className="col-header">
                                <h3>Your Communities</h3>
                                <button className="icon-btn">
                                    <span className="material-symbols-outlined">add_circle</span>
                                </button>
                            </div>
                            {/* Community Card 1 */}
                            <div className="community-card">
                                <div className="cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQ3_SNJi9MVBcw1dUDt8UpLhYc1P9OnCpT1oyrIdGJ1jmD8lign-5v1UvIpTRygbLoiOpvsxJiUTkWHj91Q0bztMmo84mlRWYp2SHfFBIuIDh3REEf-T59c7ncUoYTRLPII_hy0MFjW-2IiFUkNOKv_893gOeSJv7l-meEnvBR-e_NP7Rx6HkXCCkQTSMHyK6QT-fVfUnqlEtbzyczR91e_YR_PCWMZfsFGtVsIQDTctN1ToVeGIqvGk3_wkE4omfGKJOVbxNQZhAr')" }}></div>
                                <div className="card-icon" style={{ background: 'var(--primary)' }}>
                                    <span className="material-symbols-outlined">science</span>
                                </div>
                                <div className="card-body">
                                    <h4>Physics 101</h4>
                                    <p className="members">128 Members • 5 Online</p>
                                    <div className="card-footer">
                                        <div className="avatar-stack">
                                            <img className="avatar avatar-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFgIDVq7-Cp7xewVFhDKb8rp7dNL39seoy2wtua9zI8zHGYonjhtSdgLHJ8oXWrUKoe_ZeBTYSZeFkzJukI7A9uvFk-lh4tscjDvTEpIAC39_uftElnvD37jAx_O-dfticIsyu8PQ9p2N6YiRJtm2gKsuYV1we28_30g5ThtfSlz3DqBjKisyBmfvLBgGLMqpsAi8z_MKCjIcKYjTCS5Mdu3qxzvWPguCb962aXnFi3sTA_eNLdUAZ_36tj2WzA8UO4KVnf0JwXaDH" alt="Member" />
                                        </div>
                                        <span className="action-text">Join Call</span>
                                    </div>
                                </div>
                            </div>
                            {/* Community Card 2 */}
                            <div className="community-card">
                                <div className="cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4qny9mgkNlfbxHyNGYnT3elppFd5-kLzLlhWTmpUDNJ3I_5Yib6i1juazQUqGi25052ChwWd8DrwXmexkntL2mdgTugmFUqNwzEy-itWzlHsnKAh85bOYXt1iN7BnbkSYBsj7a-GaWf40WQ4IGA6VFTIlsvwzcSOatYaVJWtbD03dJjgnp6P8kR2BbwBfsokMVdNZ5A_xZSRg6SQo8R08agheOk9WrWVyQ0gE_IJpfLpHdc136w_4RGLiykYslkbBqCm3pqah6OVT')" }}></div>
                                <div className="card-icon" style={{ background: 'var(--green)' }}>
                                    <span className="material-symbols-outlined">terminal</span>
                                </div>
                                <div className="card-body">
                                    <h4>Late Night Coders</h4>
                                    <p className="members">204 Members • 42 Online</p>
                                    <div className="card-footer">
                                        <div className="avatar-stack">
                                            <img className="avatar avatar-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwXDG_Sg5M9ku6EZXkI87YVP2V_aVAaW85dd2ZHqQeGPVtYRtIW5J2O4VaCKQPtnwmBwSwLLAkpOHIv7LBdl3RWhmJbLJJAcxzGo7fcnc4_bvvWAQwdXVvUdhHmBROcgq3bc9-WU0Okj6Fc0ms354Y5DbYb0ipC_2BumHscTMOU4-JaJyKt2MH3JtvMvH0ewLiQwgef8b1t3hhk4DF167wYGZlI8Gd7VyRArbGX2fugQVEX-rY6s_Cr9rNhTRiZQ63isJnc3txds1H" alt="Member" />
                                        </div>
                                        <span className="action-text">Active</span>
                                    </div>
                                </div>
                            </div>
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
