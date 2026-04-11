/* ============================================================
   STUDYVERSE — Profile Page (ProfilePage.jsx)
   ============================================================
   Connected to backend API for profile CRUD.

   CRUD OPERATIONS:
   - READ   → GET /api/profile         (Fetch user profile from DB)
   - UPDATE → PUT /api/profile         (Save profile changes to DB)

   The profile data is now stored in the Supabase database,
   not just localStorage. This means it persists across devices!

   REACT CONCEPTS:
   - useEffect to load profile from database on mount
   - fetch() with PUT method to send updated data
   ============================================================ */

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/profile.css';

const API = import.meta.env.VITE_API_URL;

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
    const [loading, setLoading] = useState(true);

    // ─── Get JWT token ───
    function getToken() {
        var user = localStorage.getItem('studyverse-user');
        if (user) return JSON.parse(user).token;
        return null;
    }

    // ─── READ: Fetch profile from database on page load ───
    useEffect(function () {
        fetchProfile();
    }, []);

    /**
     * fetchProfile — GET /api/profile
     * Reads the logged-in user's profile from the database.
     */
    async function fetchProfile() {
        try {
            var response = await fetch(API + '/api/profile', {
                headers: { 'Authorization': 'Bearer ' + getToken() }
            });
            var data = await response.json();

            if (data.success && data.user) {
                // Populate form fields with data from database
                setFullName(data.user.full_name || '');
                setEmail(data.user.email || '');
                setBio(data.user.bio || '');

                // Also load from localStorage for fields not in DB
                var saved = localStorage.getItem('studyverse-profile');
                if (saved) {
                    var local = JSON.parse(saved);
                    setSelectedAvatar(local.avatar || '👨‍🎓');
                    setEnrollmentNo(local.enrollmentNo || '');
                    setCollege(local.college || '');
                    setBranch(local.branch || '');
                    setSemester(local.semester || '');
                }
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            // Fallback to localStorage
            var saved = localStorage.getItem('studyverse-profile');
            if (saved) {
                var local = JSON.parse(saved);
                setSelectedAvatar(local.avatar || '👨‍🎓');
                setFullName(local.fullName || '');
                setEmail(local.email || '');
                setEnrollmentNo(local.enrollmentNo || '');
                setCollege(local.college || '');
                setBranch(local.branch || '');
                setSemester(local.semester || '');
                setBio(local.bio || '');
            }
        } finally {
            setLoading(false);
        }
    }

    /**
     * saveProfile — UPDATE: PUT /api/profile
     * Sends updated profile data to the database.
     * Also saves to localStorage for extra fields.
     */
    async function saveProfile() {
        try {
            // UPDATE in database — send name and bio to backend
            var response = await fetch(API + '/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({
                    full_name: fullName,
                    bio: bio,
                    avatar_url: selectedAvatar   // Store emoji as avatar
                })
            });

            var data = await response.json();

            // Also save extra fields to localStorage (not in DB schema)
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
            localStorage.setItem('studyverse-profile', JSON.stringify(profileData));

            if (data.success) {
                alert('Profile saved to database! ✅');
            } else {
                alert('Saved locally. Backend: ' + data.message);
            }
        } catch (err) {
            console.error('Failed to save profile:', err);
            // Still save locally as fallback
            var profileData = {
                avatar: selectedAvatar, fullName: fullName, email: email,
                enrollmentNo: enrollmentNo, college: college, branch: branch,
                semester: semester, bio: bio,
            };
            localStorage.setItem('studyverse-profile', JSON.stringify(profileData));
            alert('Saved locally (backend offline)');
        }
    }

    // ─── RESET PROFILE ───
    function resetProfile() {
        setSelectedAvatar('👨‍🎓');
        setFullName('');
        setEmail('');
        setEnrollmentNo('');
        setCollege('');
        setBranch('');
        setSemester('');
        setBio('');
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
                        <p>Your profile is synced with the database.</p>
                    </div>

                    {loading && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Loading profile from database...
                        </p>
                    )}

                    {/* Avatar Selection */}
                    <div className="profile-card">
                        <h3 className="profile-card-title">Choose Your Avatar</h3>
                        <p className="profile-card-subtitle">Click to select an avatar.</p>
                        <div className="avatar-grid">
                            {avatars.map(function (emoji) {
                                return (
                                    <div key={emoji}
                                        className={'avatar-option' + (selectedAvatar === emoji ? ' selected' : '')}
                                        onClick={function () { setSelectedAvatar(emoji); }}>
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
