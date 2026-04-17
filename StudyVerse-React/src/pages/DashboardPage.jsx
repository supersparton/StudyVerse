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
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

function DashboardPage() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Student');
    const [tasks, setTasks] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [notes, setNotes] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalStudyHours: '0h 0m',
        tasksPending: 0,
        productivityScore: 0,
        resourcesShared: 0,
        streakDays: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);

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
                    setTasks(taskData.tasks);
                }

                // Fetch Communities (Joined only)
                let commRes = await fetch(API + '/api/communities/joined', { 
                    headers: { 'Authorization': 'Bearer ' + token } 
                });
                let commData = await commRes.json();
                if (commData.success) {
                    setCommunities(commData.communities);
                }

                // Fetch Notes
                let notesRes = await fetch(API + '/api/notes', { headers: { 'Authorization': 'Bearer ' + token } });
                let notesData = await notesRes.json();
                if (notesData.success) {
                    setNotes(notesData.notes);
                }

                // Fetch Analytics
                let analyticsRes = await fetch(API + '/api/analytics', { headers: { 'Authorization': 'Bearer ' + token } });
                let analyticsData = await analyticsRes.json();
                
                // Fetch Resources using general resources route
                let resRes = await fetch(API + '/api/resources');
                let resData = await resRes.json();

                if (analyticsData.success) {
                    setAnalytics({
                        totalStudyHours: analyticsData.stats.last24hFocusTime || '0m',
                        tasksPending: analyticsData.stats.tasksPending,
                        productivityScore: analyticsData.stats.productivityScore,
                        streakDays: analyticsData.stats.streakDays,
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
                <div className="search-wrapper">
                    <div className="search-bar">
                        <span className="material-symbols-outlined">search</span>
                        <input 
                            type="text" 
                            placeholder="Explore your workspace..." 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSearchResults(e.target.value.trim() !== '');
                            }}
                            onFocus={() => setShowSearchResults(searchQuery.trim() !== '')}
                        />
                    </div>

                    {/* ─── Global Search Results Popup ─── */}
                    {showSearchResults && (
                        <div className="search-results-dropdown">
                            {tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                             notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                             communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                <div className="search-no-results">
                                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--text-muted)' }}>search_off</span>
                                    <p>No match found for "{searchQuery}"</p>
                                </div>
                            ) : (
                                <>
                                    {/* Tasks */}
                                    {tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).map(task => (
                                        <div key={task.id} className="search-result-item" onClick={() => navigate('/tasks')}>
                                            <div className="search-result-icon" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>
                                                <span className="material-symbols-outlined">checklist</span>
                                            </div>
                                            <div className="search-result-info">
                                                <span className="search-result-title">{task.title}</span>
                                                <span className="search-result-subtitle">Task • {task.priority || 'med'} priority</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Notes */}
                                    {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).map(note => (
                                        <div key={note.id} className="search-result-item" onClick={() => navigate('/notes')}>
                                            <div className="search-result-icon" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
                                                <span className="material-symbols-outlined">description</span>
                                            </div>
                                            <div className="search-result-info">
                                                <span className="search-result-title">{note.title}</span>
                                                <span className="search-result-subtitle">Note • {note.subject || 'Personal'}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Communities */}
                                    {communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).map(comm => (
                                        <div key={comm.id} className="search-result-item" onClick={() => navigate('/communities')}>
                                            <div className="search-result-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                                                <span className="material-symbols-outlined">groups</span>
                                            </div>
                                            <div className="search-result-info">
                                                <span className="search-result-title">{comm.name}</span>
                                                <span className="search-result-subtitle">Community • Joined</span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
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
                            <p>Focus Time (Last 24h)</p>
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
                                {tasks.length > 0 ? 
                                 tasks.map(function (task) {
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
                            
                            {communities.length > 0 ? 
                             communities.slice(0, 3).map((c, i) => (
                                <div className="community-card" key={c.id}>
                                    <div className="cover" style={{ 
                                        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'][i % 4],
                                        backgroundImage: c.image_url ? `url(${c.image_url})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}></div>
                                    <div className="card-icon" style={{ background: 'var(--primary)' }}>
                                        <span className="material-symbols-outlined">groups</span>
                                    </div>
                                    <div className="card-body">
                                        <h4>{c.name}</h4>
                                        <p className="members">{c.description ? c.description.substring(0, 30) + '...' : 'Members Online'}</p>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>No communities yet.</p>
                                    <Link to="/communities" className="btn btn-outline btn-sm">Join a community today!</Link>
                                </div>
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
