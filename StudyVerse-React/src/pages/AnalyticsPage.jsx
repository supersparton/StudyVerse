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

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

function AnalyticsPage() {
    const [activeFilter, setActiveFilter] = useState('This Week');

    // ─── Weekly study hours data ───
    const weeklyData = [
        { day: 'Mon', hours: 3.0, height: '60%' },
        { day: 'Tue', hours: 4.5, height: '90%' },
        { day: 'Wed', hours: 2.5, height: '50%' },
        { day: 'Thu', hours: 5.0, height: '100%' },
        { day: 'Fri', hours: 3.5, height: '70%' },
        { day: 'Sat', hours: 1.5, height: '30%' },
        { day: 'Sun', hours: 2.0, height: '40%' },
    ];

    // ─── Top subjects data ───
    const topSubjects = [
        { name: 'Mathematics', hours: '8.5h', percentage: '85%', color: 'var(--primary)' },
        { name: 'Computer Science', hours: '6.2h', percentage: '62%', color: 'var(--purple)' },
        { name: 'Physics', hours: '4.0h', percentage: '40%', color: 'var(--cyan)' },
        { name: 'History', hours: '3.3h', percentage: '33%', color: 'var(--orange)' },
    ];

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
                                <span className="stat-trend">
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
                                    +12%
                                </span>
                            </div>
                            <h3>22h 30m</h3>
                            <p>Total Study Hours</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                                    <span className="material-symbols-outlined">check_circle</span>
                                </div>
                            </div>
                            <h3>18 / 24</h3>
                            <p>Tasks Completed</p>
                        </div>
                        <div className="stat-card">
                            <div className="stat-header">
                                <div className="stat-icon" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>
                                    <span className="material-symbols-outlined">local_fire_department</span>
                                </div>
                            </div>
                            <h3>12 Days</h3>
                            <p>Longest Streak</p>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="analytics-grid fade-in-up fade-in-up-delay-2">
                        {/* Weekly Hours Bar Chart */}
                        <div className="chart-card">
                            <h3 style={{ marginBottom: '20px' }}>Weekly Study Hours</h3>
                            <div className="chart-placeholder" style={{ height: '200px', gap: '16px' }}>
                                {weeklyData.map(function (d) {
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
                                })}
                            </div>
                        </div>

                        {/* Top Subjects */}
                        <div className="chart-card">
                            <h3 style={{ marginBottom: '20px' }}>Top Subjects</h3>
                            {topSubjects.map(function (s) {
                                return (
                                    <div key={s.name} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{s.name}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.hours}</span>
                                        </div>
                                        {/* Progress bar for each subject */}
                                        <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: s.percentage, background: s.color, borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
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
                            85
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Great job! You're 15% more productive than last week.</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AnalyticsPage;
