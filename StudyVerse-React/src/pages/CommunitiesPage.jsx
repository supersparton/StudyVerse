/* ============================================================
   STUDYVERSE — Communities Page (CommunitiesPage.jsx)
   ============================================================
   Shows study communities that students can explore and join.
   
   REACT CONCEPTS:
   - useState for filter and join button states
   - Conditional rendering for "Join" vs "Joined" button
   ============================================================ */

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

function CommunitiesPage() {
    const [activeFilter, setActiveFilter] = useState('All');

    // ─── Communities data ───
    // Each community has a name, description, members, and "joined" status
    const [communities, setCommunities] = useState([
        { id: 1, name: 'DSA Warriors', desc: 'Master Data Structures & Algorithms with daily challenges, discussions, and peer code reviews.', members: '2.1K', coverColor: '#6366f1', icon: 'code', joined: false },
        { id: 2, name: 'Late Night Coders', desc: 'For the night owls. Code, debug, and collaborate in late-night sessions.', members: '942', coverColor: '#10b981', icon: 'terminal', joined: true },
        { id: 3, name: 'AI & ML Hub', desc: 'Explore machine learning, deep learning, and AI projects. Share datasets and models.', members: '1.5K', coverColor: '#8b5cf6', icon: 'smart_toy', joined: false },
        { id: 4, name: 'Physics 101', desc: 'Mechanics, optics, thermodynamics — discuss concepts and solve problems together.', members: '654', coverColor: '#f59e0b', icon: 'science', joined: false },
        { id: 5, name: 'Web Dev Pro', desc: 'HTML, CSS, JavaScript, React, Node.js — build projects and share your portfolio.', members: '1.8K', coverColor: '#ec4899', icon: 'language', joined: true },
        { id: 6, name: 'Math Champions', desc: 'Calculus, Linear Algebra, Probability — tackle problem sets and share solutions.', members: '876', coverColor: '#06b6d4', icon: 'calculate', joined: false },
    ]);

    // Toggle join/leave for a community
    function toggleJoin(communityId) {
        setCommunities(communities.map(function (c) {
            if (c.id === communityId) {
                return { ...c, joined: !c.joined };
            }
            return c;
        }));
    }

    const filters = ['All', 'Trending', 'New', 'My Communities'];

    return (
        <DashboardLayout>
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search communities..." />
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">
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
                            Join communities to learn, collaborate, and grow together.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="task-filters fade-in-up fade-in-up-delay-1">
                        {filters.map(function (filter) {
                            return (
                                <button
                                    key={filter}
                                    className={'filter-btn' + (activeFilter === filter ? ' active' : '')}
                                    onClick={function () { setActiveFilter(filter); }}
                                >
                                    {filter}
                                </button>
                            );
                        })}
                    </div>

                    {/* Communities Grid */}
                    <div className="communities-grid fade-in-up fade-in-up-delay-2">
                        {communities.map(function (c) {
                            return (
                                <div className="community-explore-card" key={c.id}>
                                    {/* Cover bar with colored background */}
                                    <div className="card-cover" style={{ background: c.coverColor }}>
                                        <span className="member-count">{c.members} members</span>
                                        {/* Center icon on cover */}
                                        <span
                                            className="material-symbols-outlined"
                                            style={{
                                                position: 'absolute', top: '50%', left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                fontSize: '48px', color: 'rgba(255,255,255,0.3)'
                                            }}
                                        >
                                            {c.icon}
                                        </span>
                                    </div>
                                    <div className="card-content">
                                        <h4>{c.name}</h4>
                                        <p>{c.desc}</p>
                                        <button
                                            className={'btn ' + (c.joined ? 'btn-outline' : 'btn-primary')}
                                            style={{ width: '100%' }}
                                            onClick={function () { toggleJoin(c.id); }}
                                        >
                                            {c.joined ? 'Joined ✓' : 'Join Community'}
                                        </button>
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
