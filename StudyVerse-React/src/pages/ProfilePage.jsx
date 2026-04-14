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
    // ─── FORM STATE ───
    const [selectedAvatar, setSelectedAvatar] = useState('👨‍🎓');
    const [avatarFile, setAvatarFile] = useState(null);
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
                // Populate form fields with data entirely from the database
                setFullName(data.user.full_name || '');
                setEmail(data.user.email || '');
                setBio(data.user.bio || '');
                setEnrollmentNo(data.user.enrollment_no || '');
                setCollege(data.user.college || '');
                setBranch(data.user.branch || '');
                setSemester(data.user.semester || '');
                if (data.user.avatar_url) setSelectedAvatar(data.user.avatar_url);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            setLoading(false);
        }
    }

    /**
     * saveProfile — UPDATE: PUT /api/profile
     * Sends updated profile data to the database.
     */
    async function saveProfile() {
        try {
            // --- Limit image size to 5MB client-side ---
            if (avatarFile && avatarFile.size > 5 * 1024 * 1024) {
                return alert('Profile picture is too large! Please select an image smaller than 5MB.');
            }

            // Build form data to support file uploads
            let formData = new FormData();
            formData.append('full_name', fullName);
            formData.append('bio', bio);
            formData.append('enrollment_no', enrollmentNo);
            formData.append('college', college);
            formData.append('branch', branch);
            formData.append('semester', semester);
            
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            // UPDATE in database
            var response = await fetch(API + '/api/profile', {
                method: 'PUT',
                headers: {
                    // Do NOT set Content-Type here; let the browser set it automatically for FormData
                    'Authorization': 'Bearer ' + getToken()
                },
                body: formData
            });

            var data = await response.json();

            if (data.success) {
                alert('Profile saved to database! ✅');
            } else {
                alert('Error editing profile: ' + data.message);
            }
        } catch (err) {
            console.error('Failed to save profile:', err);
            alert('Cannot connect to server');
        }
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

                    {/* Profile Picture Upload */}
                    <div className="profile-card">
                        <h3 className="profile-card-title">Profile Picture</h3>
                        <p className="profile-card-subtitle">Upload a photo to personalize your profile.</p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '16px' }}>
                            <div className="user-avatar" style={{ fontSize: '40px', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {avatarFile ? (
                                    <img src={URL.createObjectURL(avatarFile)} alt="Preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (selectedAvatar && selectedAvatar.startsWith('http') ? (
                                    <img src={selectedAvatar} alt="Current" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    selectedAvatar
                                ))}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                    if(e.target.files && e.target.files[0]) {
                                        setAvatarFile(e.target.files[0]);
                                    }
                                }} 
                                style={{ fontSize: '14px' }}
                            />
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
                    <div className="profile-actions" style={{ justifyContent: 'flex-end' }}>
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
