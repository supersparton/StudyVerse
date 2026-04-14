/* ============================================================
   STUDYVERSE — Notes Page Component (NotesPage.jsx)
   ============================================================
   Full CRUD for notes — connected to the backend API.

   CRUD OPERATIONS:
   - CREATE → POST   /api/notes        (Add new note)
   - READ   → GET    /api/notes        (Fetch all notes)
   - UPDATE → PUT    /api/notes/:id    (Edit a note)
   - DELETE → DELETE /api/notes/:id    (Remove a note)

   REACT CONCEPTS:
   - useState for notes array, form inputs, and UI states
   - useEffect to fetch notes from backend on page load
   - fetch() to make HTTP requests to our Express API
   - JWT token sent in Authorization header for authentication
   ============================================================ */

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

// Backend API base URL — comes from .env file
const API = import.meta.env.VITE_API_URL;

function NotesPage() {
    // ─── STATE ───
    const [notes, setNotes] = useState([]);             // All notes from database
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);       // Show loading state while fetching

    // Form state for creating/editing notes
    const [showForm, setShowForm] = useState(false);    // Toggle the note form
    const [editingNote, setEditingNote] = useState(null); // Track which note is being edited
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formSubject, setFormSubject] = useState('');

    // ─── HELPER: Get JWT token from localStorage ───
    // The token was saved during login/signup
    function getToken() {
        var user = localStorage.getItem('studyverse-user');
        if (user) {
            var parsed = JSON.parse(user);
            return parsed.token;
        }
        return null;
    }

    // ─── READ: Fetch all notes from backend on page load ───
    // useEffect with [] runs ONCE when the component mounts
    useEffect(function () {
        fetchNotes();
    }, []);

    /**
     * fetchNotes — GET /api/notes
     * Reads all notes for the logged-in user from the database.
     * The JWT token is sent in the Authorization header.
     */
    async function fetchNotes() {
        try {
            var response = await fetch(API + '/api/notes', {
                headers: {
                    'Authorization': 'Bearer ' + getToken()  // Send JWT for authentication
                }
            });
            var data = await response.json();

            if (data.success) {
                setNotes(data.notes);  // Update state with notes from database
            }
        } catch (err) {
            console.error('Failed to fetch notes:', err);
        } finally {
            setLoading(false);  // Stop loading spinner regardless of success/failure
        }
    }

    /**
     * handleSaveNote — CREATE or UPDATE a note
     * 
     * If editingNote is set → PUT /api/notes/:id (Update)
     * If editingNote is null → POST /api/notes    (Create)
     */
    async function handleSaveNote() {
        // Validate — title is required
        if (!formTitle.trim()) {
            alert('Please enter a title for the note');
            return;
        }

        try {
            var url = API + '/api/notes';
            var method = 'POST';  // Default: create new note

            // If we're editing an existing note, use PUT and include the note ID
            if (editingNote) {
                url = API + '/api/notes/' + editingNote.id;
                method = 'PUT';
            }

            var response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({
                    title: formTitle,
                    content: formContent,
                    subject: formSubject
                })
            });

            var data = await response.json();

            if (data.success) {
                // Refresh the notes list to show the new/updated note
                fetchNotes();
                // Reset the form
                resetForm();
                alert(editingNote ? 'Note updated! ✅' : 'Note created! ✅');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Failed to save note:', err);
            alert('Failed to save note. Is the backend running?');
        }
    }

    /**
     * handleDeleteNote — DELETE /api/notes/:id
     * Removes a note from the database.
     * Includes a confirm dialog for safety.
     */
    async function handleDeleteNote(noteId) {
        // Ask the user to confirm before deleting
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            var response = await fetch(API + '/api/notes/' + noteId, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + getToken()
                }
            });

            var data = await response.json();

            if (data.success) {
                // Refresh notes list after deletion
                fetchNotes();
                alert('Note deleted! 🗑️');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Failed to delete note:', err);
        }
    }

    /**
     * toggleFavorite — PUT /api/notes/:id
     * Toggles the is_favorite boolean on a note
     */
    async function toggleFavorite(note) {
        try {
            var response = await fetch(API + '/api/notes/' + note.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({
                    is_favorite: !note.is_favorite
                })
            });

            var data = await response.json();
            if (data.success) {
                fetchNotes(); // Reload notes to show updated star immediately
            }
        } catch (err) {
            console.error('Failed to toggle favorite status:', err);
        }
    }

    /**
     * startEditing — Fills the form with existing note data for editing
     */
    function startEditing(note) {
        setEditingNote(note);
        setFormTitle(note.title);
        setFormContent(note.content || '');
        setFormSubject(note.subject || '');
        setShowForm(true);
    }

    /**
     * resetForm — Clears all form fields and closes the form
     */
    function resetForm() {
        setShowForm(false);
        setEditingNote(null);
        setFormTitle('');
        setFormContent('');
        setFormSubject('');
    }

    // ─── Subject color mapping for visual tags ───
    var subjectColors = {
        'Mathematics': { bg: 'var(--indigo-light, #e0e7ff)', color: 'var(--primary, #6366f1)' },
        'History':     { bg: 'var(--purple-light, #ede9fe)', color: 'var(--purple, #8b5cf6)' },
        'Chemistry':   { bg: 'var(--cyan-light, #cffafe)',   color: 'var(--cyan, #06b6d4)' },
        'Physics':     { bg: 'var(--green-light, #d1fae5)',  color: 'var(--green, #10b981)' },
        'Biology':     { bg: 'var(--orange-light, #ffedd5)', color: 'var(--orange, #f59e0b)' },
        'Design':      { bg: 'var(--pink-light, #fce7f3)',   color: 'var(--pink, #ec4899)' },
    };

    function getSubjectStyle(subject) {
        return subjectColors[subject] || { bg: 'var(--indigo-light, #e0e7ff)', color: 'var(--primary, #6366f1)' };
    }

    // Format the date for display
    function formatDate(dateString) {
        if (!dateString) return '';
        var date = new Date(dateString);
        var now = new Date();
        var diff = now - date;
        var hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return hours + 'h ago';
        var days = Math.floor(hours / 24);
        if (days === 1) return 'Yesterday';
        if (days < 7) return days + ' days ago';
        return date.toLocaleDateString();
    }

    var filters = ['All', 'Recent'];

    return (
        <DashboardLayout>
            {/* Top Header */}
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search notes..." />
                </div>
                <div className="header-actions">
                    {/* CREATE: Button to open the new note form */}
                    <button className="btn btn-primary" onClick={function () { resetForm(); setShowForm(true); }}>
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
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {notes.length > 0
                                    ? notes.length + ' notes stored in database'
                                    : 'No notes yet. Create your first note!'}
                            </p>
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

                    {/* ─── CREATE / UPDATE Form ─── */}
                    {showForm && (
                        <div className="note-card fade-in-up" style={{ padding: '24px', marginBottom: '20px' }}>
                            <h3 style={{ marginBottom: '16px' }}>
                                {editingNote ? '✏️ Edit Note' : '📝 Create New Note'}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Note title..."
                                    value={formTitle}
                                    onChange={function (e) { setFormTitle(e.target.value); }}
                                />
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Subject (e.g., Mathematics, Physics)..."
                                    value={formSubject}
                                    onChange={function (e) { setFormSubject(e.target.value); }}
                                />
                                <textarea
                                    className="form-input"
                                    placeholder="Note content..."
                                    rows="4"
                                    value={formContent}
                                    onChange={function (e) { setFormContent(e.target.value); }}
                                    style={{ resize: 'vertical' }}
                                ></textarea>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-outline" onClick={resetForm}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleSaveNote}>
                                        {editingNote ? 'Update Note' : 'Save Note'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── Loading State ─── */}
                    {loading && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                            Loading notes from database...
                        </p>
                    )}

                    {/* ─── READ: Notes Grid — displays all notes from database ─── */}
                    <div className="notes-grid">
                        {notes.map(function (note) {
                            var style = getSubjectStyle(note.subject);
                            return (
                                <div className="note-card fade-in-up" key={note.id}>
                                    {note.subject && (
                                        <span className="note-tag" style={{ background: style.bg, color: style.color }}>
                                            {note.subject}
                                        </span>
                                    )}
                                    <h4>{note.title}</h4>
                                    <p>{note.content}</p>
                                    <div className="note-footer">
                                        <span>{formatDate(note.created_at)}</span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {/* FAVORITE: Toggle button */}
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontSize: '18px', cursor: 'pointer', color: note.is_favorite ? '#fbbf24' : 'var(--text-secondary)' }}
                                                title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                                                onClick={function () { toggleFavorite(note); }}
                                            >
                                                {note.is_favorite ? 'star' : 'star_border'}
                                            </span>
                                            {/* UPDATE: Edit button */}
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontSize: '18px', cursor: 'pointer', color: 'var(--primary)' }}
                                                title="Edit note"
                                                onClick={function () { startEditing(note); }}
                                            >
                                                edit
                                            </span>
                                            {/* DELETE: Delete button */}
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontSize: '18px', cursor: 'pointer', color: '#ef4444' }}
                                                title="Delete note"
                                                onClick={function () { handleDeleteNote(note.id); }}
                                            >
                                                delete
                                            </span>
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

export default NotesPage;
