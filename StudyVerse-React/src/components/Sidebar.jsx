/* ============================================================
   STUDYVERSE — Sidebar Component (Sidebar.jsx)
   ============================================================
   The sidebar navigation panel on the LEFT side of dashboard pages.
   
   CHANGES:
   - WHITE THEME instead of dark (light background, dark text)
   - COLLAPSIBLE: receives "isOpen" and "onToggle" props from parent
   - Close button (X) inside the sidebar to collapse it
   
   REACT CONCEPTS:
   - Props: isOpen (boolean) and onToggle (function) from parent
   - Conditional rendering: show/hide based on isOpen
   - useLocation: highlights the current active page
   ============================================================ */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Props explained:
// - isOpen: boolean → true = sidebar visible, false = hidden
// - onToggle: function → called when user clicks close/open button
function Sidebar({ isOpen, onToggle }) {
    const location = useLocation();

    // Navigation items — stored as array for easy .map() rendering
    const navItems = [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/notes', icon: 'description', label: 'My Notes' },
        { path: '/tasks', icon: 'check_circle', label: 'Tasks', badge: '4' },
        { path: '/pomodoro', icon: 'timer', label: 'Pomodoro' },
        { path: '/communities', icon: 'groups', label: 'Communities' },
        { path: '/analytics', icon: 'bar_chart', label: 'Analytics' },
        { path: '/resources', icon: 'folder', label: 'Resources' },
        { path: '/profile', icon: 'person', label: 'My Profile' },
    ];

    return (
        <aside className={'sidebar' + (isOpen ? '' : ' sidebar-hidden')}>

            {/* ─── Header: Logo + Close Button ─── */}
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="logo-icon">
                        <span className="material-symbols-outlined">school</span>
                    </div>
                    <div className="brand-info">
                        <h1>StudyVerse</h1>
                        <p>Student Platform</p>
                    </div>
                </div>
                {/* Close button — calls onToggle to hide sidebar */}
                <button className="sidebar-close-btn" onClick={onToggle} title="Close sidebar">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* ─── Navigation Links ─── */}
            <nav className="sidebar-nav">
                <ul>
                    {navItems.map(function (item) {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={'nav-item' + (isActive ? ' active' : '')}
                                >
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                    {item.label}
                                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* ─── Favorites Section ─── */}
                <div className="sidebar-section-title">Favorites</div>
                <ul>
                    <li>
                        <a href="#" className="sidebar-fav-item">
                            <span className="dot" style={{ background: '#ec4899' }}></span>
                            Calculus 101
                        </a>
                    </li>
                    <li>
                        <a href="#" className="sidebar-fav-item">
                            <span className="dot" style={{ background: '#06b6d4' }}></span>
                            Art History
                        </a>
                    </li>
                </ul>
            </nav>

            {/* ─── User Info (Bottom of Sidebar) ─── */}
            <div className="sidebar-user">
                <Link to="/profile">
                    <div className="user-avatar">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB64GHbvy-PzYwINkrXjcZMERp_jy83KwV5j6NTQJkoP7oqCMgprEMUJrrWC7xmsZURFi0A2P9JG1Y8Z_QqwfIcd12HZo9IXLjP3nRUVk89Dj1NaXOxR_g7jYuyOqcwzXBbCHnTW2WKaQW3bA2rTbut0ZjGe7TGyW1y79-ErKFSejyqpwIa41mif4cXA45DEBZEMjGnlLwMHXVBttS1RUUxGn9exdAa7Kw1l9kqE4S4R3pWOMfWJy1vOJl89lS-h3G1VE6L5qX7H4fW"
                            alt="Alex Student"
                        />
                        <span className="status-dot"></span>
                    </div>
                    <div className="user-info">
                        <span className="name">Alex Student</span>
                        <span className="plan">Pro Plan</span>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>
                        expand_more
                    </span>
                </Link>
            </div>
        </aside>
    );
}

export default Sidebar;
