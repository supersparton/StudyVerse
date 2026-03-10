/* ============================================================
   STUDYVERSE — Login Page Component (LoginPage.jsx)
   ============================================================
   REACT CONCEPTS USED:
   - useState — stores form data (email, password)
   - useNavigate — redirects to dashboard after successful login
   - Event handlers — functions that run when user clicks/types
   
   HOW useState WORKS:
   const [value, setValue] = useState(initialValue);
   - "value" is the current data
   - "setValue" is the function to UPDATE the data
   - When setValue is called, React RE-RENDERS the component
   ============================================================ */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
    // ─── STATE VARIABLES ───
    // useState creates a "reactive" variable.
    // When it changes, React automatically updates the UI.
    const [email, setEmail] = useState('');       // Stores email input
    const [password, setPassword] = useState(''); // Stores password input
    const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

    // useNavigate gives us a function to change the current page/URL
    const navigate = useNavigate();

    // The required email domain for validation
    const domain = 'adaniuni.ac.in';

    // ─── FORM VALIDATION & SUBMIT ───
    // This function runs when the user clicks "Login"
    function handleLogin() {
        // Regex pattern: needs uppercase, lowercase, number, special char, min 8 chars
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;

        // Check if fields are empty
        if (email === '' || password === '') {
            alert('Email and Password is required');
            return; // Stop here, don't continue
        }

        // Check if email has correct domain
        if (!email.endsWith(domain)) {
            alert('Email must be @adaniuni.ac.in');
            return;
        }

        // Check if password meets requirements
        if (!passwordRegex.test(password)) {
            alert('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            return;
        }

        // All checks passed! Navigate to dashboard
        navigate('/dashboard');
    }

    // ─── TOGGLE PASSWORD VISIBILITY ───
    function togglePassword() {
        setShowPassword(!showPassword); // Flip true↔false
    }

    return (
        <div className="signup-layout">
            {/* ─── Left Visual Panel ─── */}
            <div className="signup-visual">
                <div className="signup-visual-content fade-in-up">
                    <div className="visual-img">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBptPFg5u2eWs3x8kVctG9-kepS8XK_jBcJsolsguahGRo_9gPohXTzEgMZE9WDWoIN4OLxFh09FQdrKU59AtZgfnVksYDEr9E8sU7uxGzvYjgY3ei-3GfndUBXXAPNYvP9ms1t7o76eOngdETsmVX-Xu8QQr9iiHF3hlZiONQvZVXx01OYQQHfO0Va1b7D3eo6ZbEP8KP0PBcgt_nFi4RbGi38mQbf2Et3c7kONdLL57DGqFNdM-Li6YgU3KGZ_Nkk1HyYuwWMzqRc"
                            alt="StudyVerse illustration"
                        />
                    </div>
                    <h2>Unlock your academic potential</h2>
                    <p>Join thousands of students managing tasks, joining study rooms, and acing exams with StudyVerse.</p>
                </div>
            </div>

            {/* ─── Right Form Panel ─── */}
            <div className="signup-form-side">
                <div className="signup-form-header">
                    <Link to="/" className="navbar-brand">
                        <div className="logo-icon">
                            <span className="material-symbols-outlined">school</span>
                        </div>
                        <h2 style={{ fontSize: '1.125rem' }}>StudyVerse</h2>
                    </Link>
                    <div className="login-link">
                        <span>Don't have an account?</span>
                        <Link to="/signup">Sign up</Link>
                    </div>
                </div>

                <div className="signup-form-container fade-in-up">
                    <h1>Welcome back</h1>
                    <p className="lead">Login to your account.</p>

                    {/* Microsoft Sign In Button */}
                    <button className="google-btn" type="button">
                        Sign in with Microsoft
                    </button>

                    <div className="divider"><span>Or login with email</span></div>

                    {/* Login Form */}
                    <div className="form-stack">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            {/* 
                value={email} — displays the current email state
                onChange — fires every time user types something
                e.target.value — the new text in the input
              */}
                            <input
                                className="form-input"
                                id="email"
                                type="email"
                                placeholder="jane@adaniuni.ac.in"
                                value={email}
                                onChange={function (e) { setEmail(e.target.value); }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-icon-wrapper">
                                <input
                                    className="form-input"
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChange={function (e) { setPassword(e.target.value); }}
                                />
                                <button type="button" className="input-icon-btn" onClick={togglePassword}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Login Button — calls handleLogin when clicked */}
                        <button
                            type="button"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '8px' }}
                            onClick={handleLogin}
                        >
                            Login
                        </button>

                        <p className="terms-text">
                            By logging in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                        </p>
                    </div>
                </div>

                <div className="signup-footer">
                    © 2025 StudyVerse Inc. All rights reserved.
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
