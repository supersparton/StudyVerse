/* ============================================================
   STUDYVERSE — Tasks Page Component (TasksPage.jsx)
   ============================================================
   Kanban-style task board with three columns:
   To Do, In Progress, Done.
   
   REACT CONCEPTS:
   - Storing structured data in state (arrays of objects)
   - Rendering nested data with .map()
   ============================================================ */

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

function TasksPage() {
    // ─── STATE: Filter ───
    const [activeFilter, setActiveFilter] = useState('All');

    // ─── Kanban columns data ───
    const columns = [
        {
            title: 'To Do',
            count: 3,
            tasks: [
                { title: 'Review Calculus Chapter 4', desc: 'Complete exercises 4.1 to 4.5 and review theorems.', due: 'Today', priority: 'High', badgeClass: 'badge-red' },
                { title: 'Submit History Essay Draft', desc: 'First draft of the Renaissance essay, minimum 2000 words.', due: 'Tomorrow', priority: 'Med', badgeClass: 'badge-orange' },
                { title: 'Read Chemistry Ch. 5', desc: 'Organic Chemistry fundamentals and reaction types.', due: 'Wed', priority: 'Low', badgeClass: 'badge-green' },
            ]
        },
        {
            title: 'In Progress',
            count: 2,
            tasks: [
                { title: 'Group Project Presentation', desc: 'Design 300 — Create slides for the final presentation.', due: 'Fri', priority: 'Med', badgeClass: 'badge-orange' },
                { title: 'Physics Lab Report', desc: 'Write up results from experiment #7 — wave optics.', due: 'Thu', priority: 'High', badgeClass: 'badge-red' },
            ]
        },
        {
            title: 'Done',
            count: 3,
            tasks: [
                { title: 'Complete Math Assignment 3', desc: 'Linear algebra problems set.', done: true },
                { title: 'Study for Biology Quiz', desc: 'Chapters 1-3 review.', done: true },
                { title: 'Research Paper Outline', desc: 'Environmental science topic outline.', done: true },
            ]
        },
    ];

    const filters = ['All', 'Today', 'This Week', 'High Priority', 'Completed'];

    return (
        <DashboardLayout>
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search tasks..." />
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary">
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
                            Organize and track your assignments, projects, and to-dos.
                        </p>
                    </div>

                    {/* Filter tabs */}
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

                    {/* Kanban Board — 3 columns */}
                    <div className="task-board fade-in-up fade-in-up-delay-2">
                        {columns.map(function (column) {
                            return (
                                <div className="task-column" key={column.title}>
                                    <div className="task-column-header">
                                        <h4>{column.title} <span className="count">{column.count}</span></h4>
                                        {column.title !== 'Done' && (
                                            <button className="icon-btn" style={{ width: '28px', height: '28px' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Task cards inside each column */}
                                    {column.tasks.map(function (task, index) {
                                        return (
                                            <div
                                                className="task-board-card"
                                                key={index}
                                                style={task.done ? { opacity: 0.7 } : {}}
                                            >
                                                <div className="task-title" style={task.done ? { textDecoration: 'line-through' } : {}}>
                                                    {task.title}
                                                </div>
                                                <div className="task-desc">{task.desc}</div>
                                                <div className="task-card-footer">
                                                    <span className="task-due">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                                            {task.done ? 'check_circle' : 'calendar_today'}
                                                        </span>
                                                        {task.done ? 'Completed' : task.due}
                                                    </span>
                                                    <span className={'badge ' + (task.done ? 'badge-green' : task.badgeClass)}>
                                                        {task.done ? 'Done' : task.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default TasksPage;
