/* ============================================================
   STUDYVERSE — Notes Page Component (NotesPage.jsx)
   ============================================================
   Shows all study notes in a grid with filter tabs and
   bookmark toggle functionality.
   
   REACT CONCEPTS:
   - useState for active filter and bookmark states
   - Conditional rendering (show/hide based on filter)
   - Array .map() to render a list of note cards
   ============================================================ */

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

function NotesPage() {
    // ─── STATE ───
    const [activeFilter, setActiveFilter] = useState('All');

    // Notes data — each note has a subject, title, content, etc.
    const [notes, setNotes] = useState([
        { id: 1, subject: 'Mathematics', title: 'Calculus — Limits & Derivatives', content: 'Summary of key theorems and formulas for limits, continuity, and basic derivatives.', updated: '2h ago', bookmarked: false, tagBg: 'var(--indigo-light)', tagColor: 'var(--primary)' },
        { id: 2, subject: 'History', title: 'Renaissance Art Movements', content: 'Notes on Italian Renaissance, key artists (Da Vinci, Michelangelo, Raphael).', updated: 'yesterday', bookmarked: true, tagBg: 'var(--purple-light)', tagColor: 'var(--purple)' },
        { id: 3, subject: 'Chemistry', title: 'Organic Chemistry Basics', content: 'Functional groups, naming conventions, and basic reaction mechanisms.', updated: '3 days ago', bookmarked: false, tagBg: 'var(--cyan-light)', tagColor: 'var(--cyan)' },
        { id: 4, subject: 'Design', title: 'UI/UX Design Principles', content: 'Core principles — hierarchy, contrast, alignment, proximity. Gestalt principles.', updated: '5 days ago', bookmarked: false, tagBg: 'var(--pink-light)', tagColor: 'var(--pink)' },
        { id: 5, subject: 'Physics', title: 'Wave Optics — Interference', content: 'Double-slit experiment, thin film interference, and diffraction patterns.', updated: '1 week ago', bookmarked: true, tagBg: 'var(--green-light)', tagColor: 'var(--green)' },
        { id: 6, subject: 'Biology', title: 'Cell Biology Review', content: 'Cell organelles, mitosis vs meiosis, and membrane transport mechanisms.', updated: '2 weeks ago', bookmarked: false, tagBg: 'var(--orange-light)', tagColor: 'var(--orange)' },
    ]);

    // Toggle bookmark for a specific note
    function toggleBookmark(noteId) {
        setNotes(notes.map(function (note) {
            if (note.id === noteId) {
                return { ...note, bookmarked: !note.bookmarked };
                // ...note = copy all existing properties
                // bookmarked: !note.bookmarked = flip the bookmark state
            }
            return note; // Leave other notes unchanged
        }));
    }

    // Filter notes based on active filter
    const filteredNotes = notes.filter(function (note) {
        if (activeFilter === 'Favorited') return note.bookmarked;
        return true; // "All" and "Recent" show everything
    });

    const filters = ['All', 'Recent', 'Favorited'];

    return (
        <DashboardLayout>
            {/* Top Header */}
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search notes..." />
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> New Note
                    </button>
                    <button className="icon-btn">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="notif-dot"></span>
                    </button>
                </div>
            </header>

            <div className="content-scroll">
                <div className="content-grid">
                    {/* Header with filters */}
                    <div className="notes-header fade-in-up">
                        <div>
                            <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>My Notes</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>All your study notes organized in one place.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                    </div>

                    {/* Notes Grid */}
                    <div className="notes-grid">
                        {filteredNotes.map(function (note) {
                            return (
                                <div className="note-card fade-in-up" key={note.id}>
                                    <span className="note-tag" style={{ background: note.tagBg, color: note.tagColor }}>
                                        {note.subject}
                                    </span>
                                    <h4>{note.title}</h4>
                                    <p>{note.content}</p>
                                    <div className="note-footer">
                                        <span>Updated {note.updated}</span>
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ fontSize: '18px', cursor: 'pointer', color: note.bookmarked ? 'var(--orange)' : 'inherit' }}
                                            onClick={function () { toggleBookmark(note.id); }}
                                        >
                                            {note.bookmarked ? 'bookmark' : 'bookmark_border'}
                                        </span>
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

export default NotesPage;
