/* ============================================================
   STUDYVERSE — Pomodoro Timer Page (PomodoroPage.jsx)
   ============================================================
   A study timer based on the Pomodoro Technique:
   - 25 min Focus → 5 min Short Break → repeat
   - After 4 focus sessions → 15 min Long Break
   
   REACT CONCEPTS USED:
   - useState — stores timer state (timeLeft, mode, isRunning)
   - useEffect — runs side effects (the countdown interval)
   - useRef — stores the interval ID without causing re-renders
   
   WHY useRef INSTEAD OF useState FOR intervalId?
   - useState causes re-render when updated
   - useRef does NOT cause re-render
   - We don't need to re-render when storing an interval ID
   ============================================================ */

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/pomodoro.css';

function PomodoroPage() {
    // ─── MODE DEFINITIONS ───
    // Each mode has a time (in seconds) and a label
    const modes = {
        focus: { time: 25 * 60, label: 'Focus Session' },
        short: { time: 5 * 60, label: 'Short Break' },
        long: { time: 15 * 60, label: 'Long Break' },
    };

    // ─── STATE VARIABLES ───
    const [currentMode, setCurrentMode] = useState('focus');
    // Store time left for EACH mode separately to prevent progress loss when swapping tabs
    const [timeLeftMap, setTimeLeftMap] = useState({
        focus: modes.focus.time,
        short: modes.short.time,
        long: modes.long.time
    });
    const timeLeft = timeLeftMap[currentMode];

    const [isRunning, setIsRunning] = useState(false);
    const [stats, setStats] = useState({
        sessionsToday: 0,
        totalFocusTime: '0m',
        streak: '0 Day'
    });

    // Dynamic Task Selection
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);

    // useRef stores the interval ID — doesn't cause re-renders
    const intervalRef = useRef(null);
    const accumulatedRef = useRef(0);

    // ─── FETCH STATS FROM DB ───
    async function fetchStats() {
        try {
            let userStr = localStorage.getItem('studyverse-user');
            if(!userStr) return;
            let token = JSON.parse(userStr).token;
            let res = await fetch(import.meta.env.VITE_API_URL + '/api/analytics', { 
                headers: { 'Authorization': 'Bearer ' + token }
            });
            let analyticsData = await res.json();
            if (analyticsData.success) {
                setStats({
                    sessionsToday: analyticsData.sessionsToday || 0,
                    totalFocusTime: analyticsData.stats.totalStudyHours || '0m',
                    streak: (analyticsData.stats.streakDays || 0) + ' Days'
                });
            }
        } catch(e) {
            console.error("Failed to fetch analytics for Pomodoro:", e);
        }
    }

    // Initial Fetch for Active Tasks and Stats
    useEffect(() => {
        async function fetchTasks() {
            try {
                let userStr = localStorage.getItem('studyverse-user');
                if(!userStr) return;
                let token = JSON.parse(userStr).token;
                let res = await fetch(import.meta.env.VITE_API_URL + '/api/tasks', { 
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                let data = await res.json();
                if(data.success && data.tasks.length > 0) {
                    let pending = data.tasks.filter(t => t.status !== 'completed');
                    setTasks(pending);
                    if(pending.length > 0) setActiveTask(pending[0]);
                }
            } catch(e) {
                console.error("Failed to fetch tasks for Pomodoro:", e);
            }
        }
        fetchTasks();
        fetchStats();
    }, []);

    // ─── FORMAT TIME (seconds → "MM:SS") ───
    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    // ─── SAVE SESSION TO DATABASE HELPER ───
    async function saveSessionToDatabase() {
        const seconds = accumulatedRef.current;
        if (seconds < 5) return; // Only save if more than 5s focused

        try {
            let userStr = localStorage.getItem('studyverse-user');
            if (userStr) {
                let token = JSON.parse(userStr).token;
                const response = await fetch(import.meta.env.VITE_API_URL + '/api/pomodoro/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ focus_seconds: seconds })
                });
                if (response.ok) {
                    accumulatedRef.current = 0; // Reset after saving
                    fetchStats(); // Update stats immediately
                }
            }
        } catch (e) {
            console.error("Failed to save session", e);
        }
    }

    // ─── SWITCH MODE ───
    function switchMode(mode) {
        // Stop timer but don't reset focus progress unless finished
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setCurrentMode(mode);
    }

    // ─── TOGGLE TIMER (Start / Pause) ───
    function toggleTimer() {
        if (isRunning) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
        } else {
            // If starting a break and we have focus time saved, flush it to DB
            if (currentMode !== 'focus' && accumulatedRef.current > 5) {
                saveSessionToDatabase();
            }
            setIsRunning(true);
        }
    }

    // ─── RESET TIMER ───
    function resetTimer() {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setTimeLeftMap(prev => ({
            ...prev,
            [currentMode]: modes[currentMode].time
        }));
        if (currentMode === 'focus') {
            accumulatedRef.current = 0;
        }
    }

    // ─── SKIP TO NEXT MODE ───
    function skipTimer() {
        if (currentMode === 'focus') {
            // Just move to break, logic will handle save if they start it
            switchMode('short');
        } else {
            switchMode('focus');
        }
    }

    // ─── useEffect: RUNS THE COUNTDOWN ───
    useEffect(function () {
        if (isRunning) {
            intervalRef.current = setInterval(function () {
                if (currentMode === 'focus') {
                    accumulatedRef.current += 1;
                }

                setTimeLeftMap(function (prevMap) {
                    const prev = prevMap[currentMode];
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        setIsRunning(false);

                        if (currentMode === 'focus') {
                            saveSessionToDatabase(); 
                        }

                        alert('Timer complete! 🎉');
                        return {
                            ...prevMap,
                            [currentMode]: 0
                        };
                    }
                    return {
                        ...prevMap,
                        [currentMode]: prev - 1
                    };
                });
            }, 1000);
        }

        return function () {
            clearInterval(intervalRef.current);
        };
    }, [isRunning, currentMode]);

    // Save session on page unmount (user changes page)
    useEffect(() => {
        return () => {
            if (accumulatedRef.current > 5) {
                saveSessionToDatabase();
            }
        };
    }, []);

    // ─── Format total focus time for display (using fallback if totalFocusTime is not yet formatted) ───
    const focusDisplay = stats.totalFocusTime || '0m';

    return (
        <DashboardLayout>
            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search..." />
                </div>
                <div className="header-actions">
                    <button className="icon-btn">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="notif-dot"></span>
                    </button>
                </div>
            </header>

            <div className="content-scroll">
                <div className="content-grid">
                    <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Pomodoro Timer</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Stay focused with timed study sessions.</p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="pomodoro-tabs fade-in-up fade-in-up-delay-1">
                        {['focus', 'short', 'long'].map(function (mode) {
                            return (
                                <button
                                    key={mode}
                                    className={'pomo-tab' + (currentMode === mode ? ' active' : '')}
                                    onClick={function () { switchMode(mode); }}
                                >
                                    {mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short Break' : 'Long Break'}
                                </button>
                            );
                        })}
                    </div>

                    {/* Timer Display */}
                    <div className="pomodoro-timer-container fade-in-up fade-in-up-delay-2">
                        <div className="timer-ring">
                            <div className="timer-display">
                                <span className="timer-digits">{formatTime(timeLeft)}</span>
                                <span className="timer-label">{modes[currentMode].label}</span>
                            </div>
                        </div>
                        <div className="timer-controls">
                            <button className="timer-btn secondary" onClick={resetTimer}>
                                <span className="material-symbols-outlined">restart_alt</span>
                            </button>
                            <button className="timer-btn primary" onClick={toggleTimer}>
                                <span className="material-symbols-outlined">
                                    {isRunning ? 'pause' : 'play_arrow'}
                                </span>
                            </button>
                            <button className="timer-btn secondary" onClick={skipTimer}>
                                <span className="material-symbols-outlined">skip_next</span>
                            </button>
                        </div>
                    </div>

                    {/* Session Stats */}
                    <div className="pomodoro-stats fade-in-up fade-in-up-delay-3">
                        <div className="pomo-stat-card">
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '28px' }}>local_fire_department</span>
                            <div>
                                <h4>{stats.sessionsToday}</h4>
                                <p>Sessions Today</p>
                            </div>
                        </div>
                        <div className="pomo-stat-card">
                            <span className="material-symbols-outlined" style={{ color: 'var(--green)', fontSize: '28px' }}>schedule</span>
                            <div>
                                <h4>{focusDisplay}</h4>
                                <p>Total Focus</p>
                            </div>
                        </div>
                        <div className="pomo-stat-card">
                            <span className="material-symbols-outlined" style={{ color: 'var(--orange)', fontSize: '28px' }}>emoji_events</span>
                            <div>
                                <h4>{stats.streak}</h4>
                                <p>Current Streak</p>
                            </div>
                        </div>
                    </div>

                    {/* Current Task */}
                    <div className="pomodoro-current-task fade-in-up fade-in-up-delay-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ margin: 0 }}>Currently Working On</h3>
                            {tasks.length > 0 && (
                                <select 
                                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}
                                    value={activeTask?.id || ''}
                                    onChange={(e) => setActiveTask(tasks.find(t => t.id == e.target.value))}
                                >
                                    {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                            )}
                        </div>
                        
                        {activeTask ? (
                            <div className="current-task-card">
                                <div>
                                    <h4>{activeTask.title}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{activeTask.description || 'No description'}</p>
                                </div>
                                <span className={'badge ' + (activeTask.priority === 'high' ? 'badge-red' : activeTask.priority === 'medium' ? 'badge-orange' : 'badge-green')}>
                                    {activeTask.priority}
                                </span>
                            </div>
                        ) : (
                            <div className="current-task-card" style={{ justifyContent: 'center' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No pending tasks available.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default PomodoroPage;
