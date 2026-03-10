/* ============================================================
   STUDYVERSE — Profile Page (ProfilePage.jsx)
   ============================================================
   Users can:
   - Select an emoji avatar
   - Fill in their academic details
   - Save profile to localStorage (persists across reloads)
   
   REACT CONCEPTS:
   - useState for all form fields
   - useEffect to LOAD saved data when component first mounts
   - localStorage — browser's built-in key-value storage
   
   WHY localStorage?
   - It saves data even after the browser is closed
   - Perfect for saving user preferences without a backend
   - Data is stored as strings, so we use JSON.stringify/parse
   ============================================================ */

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/profile.css';

function ProfilePage() {
    // ─── AVATAR OPTIONS ───
    const avatars = ['👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🎨', '👨‍🏫', '👩‍🏫',
        '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '🦊', '🐱', '🐸', '🦉'];

    // ─── FORM STATE ───
    const [selectedAvatar, setSelectedAvatar] = useState('👨‍🎓');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [enrollmentNo, setEnrollmentNo] = useState('');
    const [college, setCollege] = useState('');
    const [branch, setBranch] = useState('');
    const [semester, setSemester] = useState('');
    const [bio, setBio] = useState('');

    // ─── LOAD SAVED PROFILE ON MOUNT ───
    // useEffect with [] runs ONCE when the component first appears
    useEffect(function () {
        // Try to get saved profile from localStorage
        var saved = localStorage.getItem('studyverse-profile');
        if (saved) {
            // Parse the JSON string back into an object
            var data = JSON.parse(saved);
            setSelectedAvatar(data.avatar || '👨‍🎓');
            setFullName(data.fullName || '');
            setEmail(data.email || '');
            setEnrollmentNo(data.enrollmentNo || '');
            setCollege(data.college || '');
            setBranch(data.branch || '');
            setSemester(data.semester || '');
            setBio(data.bio || '');
        }
    }, []); // Empty array = run only once on mount

    // ─── SAVE PROFILE ───
    function saveProfile() {
        var profileData = {
            avatar: selectedAvatar,
            fullName: fullName,
            email: email,
            enrollmentNo: enrollmentNo,
            college: college,
            branch: branch,
            semester: semester,
            bio: bio,
        };
        // Convert object to JSON string and save
        localStorage.setItem('studyverse-profile', JSON.stringify(profileData));
        alert('Profile saved successfully! ✅');
    }

    // ─── RESET PROFILE ───
    function resetProfile() {
        // Clear all fields
        setSelectedAvatar('👨‍🎓');
        setFullName('');
        setEmail('');
        setEnrollmentNo('');
        setCollege('');
        setBranch('');
        setSemester('');
        setBio('');
        // Remove from localStorage
        localStorage.removeItem('studyverse-profile');
        alert('Profile reset!');
    }

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
                <div className="content-grid fade-in-up" style={{ maxWidth: '800px' }}>
                    {/* Page Header */}
                    <div className="profile-page-header">
                        <h1>My Profile</h1>
                        <p>Customize your profile with your details.</p>
                    </div>

                    {/* Avatar Selection */}
                    <div className="profile-card">
                        <h3 className="profile-card-title">Choose Your Avatar</h3>
                        <p className="profile-card-subtitle">Click to select an avatar.</p>
                        <div className="avatar-grid">
                            {avatars.map(function (emoji) {
                                return (
                                    <div
                                        key={emoji}
                                        className={'avatar-option' + (selectedAvatar === emoji ? ' selected' : '')}
                                        onClick={function () { setSelectedAvatar(emoji); }}
                                    >
                                        {emoji}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Student Details Form */}
                    <div className="profile-card">
                        <h3 className="profile-card-title">Student Details</h3>
                        <p className="profile-card-subtitle">Fill in your academic information.</p>
                        <div className="profile-form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input className="form-input" type="text" placeholder="Poojan Patel"
                                    value={fullName} onChange={function (e) { setFullName(e.target.value); }} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input className="form-input" type="email" placeholder="poojan@adaniuni.ac.in"
                                    value={email} onChange={function (e) { setEmail(e.target.value); }} />
                            </div>
                            <div className="form-group">
                                <label>Enrollment No.</label>
                                <input className="form-input" type="text" placeholder="AU12345"
                                    value={enrollmentNo} onChange={function (e) { setEnrollmentNo(e.target.value); }} />
                            </div>
                            <div className="form-group">
                                <label>College / University</label>
                                <input className="form-input" type="text" placeholder="Adani University"
                                    value={college} onChange={function (e) { setCollege(e.target.value); }} />
                            </div>
                            <div className="form-group">
                                <label>Branch / Department</label>
                                <input className="form-input" type="text" placeholder="Computer Science"
                                    value={branch} onChange={function (e) { setBranch(e.target.value); }} />
                            </div>
                            <div className="form-group">
                                <label>Semester</label>
                                <select className="form-input" value={semester} onChange={function (e) { setSemester(e.target.value); }}>
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
                            <div className="form-group full-width">
                                <label>Bio</label>
                                <textarea className="form-input" placeholder="Tell us about yourself..."
                                    value={bio} onChange={function (e) { setBio(e.target.value); }} rows="3"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="profile-actions">
                        <button className="btn btn-outline" onClick={resetProfile}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span> Reset
                        </button>
                        <button className="btn btn-primary" onClick={saveProfile}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span> Save Profile
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ProfilePage;
