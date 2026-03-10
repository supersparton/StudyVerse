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
    const [currentMode, setCurrentMode] = useState('focus');     // 'focus', 'short', or 'long'
    const [timeLeft, setTimeLeft] = useState(modes.focus.time);  // Seconds remaining
    const [isRunning, setIsRunning] = useState(false);           // Is timer counting down?
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);

    // useRef stores the interval ID — doesn't cause re-renders
    const intervalRef = useRef(null);

    // ─── FORMAT TIME (seconds → "MM:SS") ───
    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    // ─── SWITCH MODE ───
    function switchMode(mode) {
        clearInterval(intervalRef.current); // Stop any running timer
        setIsRunning(false);
        setCurrentMode(mode);
        setTimeLeft(modes[mode].time);      // Reset time to mode's default
    }

    // ─── TOGGLE TIMER (Start / Pause) ───
    function toggleTimer() {
        if (isRunning) {
            // PAUSE: stop the countdown
            clearInterval(intervalRef.current);
            setIsRunning(false);
        } else {
            // START: begin counting down every 1 second
            setIsRunning(true);
        }
    }

    // ─── RESET TIMER ───
    function resetTimer() {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setTimeLeft(modes[currentMode].time);
    }

    // ─── SKIP TO NEXT MODE ───
    function skipTimer() {
        if (currentMode === 'focus') {
            switchMode(sessionsCompleted > 0 && sessionsCompleted % 4 === 0 ? 'long' : 'short');
        } else {
            switchMode('focus');
        }
    }

    // ─── useEffect: RUNS THE COUNTDOWN ───
    // This effect runs whenever "isRunning" changes.
    // If isRunning is true, it starts a setInterval that
    // decrements timeLeft by 1 every second.
    useEffect(function () {
        if (isRunning) {
            intervalRef.current = setInterval(function () {
                setTimeLeft(function (prev) {
                    if (prev <= 1) {
                        // Timer reached 0!
                        clearInterval(intervalRef.current);
                        setIsRunning(false);

                        // If we just finished a focus session, update stats
                        if (currentMode === 'focus') {
                            setSessionsCompleted(function (s) { return s + 1; });
                            setTotalFocusSeconds(function (t) { return t + modes.focus.time; });
                        }

                        alert('Timer complete! 🎉');
                        return 0;
                    }
                    return prev - 1; // Subtract 1 second
                });
            }, 1000); // Run every 1000ms = 1 second
        }

        // CLEANUP: runs when isRunning changes or component unmounts
        return function () {
            clearInterval(intervalRef.current);
        };
    }, [isRunning]); // Only re-run when isRunning changes

    // ─── Format total focus time for display ───
    var totalMins = Math.floor(totalFocusSeconds / 60);
    var focusDisplay = totalMins >= 60
        ? Math.floor(totalMins / 60) + 'h ' + (totalMins % 60) + 'm'
        : totalMins + 'm';

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
                                <h4>{sessionsCompleted}</h4>
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
                                <h4>7 Day</h4>
                                <p>Current Streak</p>
                            </div>
                        </div>
                    </div>

                    {/* Current Task */}
                    <div className="pomodoro-current-task fade-in-up fade-in-up-delay-4">
                        <h3 style={{ marginBottom: '12px' }}>Currently Working On</h3>
                        <div className="current-task-card">
                            <div>
                                <h4>Review Calculus Chapter 4</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mathematics — Due today</p>
                            </div>
                            <span className="badge badge-red">High</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default PomodoroPage;
