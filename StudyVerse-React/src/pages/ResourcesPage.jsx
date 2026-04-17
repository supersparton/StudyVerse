/* ============================================================
   STUDYVERSE — Resources Page (ResourcesPage.jsx)
   ============================================================
   A resource library organized as:
   All Semesters → Semester X → Subject → Files
   
   REACT CONCEPTS:
   - useState for navigation state (which view to show)
   - Conditional rendering (show semester grid, subject grid,
     or file list based on current "view" state)
   - Breadcrumb navigation to go back to parent levels
   
   This component demonstrates how React manages STATEFUL NAVIGATION
   within a single page — no URL changes needed, just state updates!
   ============================================================ */

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/resources.css';
import '../styles/modals.css';

function ResourcesPage() {
    // ─── NAVIGATION STATE ───
    const [view, setView] = useState('semesters'); // 'semesters', 'categories' or 'files'
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // ─── DATA STATE ───
    const [resources, setResources] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Upload form state
    const [formTitle, setFormTitle] = useState('');
    const [formCategory, setFormCategory] = useState('notes');
    const [formSemester, setFormSemester] = useState('1');
    const [formFile, setFormFile] = useState(null);

    const API = import.meta.env.VITE_API_URL;

    function getToken() {
        var user = localStorage.getItem('studyverse-user');
        return user ? JSON.parse(user).token : null;
    }

    // ─── FETCH DATA ───
    async function fetchResources() {
        try {
            let response = await fetch(API + '/api/resources');
            let data = await response.json();
            if (data.success) {
                setResources(data.resources);
                // Extract unique categories
                const cats = [...new Set(data.resources.map(r => r.category || 'general'))];
                // Add default categories if empty so UI isn't blank
                setCategories(cats.length > 0 ? cats : ['notes', 'exams', 'assignments', 'general']);
            }
        } catch (err) {
            console.error('Failed to fetch resources:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchResources();
    }, []);

    // ─── UPLOAD RESOURCE ───
    async function handleUpload() {
        if (!formTitle) return alert('Title is required');
        
        // --- Limit file size to 10MB client-side ---
        if (formFile && formFile.size > 10 * 1024 * 1024) {
            return alert('File size is too large! Please upload a file smaller than 10MB.');
        }

        try {
            let formData = new FormData();
            formData.append('title', formTitle);
            formData.append('category', formCategory);
            formData.append('semester', formSemester);
            if (formFile) formData.append('file', formFile);

            let res = await fetch(API + '/api/resources', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + getToken() },
                body: formData
            });
            let data = await res.json();
            if (data.success) {
                alert('Resource uploaded successfully!');
                setShowUploadModal(false);
                setFormTitle('');
                setFormFile(null);
                fetchResources();
            } else {
                alert(data.message);
            }
        } catch (e) {
            console.error(e);
        }
    }

    // ─── DELETE RESOURCE ───
    async function handleDelete(id) {
        if(!confirm('Are you sure you want to delete this resource?')) return;
        try {
            let res = await fetch(API + '/api/resources/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + getToken() }
            });
            let data = await res.json();
            if (data.success) {
                fetchResources();
            } else {
                alert(data.message);
            }
        } catch(e) {}
    }

    // ─── RESOURCE METRICS ───
    async function handleVote(id, direction) {
        try {
            const previousVote = resources.find(r => r.id === id)?._userVote || null;

            // Optimistic UI update: immediately change the state
            setResources(prev => prev.map(r => {
                if(r.id === id) {
                    let newUp = r.upvotes || 0;
                    let newDown = r.downvotes || 0;
                    let newVote = direction;

                    if (direction === previousVote) {
                        // Canceling vote
                        if (direction === 'up') newUp = Math.max(0, newUp - 1);
                        if (direction === 'down') newDown = Math.max(0, newDown - 1);
                        newVote = null;
                    } else {
                        // Swapping or New vote
                        if (direction === 'up') newUp += 1;
                        if (direction === 'down') newDown += 1;
                        if (previousVote === 'up') newUp = Math.max(0, newUp - 1);
                        if (previousVote === 'down') newDown = Math.max(0, newDown - 1);
                    }

                    return { ...r, upvotes: newUp, downvotes: newDown, _userVote: newVote };
                }
                return r;
            }));

            // Sync with backend
            await fetch(API + `/api/resources/${id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
                body: JSON.stringify({ direction, previous: previousVote })
            });
        } catch(e) { }
    }

    function logView(id) {
        fetch(API + `/api/resources/${id}/view`, { method: 'POST' }).catch(console.error);
        
        // Optimistically increment view
        setResources(prev => prev.map(r => {
            if (r.id === id) return { ...r, view_count: (r.view_count || 0) + 1 };
            return r;
        }));
    }

    // ─── NAVIGATION FUNCTIONS ───
    function goToCategories(sem) {
        setSelectedSemester(sem);
        setView('categories');
    }

    function goToFiles(category) {
        setSelectedCategory(category);
        setView('files');
    }

    function goBack() {
        if (view === 'files') {
            setView('categories');
            setSelectedCategory(null);
        } else if (view === 'categories') {
            setView('semesters');
            setSelectedSemester(null);
        }
    }

    // Filter resources based on selections
    var currentFiles = resources.filter(r => 
        (r.semester || '1') === selectedSemester && 
        (r.category || 'general') === selectedCategory
    );
    
    // Unique Semesters
    const semesters = [...new Set(resources.map(r => r.semester || '1'))].sort();
    var colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

    return (
        <DashboardLayout>
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input 
                        type="text" 
                        placeholder="Search resources..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={function () { setShowUploadModal(true); }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span> Upload
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
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Resources</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Share and access study materials organized by semester and subject.
                        </p>
                    </div>

                    {/* ─── Breadcrumb Navigation ─── */}
                    <div className="res-breadcrumb fade-in-up">
                        <a onClick={() => { setView('semesters'); setSelectedSemester(null); setSelectedCategory(null); setSearchQuery(''); }}>All Semesters</a>
                        {selectedSemester && (
                            <>
                                <span className="sep">›</span>
                                <a onClick={() => { setView('categories'); setSelectedCategory(null); }}>Semester {selectedSemester}</a>
                            </>
                        )}
                        {selectedCategory && (
                            <>
                                <span className="sep">›</span>
                                <span className="current" style={{ textTransform: 'capitalize' }}>{selectedCategory}</span>
                            </>
                        )}
                    </div>

                    {/* ─── GLOBAL SEARCH VIEW (Bypasses folders when searching) ─── */}
                    {searchQuery.trim() !== '' ? (
                        <div className="file-list fade-in-up">
                            <h3 style={{ marginBottom: '16px' }}>Search Results for "{searchQuery}"</h3>
                            {resources.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No resources found matching your search. Try a different term or semester.</p>
                            ) : (
                                resources.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase())).map(function (file) {
                                    return (
                                        <div className="file-card" key={file.id}>
                                            <div className="file-icon" style={{ background: '#ede9fe', color: '#8b5cf6' }}>
                                                <span className="material-symbols-outlined">
                                                    {(file.url && file.url.startsWith('https://')) ? 'file_download' : 'description'}
                                                </span>
                                            </div>
                                            <div className="file-info" style={{ flex: 1 }}>
                                                <h4 style={{ marginBottom: '4px' }}>{file.title}</h4>
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '11px' }}>
                                                    <span className="badge badge-indigo">Sem {file.semester}</span>
                                                    <span className="badge badge-orange">{file.category}</span>
                                                </div>
                                                <div className="file-meta" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                    {/* Views display */}
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                                                        {file.view_count || 0}
                                                    </span>
                                                    
                                                    {file.url && (
                                                        <span>
                                                            <a href={file.url} target="_blank" rel="noreferrer" onClick={() => logView(file.id)} style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                                                View File
                                                            </a>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="vote-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '20px' }}>
                                                    <button 
                                                        className="vote-btn" 
                                                        onClick={() => handleVote(file.id, 'up')}
                                                        style={{ display: 'flex', gap: '4px', alignItems: 'center', color: file._userVote === 'up' ? 'var(--green)' : 'var(--text-muted)' }}
                                                        title="Upvote"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>thumb_up</span>
                                                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{file.upvotes || 0}</span>
                                                    </button>
                                                    <button 
                                                        className="vote-btn" 
                                                        onClick={() => handleVote(file.id, 'down')}
                                                        style={{ display: 'flex', gap: '4px', alignItems: 'center', color: file._userVote === 'down' ? 'var(--orange)' : 'var(--text-muted)' }}
                                                        title="Downvote"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>thumb_down</span>
                                                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{file.downvotes || 0}</span>
                                                    </button>
                                                </div>
                                                <button className="vote-btn" onClick={() => handleDelete(file.id)} title="Delete (if yours)" style={{ padding: '6px' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ef4444' }}>delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <>
                            {/* ─── NORMAL FOLDER VIEWS ─── */}
                            {view === 'semesters' && (
                                <div className="res-grid fade-in-up fade-in-up-delay-1">
                                    {['1', '2', '3', '4', '5', '6', '7', '8'].map(function (sem, i) {
                                        let count = resources.filter(r => (r.semester || '1') === sem).length;
                                        return (
                                            <div className="res-folder" key={sem} onClick={function () { goToCategories(sem); }}>
                                                <div className="res-folder-icon" style={{ background: colors[i % colors.length] }}>
                                                    <span className="material-symbols-outlined">school</span>
                                                </div>
                                                <h4>Semester {sem}</h4>
                                                <p>{count} resources</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {view === 'categories' && (
                                <div className="res-grid fade-in-up fade-in-up-delay-1">
                                    {categories.map(function (cat, i) {
                                        let count = resources.filter(r => (r.semester || '1') === selectedSemester && (r.category || 'general') === cat).length;
                                        return (
                                            <div className="res-folder" key={cat} onClick={function () { goToFiles(cat); }}>
                                                <div className="res-folder-icon" style={{ background: colors[i % colors.length] }}>
                                                    <span className="material-symbols-outlined">folder</span>
                                                </div>
                                                <h4 style={{ textTransform: 'capitalize' }}>{cat}</h4>
                                                <p>{count} resources</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {view === 'files' && (
                                <div className="file-list fade-in-up fade-in-up-delay-1">
                                    {currentFiles.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)' }}>No resources uploaded here yet.</p>
                                    ) : currentFiles.map(function (file) {
                                        return (
                                            <div className="file-card" key={file.id}>
                                                <div className="file-icon" style={{ background: '#ede9fe', color: '#8b5cf6' }}>
                                                    <span className="material-symbols-outlined">
                                                        {file.url && file.url.startsWith('https://') ? 'file_download' : 'description'}
                                                    </span>
                                                </div>
                                                <div className="file-info" style={{ flex: 1 }}>
                                                    <h4 style={{ marginBottom: '4px' }}>{file.title}</h4>
                                                    
                                                    {file.users && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                                {file.users.avatar_url && file.users.avatar_url.startsWith('http') ? (
                                                                    <img src={file.users.avatar_url} alt="author" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <span style={{ fontSize: '12px' }}>{file.users.avatar_url || '👨‍🎓'}</span>
                                                                )}
                                                            </div>
                                                            <span>{file.users.full_name}</span>
                                                        </div>
                                                    )}

                                                    <div className="file-meta" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                                                            {file.view_count || 0}
                                                        </span>
                                                        
                                                        {file.url && (
                                                            <span>
                                                                <a href={file.url} target="_blank" rel="noreferrer" onClick={() => logView(file.id)} style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                                                    View File
                                                                </a>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="vote-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '20px' }}>
                                                        <button 
                                                            className="vote-btn" 
                                                            onClick={() => handleVote(file.id, 'up')}
                                                            style={{ display: 'flex', gap: '4px', alignItems: 'center', color: file._userVote === 'up' ? 'var(--green)' : 'var(--text-muted)' }}
                                                            title="Upvote"
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>thumb_up</span>
                                                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{file.upvotes || 0}</span>
                                                        </button>
                                                        <button 
                                                            className="vote-btn" 
                                                            onClick={() => handleVote(file.id, 'down')}
                                                            style={{ display: 'flex', gap: '4px', alignItems: 'center', color: file._userVote === 'down' ? 'var(--orange)' : 'var(--text-muted)' }}
                                                            title="Downvote"
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>thumb_down</span>
                                                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{file.downvotes || 0}</span>
                                                        </button>
                                                    </div>
                                                    <button className="vote-btn" onClick={() => handleDelete(file.id)} title="Delete (if yours)" style={{ padding: '6px' }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ef4444' }}>delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ─── Upload Modal ─── */}
            <div className={'modal-overlay' + (showUploadModal ? ' active' : '')} onClick={function () { setShowUploadModal(false); }}>
                <div className="modal-box" onClick={function (e) { e.stopPropagation(); }}>
                    <button className="modal-close" onClick={function () { setShowUploadModal(false); }}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h2>Upload Resource</h2>
                    <p className="modal-sub">Share a resource with the community.</p>
                    <div className="modal-field">
                        <label>Title</label>
                        <input type="text" placeholder="e.g., Chapter 3 Notes" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                    </div>
                    <div className="modal-field">
                        <label>Semester</label>
                        <select value={formSemester} onChange={(e) => setFormSemester(e.target.value)}>
                            {['1', '2', '3', '4', '5', '6', '7', '8'].map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-field">
                        <label>Category</label>
                        <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                            <option value="notes">Notes</option>
                            <option value="exams">Exams</option>
                            <option value="assignments">Assignments</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                    <div className="modal-field">
                        <label>Upload File</label>
                        <input type="file" onChange={(e) => setFormFile(e.target.files[0])} />
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={function () { setShowUploadModal(false); }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleUpload}>Upload</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ResourcesPage;
