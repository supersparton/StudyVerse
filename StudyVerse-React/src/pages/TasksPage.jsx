/* ============================================================
   STUDYVERSE — Tasks Page Component (TasksPage.jsx)
   ============================================================
   Full CRUD for tasks — connected to the backend API.

   CRUD OPERATIONS:
   - CREATE → POST   /api/tasks        (Add new task)
   - READ   → GET    /api/tasks        (Fetch all tasks)
   - UPDATE → PUT    /api/tasks/:id    (Edit task / change status)
   - DELETE → DELETE /api/tasks/:id    (Remove a task)

   REACT CONCEPTS:
   - useState, useEffect, fetch() with JWT auth
   - Kanban board layout with dynamic columns from task status
   ============================================================ */

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const API = import.meta.env.VITE_API_URL;

function TasksPage() {
    // ─── STATE ───
    const [tasks, setTasks] = useState([]);        // All tasks from database
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formTitle, setFormTitle] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formDueDate, setFormDueDate] = useState('');
    const [formPriority, setFormPriority] = useState('medium');
    const [formStatus, setFormStatus] = useState('pending');

    // ─── Get JWT token from localStorage ───
    function getToken() {
        var user = localStorage.getItem('studyverse-user');
        if (user) return JSON.parse(user).token;
        return null;
    }

    // ─── READ: Fetch all tasks on page load ───
    useEffect(function () { fetchTasks(); }, []);

    async function fetchTasks() {
        try {
            var response = await fetch(API + '/api/tasks', {
                headers: { 'Authorization': 'Bearer ' + getToken() }
            });
            var data = await response.json();
            if (data.success) setTasks(data.tasks);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    }

    /**
     * handleSaveTask — CREATE or UPDATE a task
     */
    async function handleSaveTask() {
        if (!formTitle.trim()) {
            alert('Please enter a title for the task');
            return;
        }

        try {
            var url = API + '/api/tasks';
            var method = 'POST';

            if (editingTask) {
                url = API + '/api/tasks/' + editingTask.id;
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
                    description: formDesc,
                    due_date: formDueDate || null,
                    priority: formPriority,
                    status: formStatus
                })
            });

            var data = await response.json();
            if (data.success) {
                fetchTasks();
                resetForm();
                alert(editingTask ? 'Task updated! ✅' : 'Task created! ✅');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error('Failed to save task:', err);
            alert('Failed to save task. Is the backend running?');
        }
    }

    /**
     * handleDeleteTask — DELETE /api/tasks/:id
     */
    async function handleDeleteTask(taskId) {
        if (!confirm('Delete this task?')) return;

        try {
            var response = await fetch(API + '/api/tasks/' + taskId, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + getToken() }
            });
            var data = await response.json();
            if (data.success) {
                fetchTasks();
                alert('Task deleted! 🗑️');
            }
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    }

    /**
     * handleStatusChange — UPDATE: Quick status toggle
     * Changes a task's status (e.g., pending → completed)
     */
    async function handleStatusChange(task, newStatus) {
        try {
            var response = await fetch(API + '/api/tasks/' + task.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({ status: newStatus })
            });
            var data = await response.json();
            if (data.success) fetchTasks();  // Refresh to show updated status
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    }

    function startEditing(task) {
        setEditingTask(task);
        setFormTitle(task.title);
        setFormDesc(task.description || '');
        setFormDueDate(task.due_date || '');
        setFormPriority(task.priority || 'medium');
        setFormStatus(task.status || 'pending');
        setShowForm(true);
    }

    function resetForm() {
        setShowForm(false);
        setEditingTask(null);
        setFormTitle('');
        setFormDesc('');
        setFormDueDate('');
        setFormPriority('medium');
        setFormStatus('pending');
    }

    // ─── Group tasks by status for Kanban columns ───
    var pendingTasks = tasks.filter(function (t) { return t.status === 'pending'; });
    var inProgressTasks = tasks.filter(function (t) { return t.status === 'in_progress'; });
    var completedTasks = tasks.filter(function (t) { return t.status === 'completed'; });

    // Priority badge styling
    function getBadgeClass(priority) {
        if (priority === 'high') return 'badge-red';
        if (priority === 'medium') return 'badge-orange';
        return 'badge-green';
    }

    function formatDueDate(dateStr) {
        if (!dateStr) return 'No due date';
        return new Date(dateStr).toLocaleDateString();
    }

    var filters = ['All', 'Today', 'High Priority', 'Completed'];

    // ─── Render a single task card ───
    function renderTaskCard(task) {
        var isDone = task.status === 'completed';
        return (
            <div className="task-board-card" key={task.id} style={isDone ? { opacity: 0.7 } : {}}>
                <div className="task-title" style={isDone ? { textDecoration: 'line-through' } : {}}>
                    {task.title}
                </div>
                {task.description && <div className="task-desc">{task.description}</div>}
                <div className="task-card-footer">
                    <span className="task-due">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            {isDone ? 'check_circle' : 'calendar_today'}
                        </span>
                        {isDone ? 'Completed' : formatDueDate(task.due_date)}
                    </span>
                    <span className={'badge ' + (isDone ? 'badge-green' : getBadgeClass(task.priority))}>
                        {isDone ? 'Done' : (task.priority || 'medium')}
                    </span>
                </div>
                {/* Action buttons for each task */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
                    {/* UPDATE: Move to next status */}
                    {task.status === 'pending' && (
                        <button className="btn btn-outline" style={{ fontSize: '11px', padding: '2px 8px' }}
                            onClick={function () { handleStatusChange(task, 'in_progress'); }}>
                            Start
                        </button>
                    )}
                    {task.status === 'in_progress' && (
                        <button className="btn btn-outline" style={{ fontSize: '11px', padding: '2px 8px' }}
                            onClick={function () { handleStatusChange(task, 'completed'); }}>
                            Done
                        </button>
                    )}
                    {/* UPDATE: Edit button */}
                    <span className="material-symbols-outlined"
                        style={{ fontSize: '16px', cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={function () { startEditing(task); }}>edit</span>
                    {/* DELETE: Delete button */}
                    <span className="material-symbols-outlined"
                        style={{ fontSize: '16px', cursor: 'pointer', color: '#ef4444' }}
                        onClick={function () { handleDeleteTask(task.id); }}>delete</span>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search tasks..." />
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={function () { resetForm(); setShowForm(true); }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span> New Task
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
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Task Manager</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {tasks.length > 0
                                ? tasks.length + ' tasks in database — Organize and track your work.'
                                : 'No tasks yet. Create your first task!'}
                        </p>
                    </div>

                    {/* Filter tabs */}
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

                    {/* ─── CREATE / UPDATE Form ─── */}
                    {showForm && (
                        <div className="note-card fade-in-up" style={{ padding: '24px', marginBottom: '20px' }}>
                            <h3 style={{ marginBottom: '16px' }}>
                                {editingTask ? '✏️ Edit Task' : '📋 Create New Task'}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input className="form-input" type="text" placeholder="Task title..."
                                    value={formTitle} onChange={function (e) { setFormTitle(e.target.value); }} />
                                <textarea className="form-input" placeholder="Description (optional)..." rows="2"
                                    value={formDesc} onChange={function (e) { setFormDesc(e.target.value); }}
                                    style={{ resize: 'vertical' }}></textarea>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '140px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Due Date</label>
                                        <input className="form-input" type="date" value={formDueDate}
                                            onChange={function (e) { setFormDueDate(e.target.value); }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: '140px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Priority</label>
                                        <select className="form-input" value={formPriority}
                                            onChange={function (e) { setFormPriority(e.target.value); }}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, minWidth: '140px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status</label>
                                        <select className="form-input" value={formStatus}
                                            onChange={function (e) { setFormStatus(e.target.value); }}>
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-outline" onClick={resetForm}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleSaveTask}>
                                        {editingTask ? 'Update Task' : 'Save Task'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                            Loading tasks from database...
                        </p>
                    )}

                    {/* ─── READ: Kanban Board — 3 columns grouped by status ─── */}
                    <div className="task-board fade-in-up fade-in-up-delay-2">
                        {/* TO DO Column */}
                        <div className="task-column">
                            <div className="task-column-header">
                                <h4>To Do <span className="count">{pendingTasks.length}</span></h4>
                            </div>
                            {pendingTasks.map(renderTaskCard)}
                        </div>

                        {/* IN PROGRESS Column */}
                        <div className="task-column">
                            <div className="task-column-header">
                                <h4>In Progress <span className="count">{inProgressTasks.length}</span></h4>
                            </div>
                            {inProgressTasks.map(renderTaskCard)}
                        </div>

                        {/* DONE Column */}
                        <div className="task-column">
                            <div className="task-column-header">
                                <h4>Done <span className="count">{completedTasks.length}</span></h4>
                            </div>
                            {completedTasks.map(renderTaskCard)}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default TasksPage;
