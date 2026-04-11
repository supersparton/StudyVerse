/* ============================================================
   STUDYVERSE — Communities Page (CommunitiesPage.jsx)
   ============================================================
   Connected to backend API for CRUD operations.

   CRUD OPERATIONS:
   - CREATE → POST /api/communities           (Create community)
   - READ   → GET  /api/communities           (List all communities)
   - UPDATE → POST /api/communities/:id/join   (Join a community)
   - DELETE → POST /api/communities/:id/leave  (Leave a community)

   REACT CONCEPTS:
   - useEffect to fetch communities on page load
   - Conditional rendering for Join/Leave button states
   ============================================================ */

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API = import.meta.env.VITE_API_URL;

function CommunitiesPage() {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    // Form state for creating a new community
    const [showForm, setShowForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');

    // ─── Get JWT token ───
    function getToken() {
        var user = localStorage.getItem('studyverse-user');
        if (user) return JSON.parse(user).token;
        return null;
    }

    // ─── READ: Fetch all communities on page load ───
    useEffect(function () { fetchCommunities(); }, []);

    async function fetchCommunities() {
        try {
            // GET /api/communities — public route, no token needed
            var response = await fetch(API + '/api/communities');
            var data = await response.json();
            if (data.success) setCommunities(data.communities);
        } catch (err) {
            console.error('Failed to fetch communities:', err);
        } finally {
            setLoading(false);
        }
    }

    /**
     * handleCreateCommunity — CREATE: POST /api/communities
     * Creates a new community in the database.
     */
    async function handleCreateCommunity() {
        if (!formName.trim()) {
            alert('Please enter a community name');
            return;
        }

        try {
            var response = await fetch(API + '/api/communities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({ name: formName, description: formDesc })
            });

            var data = await response.json();
            if (data.success) {
                fetchCommunities();
                setShowForm(false);
                setFormName('');
                setFormDesc('');
                alert('Community created! ✅');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Failed to create community:', err);
        }
    }

    /**
     * handleJoin — UPDATE: POST /api/communities/:id/join
     * Adds the logged-in user to a community.
     */
    async function handleJoin(communityId) {
        try {
            var response = await fetch(API + '/api/communities/' + communityId + '/join', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + getToken() }
            });
            var data = await response.json();
            if (data.success) {
                alert('Joined community! 🎉');
                fetchCommunities();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Failed to join:', err);
        }
    }

    /**
     * handleLeave — DELETE: POST /api/communities/:id/leave
     * Removes the logged-in user from a community.
     */
    async function handleLeave(communityId) {
        try {
            var response = await fetch(API + '/api/communities/' + communityId + '/leave', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + getToken() }
            });
            var data = await response.json();
            if (data.success) {
                alert('Left the community');
                fetchCommunities();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Failed to leave:', err);
        }
    }

    // Color palette for community cards
    var colors = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
    var icons = ['groups', 'code', 'smart_toy', 'science', 'language', 'calculate'];

    var filters = ['All', 'Trending', 'New'];

    return (
        <DashboardLayout>
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search communities..." />
                </div>
                <div className="header-actions">
                    {/* CREATE: Open new community form */}
                    <button className="btn btn-primary" onClick={function () { setShowForm(true); }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> Create Community
                    </button>
                    <button className="icon-btn">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="notif-dot"></span>
                    </button>
                </div>
            </header>

            <div className="content-scroll">
                <div className="content-grid">
                    <div className="fade-in-up">
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Communities</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {communities.length > 0
                                ? communities.length + ' communities from database'
                                : 'No communities yet. Create the first one!'}
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="task-filters fade-in-up fade-in-up-delay-1">
                        {filters.map(function (filter) {
                            return (
                                <button key={filter}
                                    className={'filter-btn' + (activeFilter === filter ? ' active' : '')}
                                    onClick={function () { setActiveFilter(filter); }}>
                                    {filter}
                                </button>
                            );
                        })}
                    </div>

                    {/* ─── CREATE Form ─── */}
                    {showForm && (
                        <div className="note-card fade-in-up" style={{ padding: '24px', marginBottom: '20px' }}>
                            <h3 style={{ marginBottom: '16px' }}>👥 Create New Community</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input className="form-input" type="text" placeholder="Community name..."
                                    value={formName} onChange={function (e) { setFormName(e.target.value); }} />
                                <textarea className="form-input" placeholder="Description..." rows="2"
                                    value={formDesc} onChange={function (e) { setFormDesc(e.target.value); }}></textarea>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-outline" onClick={function () { setShowForm(false); }}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleCreateCommunity}>Create</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                            Loading communities from database...
                        </p>
                    )}

                    {/* ─── READ: Communities Grid from database ─── */}
                    <div className="communities-grid fade-in-up fade-in-up-delay-2">
                        {communities.map(function (c, index) {
                            return (
                                <div className="community-explore-card" key={c.id}>
                                    <div className="card-cover" style={{ background: colors[index % colors.length] }}>
                                        <span className="material-symbols-outlined"
                                            style={{
                                                position: 'absolute', top: '50%', left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                fontSize: '48px', color: 'rgba(255,255,255,0.3)'
                                            }}>
                                            {icons[index % icons.length]}
                                        </span>
                                    </div>
                                    <div className="card-content">
                                        <h4>{c.name}</h4>
                                        <p>{c.description || 'No description'}</p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {/* JOIN / LEAVE buttons */}
                                            <button className="btn btn-primary" style={{ flex: 1 }}
                                                onClick={function () { handleJoin(c.id); }}>
                                                Join
                                            </button>
                                            <button className="btn btn-outline" style={{ flex: 1 }}
                                                onClick={function () { handleLeave(c.id); }}>
                                                Leave
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default CommunitiesPage;
