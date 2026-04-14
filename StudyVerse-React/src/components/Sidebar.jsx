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

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Props explained:
// - isOpen: boolean → true = sidebar visible, false = hidden
// - onToggle: function → called when user clicks close/open button
function Sidebar({ isOpen, onToggle }) {
    const location = useLocation();

    // ─── STATE: Profile Data & Favorite Notes ───
    const [userProfile, setUserProfile] = useState({
        fullName: 'Student',
        avatar: '👨‍🎓'
    });
    const [favoriteNotes, setFavoriteNotes] = useState([]);

    // ─── Fetch profile and notes data ───
    useEffect(() => {
        async function fetchData() {
            try {
                let userStr = localStorage.getItem('studyverse-user');
                if (!userStr) return;
                let token = JSON.parse(userStr).token;
                
                // Fetch Profile
                fetch(import.meta.env.VITE_API_URL + '/api/profile', {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(res => res.json()).then(data => {
                    if (data.success && data.user) {
                        setUserProfile({
                            fullName: data.user.full_name || 'Student',
                            avatar: data.user.avatar_url || '👨‍🎓'
                        });
                    } else {
                        let local = localStorage.getItem('studyverse-profile');
                        if (local) {
                            let parsed = JSON.parse(local);
                            setUserProfile(prev => ({...prev, fullName: parsed.fullName || prev.fullName, avatar: parsed.avatar || prev.avatar}));
                        }
                    }
                }).catch(err => {
                    let local = localStorage.getItem('studyverse-profile');
                    if (local) {
                        let parsed = JSON.parse(local);
                        setUserProfile(prev => ({...prev, fullName: parsed.fullName || prev.fullName, avatar: parsed.avatar || prev.avatar}));
                    }
                });

                // Fetch Favorite Notes
                fetch(import.meta.env.VITE_API_URL + '/api/notes', {
                    headers: { 'Authorization': 'Bearer ' + token }
                }).then(res => res.json()).then(data => {
                    if (data.success && data.notes) {
                        setFavoriteNotes(data.notes.filter(n => n.is_favorite));
                    }
                }).catch(err => console.error("Failed to fetch favorite notes"));

            } catch (err) {
                console.error("Error fetching sidebar data", err);
            }
        }
        fetchData();
    }, [location.pathname]); // Refetch on route changes if profile updated

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
                    {favoriteNotes.length > 0 ? (
                        favoriteNotes.map((note, idx) => (
                            <li key={note.id}>
                                <Link to="/notes" className="sidebar-fav-item">
                                    <span className="dot" style={{ background: ['#ec4899', '#06b6d4', '#f59e0b', '#10b981'][idx % 4] }}></span>
                                    {note.title.length > 20 ? note.title.substring(0, 17) + '...' : note.title}
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li>
                            <Link to="/notes" className="sidebar-fav-item" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>star</span>
                                No favorite notes
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>

            {/* ─── User Info (Bottom of Sidebar) ─── */}
            <div className="sidebar-user" style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '12px', textDecoration: 'none' }}>
                    <div className="user-avatar" style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%' }}>
                        {userProfile.avatar.startsWith('http') ? (
                            <img src={userProfile.avatar} alt={userProfile.fullName} />
                        ) : (
                            userProfile.avatar
                        )}
                        <span className="status-dot"></span>
                    </div>
                    <div className="user-info">
                        <span className="name">{userProfile.fullName}</span>
                        <span className="plan">Pro Plan</span>
                    </div>
                </Link>
                <button 
                    onClick={function() {
                        if(window.confirm('Are you sure you want to log out?')) {
                            localStorage.removeItem('studyverse-user');
                            localStorage.removeItem('studyverse-profile');
                            window.location.href = '/login';
                        }
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', display: 'flex' }}
                    title="Log out"
                >
                    <span className="material-symbols-outlined">logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
