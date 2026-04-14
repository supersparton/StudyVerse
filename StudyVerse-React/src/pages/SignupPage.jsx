/* ============================================================
   STUDYVERSE — Signup Page Component (SignupPage.jsx)
   ============================================================
   Very similar to LoginPage, but with extra fields:
   Full Name and College/University.
   
   Uses the same React concepts: useState, useNavigate, etc.
   ============================================================ */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function SignupPage() {
    // State for each form input
    const [name, setName] = useState('');
    const [college, setCollege] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // New profile fields
    const [enrollmentNo, setEnrollmentNo] = useState('');
    const [branch, setBranch] = useState('');
    const [semester, setSemester] = useState('');
    const [bio, setBio] = useState('');

    const navigate = useNavigate();

    // Handle form submission — sends data to our Express backend
    async function handleSignup() {
        // Basic validation
        if (!name || !email || !password || !college || !enrollmentNo || !branch || !semester) {
            alert('Please fill out all required academic fields');
            return;
        }

        try {
            // Send signup request to our backend API
            const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: name,
                    email: email,
                    password: password,
                    enrollment_no: enrollmentNo,
                    college: college,
                    branch: branch,
                    semester: semester,
                    bio: bio
                })
            });

            // Parse the JSON response from server
            const data = await response.json();

            if (data.success) {
                // Save user info + JWT token in browser
                // The token is needed for all protected API calls (notes, tasks, etc.)
                localStorage.setItem('studyverse-user', JSON.stringify({
                    ...data.user,
                    token: data.token   // Save the JWT token!
                }));
                alert('Account created successfully! 🎉');
                navigate('/dashboard');
            } else {
                // Show the error message from backend
                alert(data.message);
            }
        } catch (err) {
            alert('Cannot connect to server. Make sure backend is running!');
            console.error(err);
        }
    }

    return (
        <div className="signup-layout">
            {/* Left Visual Panel */}
            <div className="signup-visual">
                <div className="signup-visual-content fade-in-up">
                    <div className="visual-img">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBptPFg5u2eWs3x8kVctG9-kepS8XK_jBcJsolsguahGRo_9gPohXTzEgMZE9WDWoIN4OLxFh09FQdrKU59AtZgfnVksYDEr9E8sU7uxGzvYjgY3ei-3GfndUBXXAPNYvP9ms1t7o76eOngdETsmVX-Xu8QQr9iiHF3hlZiONQvZVXx01OYQQHfO0Va1b7D3eo6ZbEP8KP0PBcgt_nFi4RbGi38mQbf2Et3c7kONdLL57DGqFNdM-Li6YgU3KGZ_Nkk1HyYuwWMzqRc"
                            alt="StudyVerse illustration"
                        />
                    </div>
                    <h2>Unlock your academic potential</h2>
                    <p>Join thousands of students managing tasks and acing exams with StudyVerse.</p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="signup-form-side">
                <div className="signup-form-header">
                    <Link to="/" className="navbar-brand">
                        <div className="logo-icon">
                            <span className="material-symbols-outlined">school</span>
                        </div>
                        <h2 style={{ fontSize: '1.125rem' }}>StudyVerse</h2>
                    </Link>
                    <div className="login-link">
                        <span>Already a member?</span>
                        <Link to="/login">Log in</Link>
                    </div>
                </div>

                <div className="signup-form-container fade-in-up">
                    <h1>Create your account</h1>
                    <p className="lead">Start your productivity journey today.</p>

                    <button className="google-btn" type="button">
                        Sign up with Microsoft
                    </button>

                    <div className="divider"><span>Or register with email</span></div>

                    <div className="form-stack">
                        {/* Name + Email row (side by side) */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    className="form-input" id="name" type="text" placeholder="Jane Doe"
                                    value={name} onChange={function (e) { setName(e.target.value); }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    className="form-input" id="email" type="email" placeholder="jane@example.com"
                                    value={email} onChange={function (e) { setEmail(e.target.value); }}
                                />
                            </div>
                        </div>

                        {/* College + Branch row (side by side) */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="college">College / University *</label>
                                <input
                                    className="form-input" id="college" type="text" placeholder="Adani University"
                                    value={college} onChange={function (e) { setCollege(e.target.value); }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="branch">Branch / Department *</label>
                                <input
                                    className="form-input" id="branch" type="text" placeholder="Computer Science"
                                    value={branch} onChange={function (e) { setBranch(e.target.value); }}
                                />
                            </div>
                        </div>

                        {/* Enrollment + Semester row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="enrollment">Enrollment No. *</label>
                                <input
                                    className="form-input" id="enrollment" type="text" placeholder="AU12345"
                                    value={enrollmentNo} onChange={function (e) { setEnrollmentNo(e.target.value); }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="semester">Semester *</label>
                                <select className="form-input" id="semester" value={semester} onChange={function (e) { setSemester(e.target.value); }}>
                                    <option value="">Select Semester</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                    <option value="3">Semester 3</option>
                                    <option value="4">Semester 4</option>
                                    <option value="5">Semester 5</option>
                                    <option value="6">Semester 6</option>
                                    <option value="7">Semester 7</option>
                                    <option value="8">Semester 8</option>
                                </select>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="form-group">
                            <label htmlFor="bio">Bio</label>
                            <textarea
                                className="form-input" id="bio" placeholder="Tell us about yourself..."
                                value={bio} onChange={function (e) { setBio(e.target.value); }} rows="2"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-icon-wrapper">
                                <input
                                    className="form-input" id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 8 characters"
                                    value={password} onChange={function (e) { setPassword(e.target.value); }}
                                />
                                <button type="button" className="input-icon-btn" onClick={function () { setShowPassword(!showPassword); }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="button" className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: '8px' }}
                            onClick={handleSignup}
                        >
                            Get Started
                        </button>

                        <p className="terms-text">
                            By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                        </p>
                    </div>
                </div>

                <div className="signup-footer">© 2025 StudyVerse Inc. All rights reserved.</div>
            </div>
        </div>
    );
}

export default SignupPage;
