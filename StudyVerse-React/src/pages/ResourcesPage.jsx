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

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/resources.css';
import '../styles/modals.css';

function ResourcesPage() {
    // ─── NAVIGATION STATE ───
    // "view" tracks where we are: 'semesters', 'subjects', or 'files'
    const [view, setView] = useState('semesters');
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // ─── DATA ───
    const semesters = [
        { id: 1, name: 'Semester 1', subjects: 6, color: '#6366f1' },
        { id: 2, name: 'Semester 2', subjects: 6, color: '#8b5cf6' },
        { id: 3, name: 'Semester 3', subjects: 5, color: '#ec4899' },
        { id: 4, name: 'Semester 4', subjects: 5, color: '#f59e0b' },
        { id: 5, name: 'Semester 5', subjects: 4, color: '#10b981' },
        { id: 6, name: 'Semester 6', subjects: 4, color: '#06b6d4' },
    ];

    const subjectsData = {
        1: [
            { name: 'Mathematics I', files: 12, color: '#6366f1' },
            { name: 'Physics', files: 8, color: '#f59e0b' },
            { name: 'Chemistry', files: 6, color: '#10b981' },
            { name: 'English', files: 4, color: '#ec4899' },
            { name: 'Computer Fundamentals', files: 10, color: '#8b5cf6' },
            { name: 'Engineering Drawing', files: 3, color: '#06b6d4' },
        ],
    };

    const filesData = [
        { name: 'Chapter 1 Notes.pdf', type: 'PDF', size: '2.4 MB', uploader: 'Alex S.', votes: 12, iconColor: '#ef4444', iconBg: '#fee2e2' },
        { name: 'Lecture Recording — Limits', type: 'Video', size: '45 MB', uploader: 'Priya K.', votes: 8, iconColor: '#8b5cf6', iconBg: '#ede9fe' },
        { name: 'Formula Sheet', type: 'PDF', size: '540 KB', uploader: 'Rohan M.', votes: 24, iconColor: '#ef4444', iconBg: '#fee2e2' },
        { name: 'Practice Problems Set 1', type: 'PDF', size: '1.1 MB', uploader: 'Sneha R.', votes: 6, iconColor: '#ef4444', iconBg: '#fee2e2' },
    ];

    // ─── NAVIGATION FUNCTIONS ───
    function goToSubjects(semester) {
        setSelectedSemester(semester);
        setView('subjects');
    }

    function goToFiles(subject) {
        setSelectedSubject(subject);
        setView('files');
    }

    function goBack(level) {
        if (level === 'semesters') {
            setView('semesters');
            setSelectedSemester(null);
            setSelectedSubject(null);
        } else if (level === 'subjects') {
            setView('subjects');
            setSelectedSubject(null);
        }
    }

    // Get subjects for selected semester (default to sem 1 data)
    var currentSubjects = subjectsData[selectedSemester?.id] || subjectsData[1];

    return (
        <DashboardLayout>
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search resources..." />
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
                        <a onClick={function () { goBack('semesters'); }}>All Semesters</a>
                        {selectedSemester && (
                            <>
                                <span className="sep">›</span>
                                {view === 'subjects' ? (
                                    <span className="current">{selectedSemester.name}</span>
                                ) : (
                                    <a onClick={function () { goBack('subjects'); }}>{selectedSemester.name}</a>
                                )}
                            </>
                        )}
                        {selectedSubject && (
                            <>
                                <span className="sep">›</span>
                                <span className="current">{selectedSubject.name}</span>
                            </>
                        )}
                    </div>

                    {/* ─── SEMESTER VIEW ─── */}
                    {view === 'semesters' && (
                        <div className="res-grid fade-in-up fade-in-up-delay-1">
                            {semesters.map(function (sem) {
                                return (
                                    <div className="res-folder" key={sem.id} onClick={function () { goToSubjects(sem); }}>
                                        <div className="res-folder-icon" style={{ background: sem.color }}>
                                            <span className="material-symbols-outlined">folder</span>
                                        </div>
                                        <h4>{sem.name}</h4>
                                        <p>{sem.subjects} subjects</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ─── SUBJECT VIEW ─── */}
                    {view === 'subjects' && (
                        <div className="res-grid fade-in-up fade-in-up-delay-1">
                            {currentSubjects.map(function (sub, i) {
                                return (
                                    <div className="res-folder" key={i} onClick={function () { goToFiles(sub); }}>
                                        <div className="res-folder-icon" style={{ background: sub.color }}>
                                            <span className="material-symbols-outlined">menu_book</span>
                                        </div>
                                        <h4>{sub.name}</h4>
                                        <p>{sub.files} files</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ─── FILES VIEW ─── */}
                    {view === 'files' && (
                        <div className="file-list fade-in-up fade-in-up-delay-1">
                            {filesData.map(function (file, i) {
                                return (
                                    <div className="file-card" key={i}>
                                        <div className="file-icon" style={{ background: file.iconBg, color: file.iconColor }}>
                                            <span className="material-symbols-outlined">
                                                {file.type === 'Video' ? 'videocam' : 'picture_as_pdf'}
                                            </span>
                                        </div>
                                        <div className="file-info">
                                            <h4>{file.name}</h4>
                                            <div className="file-meta">
                                                <span>{file.type}</span>
                                                <span>{file.size}</span>
                                                <span>by {file.uploader}</span>
                                            </div>
                                        </div>
                                        <div className="vote-actions">
                                            <button className="vote-btn">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>thumb_up</span>
                                            </button>
                                            <span className="vote-count">{file.votes}</span>
                                            <button className="vote-btn">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>thumb_down</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                        <input type="text" placeholder="e.g., Chapter 3 Notes" />
                    </div>
                    <div className="modal-field">
                        <label>Semester</label>
                        <select><option>Semester 1</option><option>Semester 2</option><option>Semester 3</option></select>
                    </div>
                    <div className="modal-field">
                        <label>Subject</label>
                        <select><option>Mathematics I</option><option>Physics</option><option>Chemistry</option></select>
                    </div>
                    <div className="modal-field">
                        <div className="file-drop-zone">
                            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>cloud_upload</span>
                            <p>Click to upload or drag &amp; drop</p>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={function () { setShowUploadModal(false); }}>Cancel</button>
                        <button className="btn btn-primary" onClick={function () { setShowUploadModal(false); alert('Resource uploaded! ✅'); }}>Upload</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ResourcesPage;
