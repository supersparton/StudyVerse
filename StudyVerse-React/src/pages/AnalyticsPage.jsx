/* ============================================================
   STUDYVERSE — Analytics Page (AnalyticsPage.jsx)
   ============================================================
   Shows study statistics and visual charts:
   - Stats overview (study hours, tasks, longest streak)
   - Weekly hours bar chart (CSS-only, no library needed)
   - Top subjects list
   - Productivity score
   
   REACT CONCEPTS:
   - Inline styles for dynamic bar heights
   - .map() for rendering chart bars and subject list
   ============================================================ */

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

function AnalyticsPage() {
    const [activeFilter, setActiveFilter] = useState('This Week');
    const [analytics, setAnalytics] = useState({
        stats: {
            totalStudyHours: '0h 0m',
            tasksCompleted: 0,
            tasksTotal: 0,
            streakDays: 1,
            productivityScore: 0
        },
        weeklyData: []
    });

    const API = import.meta.env.VITE_API_URL;

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                let userStr = localStorage.getItem('studyverse-user');
                if(!userStr) return;
                let token = JSON.parse(userStr).token;
                
                let res = await fetch(API + '/api/analytics', { headers: { 'Authorization': 'Bearer ' + token }});
                let data = await res.json();
                if(data.success) {
                    setAnalytics(data);
                }
            } catch(e) {
                console.error("Failed to fetch analytics:", e);
            }
        }
        fetchAnalytics();
    }, []);

    const filters = ['Today', 'This Week', 'This Month', 'All Time'];

    return (
        <DashboardLayout>
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search analytics..." />
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline text-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span> Export
                    </button>
                    <button className="icon-btn">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="notif-dot"></span>
                    </button>
                </div>
            </header>

            <div className="content-scroll">
                <div className="content-grid">
                    {/* Page Header + Filters */}
                    <div className="analytics-header fade-in-up">
                        <div>
                            <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Analytics</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Track your study habits and progress.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {filters.map(function (f) {
                                return (
                                    <button
                                        key={f}
                                        className={'filter-btn' + (activeFilter === f ? ' active' : '')}
                                        onClick={function () { setActiveFilter(f); }}
                                    >
                                        {f}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="stats-grid fade-in-up fade-in-up-delay-1">
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--indigo-light)', color: 'var(--primary)' }}>
                                    <span className="material-symbols-outlined">schedule</span>
                                </div>
                            </div>
                            <h3>{analytics.stats.totalStudyHours}</h3>
                            <p>Total Focus Time</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                                    <span className="material-symbols-outlined">check_circle</span>
                                </div>
                            </div>
                            <h3>{analytics.stats.tasksCompleted} / {analytics.stats.tasksTotal}</h3>
                            <p>Tasks Completed</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>
                                    <span className="material-symbols-outlined">local_fire_department</span>
                                </div>
                            </div>
                            <h3>{analytics.stats.streakDays} Days</h3>
                            <p>Current Streak</p>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="analytics-grid fade-in-up fade-in-up-delay-2" style={{ gridTemplateColumns: '1fr' }}>
                        {/* Weekly Hours Bar Chart */}
                        <div className="chart-card">
                            <h3 style={{ marginBottom: '20px' }}>Recent Focus Time (Past 7 Days)</h3>
                            <div className="chart-placeholder" style={{ height: '200px', gap: '16px' }}>
                                {analytics.weeklyData && analytics.weeklyData.length > 0 ? (
                                    analytics.weeklyData.map(function (d) {
                                        return (
                                            <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                {/* Bar — height determines how tall it is */}
                                                <div style={{
                                                    width: '100%',
                                                    maxWidth: '40px',
                                                    height: d.height,
                                                    background: 'linear-gradient(to top, var(--primary), var(--primary-light))',
                                                    borderRadius: '6px 6px 0 0',
                                                    transition: 'height 0.3s ease',
                                                }}></div>
                                                {/* Day label */}
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.day}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>No study sessions logged this week. Head to the Pomodoro timer!</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Productivity Score */}
                    <div className="chart-card fade-in-up fade-in-up-delay-3" style={{ textAlign: 'center', marginTop: '24px' }}>
                        <h3>Productivity Score</h3>
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '50%',
                            border: '6px solid var(--border)', borderTopColor: 'var(--green)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '20px auto', fontSize: '2rem', fontWeight: '700', color: 'var(--green)'
                        }}>
                            {analytics.stats.productivityScore}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your completion rate based on tasks completed vs total.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AnalyticsPage;
