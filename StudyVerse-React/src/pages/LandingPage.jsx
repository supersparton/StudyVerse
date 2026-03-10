/* ============================================================
   STUDYVERSE — Landing Page Component (LandingPage.jsx)
   ============================================================
   This is the PUBLIC homepage that visitors see first.
   It contains: Navbar, Hero, Live Stats, Features, How It Works,
   Testimonials, Gallery, CTA, and Footer.
   
   REACT CONCEPTS USED:
   - Link from react-router-dom (replaces <a href>)
   - JSX (HTML-like syntax inside JavaScript)
   - className (React uses className instead of HTML's class)
   ============================================================ */

import React from 'react';
import { Link } from 'react-router-dom';

// Import landing page specific styles
import '../styles/landing.css';

function LandingPage() {
    return (
        <>
            {/* ═══════════════════════════════════════
          NAVBAR (Top Navigation Bar)
          ═══════════════════════════════════════ */}
            <header className="navbar">
                {/* Brand logo + name */}
                <Link to="/" className="navbar-brand">
                    <div className="logo-icon">
                        <span className="material-symbols-outlined">school</span>
                    </div>
                    <h2>StudyVerse</h2>
                </Link>

                {/* Navigation links */}
                <nav className="navbar-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#gallery">Community</a>
                    <a href="#about">About</a>
                </nav>

                {/* Login / Sign Up buttons */}
                <div className="navbar-actions">
                    <Link to="/login" className="btn btn-ghost">Login</Link>
                    <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                </div>
            </header>

            <main>
                {/* ═══════════════════════════════════════
            HERO SECTION (Main Banner)
            ═══════════════════════════════════════ */}
                <section className="container">
                    <div className="hero">
                        {/* Left side: text content */}
                        <div className="hero-content fade-in-up">
                            <h1>
                                Your Campus<br />
                                <span className="accent">in the Cloud</span>
                            </h1>
                            <p className="subtitle">
                                The all-in-one workspace for students to focus, collaborate, and grow together.
                                Join the future of education.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
                            </div>

                            {/* Social proof: avatars + student count */}
                            <div className="hero-social-proof">
                                <div className="avatar-stack">
                                    <img className="avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH7BEzzy2xqy6I9os6lly0AE3nnbT4BPZEmcwcdAnhkC6h2keZ2uwQxhegU1E3yWUNZsKYK9A4OAuWxd_2dUk1y2sgb0HuyPbFd3zotilGkt6XHcWldbA36pTL0ZOVzIZ53U7y96edpKVtZjNkAMBQCmYUZXZ9lMO9rcpkKB6MGXKxS8a4Az3bJpyhphu2WSz_BhRNdDzALyub-pwx9rsjozLYbq3t6jWaRYTwHgJxP8Tl9NuDrM3pGxBEwlHZokb1NyuM8y8APAEk" alt="Student" />
                                    <img className="avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1IEaohkepTSRu3uc-GWVfHym7NuqDbwXI0-leK0T2fI0yjNF_ufoQNP-4aHHAYHJ3Wn5UIPDXJwCRv8DJRy2RYQLgECGJQOkyfTLVZHUkej_RK9dIFbhmGw3oGGvr5QGrKauy9Hyo8PhOqQAAuwI15vrckvMGNKoq1oTm6UUjuEHkkJHbqt0mH3TkG-mwVZs85uepV2WvTpztnbuyYzoZ6kcS6pa-rSeQUFfaxcM89CPfFez58NAc_4X8X75dp8UUsCqH9aErBOU6" alt="Student" />
                                    <img className="avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt9R6wfo29kOqvgnotiSPlNOdFL9n7X6VxC5ZwrR3jEhDYW-RUNviCFaCiWGvdfo_SNgfLdcErIvf0ru-G-QP9cLqFD8XyvAH68IXhsc58Qj2jtzqT3CBA8O6Tl1zyTalUWbPVZtcGCZKHMMmsljGRKxT49MZIvvlA2suklDPI5CiSZTHvrTYo_IdsnLq1bOegRhzXM58LevwRqNEUq1VQgYBJwbRVwUO6fQ7r3vswXOyeiAENgN8adcLrMElaL8puo1d697IPcOQB" alt="Student" />
                                </div>
                                <p><strong>+500</strong> Students already joined</p>
                            </div>
                        </div>

                        {/* Right side: image with floating card */}
                        <div className="hero-image fade-in-up fade-in-up-delay-2">
                            <div className="hero-image-card">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJfE5KZfsTP8l0xK8hOQkfhM_Qr7LzQ_YXPhFR8ubaSrztRTWtVe_h0mwhWJ1_-LfdvIsA2yrruzn1DakOndGlmPRFLiILLJE5Ewu_UenzIV9YCFLm0Gfls0XlYCq4kyJKFYR1qxRMMtYT8zAWwYfWXHdQwGbRgeldlw1Xi0sbjfvj8hJdyXiS3ad0IOBg0grkLMF2ivcy1A8T4lmCicfyVmHtiPPTczOvWAyTslhkVMYwjYcIQdXy5SFJ6IfqxIsfGymAjApL2EZn" alt="StudyVerse workspace" />
                                {/* Floating card showing Pomodoro timer */}
                                <div className="hero-float-card">
                                    <div className="float-left">
                                        <div className="float-icon">
                                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer</span>
                                        </div>
                                        <div>
                                            <div className="float-label">Deep Work Session</div>
                                            <div className="float-sub">25:00 remaining</div>
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="fill"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
            LIVE STATS RIBBON
            ═══════════════════════════════════════ */}
                <div className="live-stats">
                    <div className="container">
                        <div className="live-stats-inner">
                            <div className="live-stat">
                                <div className="live-dot-wrapper">
                                    <span className="live-dot-ping"></span>
                                    <span className="live-dot"></span>
                                </div>
                                <strong>243 Students Studying Now</strong>
                            </div>
                            <div className="stat-dot"></div>
                            <div className="live-stat">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
                                <strong>1,000+</strong> Notes Shared
                            </div>
                            <div className="stat-dot"></div>
                            <div className="live-stat">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                                <strong>50+</strong> Active Communities
                            </div>
                            <div className="stat-dot"></div>
                            <div className="live-stat">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
                                <strong>5,000+</strong> Focus Hours Logged
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════
            FEATURES SECTION
            ═══════════════════════════════════════ */}
                <section id="features" className="features-section">
                    <div className="container">
                        <div className="section-header fade-in-up">
                            <h2>Maximize Your Potential</h2>
                            <p>Tools designed to help you study smarter, not harder. Everything you need in one tab.</p>
                        </div>

                        <div className="features-grid">
                            {/* Feature 1 */}
                            <div className="card feature-card fade-in-up fade-in-up-delay-1">
                                <div className="feature-icon icon-indigo">
                                    <span className="material-symbols-outlined">timer</span>
                                </div>
                                <div>
                                    <h3>Productivity Tools</h3>
                                    <p>Customizable Pomodoro timers and focus sessions to keep you in the zone.</p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="card feature-card fade-in-up fade-in-up-delay-2">
                                <div className="feature-icon icon-purple">
                                    <span className="material-symbols-outlined">smart_toy</span>
                                </div>
                                <div>
                                    <h3>AI-Powered Resources</h3>
                                    <p>Every community has its own AI bot for instant doubt solving.</p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="card feature-card fade-in-up fade-in-up-delay-3">
                                <div className="feature-icon icon-pink">
                                    <span className="material-symbols-outlined">group</span>
                                </div>
                                <div>
                                    <h3>Real-time Communities</h3>
                                    <p>Join topic-based communities with channels for doubts, resources, and more.</p>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="card feature-card fade-in-up fade-in-up-delay-1">
                                <div className="feature-icon icon-green">
                                    <span className="material-symbols-outlined">description</span>
                                </div>
                                <div>
                                    <h3>Smart Notes</h3>
                                    <p>Upload PDFs, organize by subject and tags, search across all your notes.</p>
                                </div>
                            </div>

                            {/* Feature 5 */}
                            <div className="card feature-card fade-in-up fade-in-up-delay-2">
                                <div className="feature-icon icon-orange">
                                    <span className="material-symbols-outlined">checklist</span>
                                </div>
                                <div>
                                    <h3>Task Tracker</h3>
                                    <p>Create assignments with due dates, priority levels, and status tracking.</p>
                                </div>
                            </div>

                            {/* Feature 6 */}
                            <div className="card feature-card fade-in-up fade-in-up-delay-3">
                                <div className="feature-icon icon-cyan">
                                    <span className="material-symbols-outlined">emoji_events</span>
                                </div>
                                <div>
                                    <h3>Streaks &amp; Leaderboard</h3>
                                    <p>Build daily study streaks and compete on community leaderboards.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
            HOW IT WORKS SECTION
            ═══════════════════════════════════════ */}
                <section id="how-it-works" className="how-it-works-section">
                    <div className="container">
                        <div className="section-header fade-in-up">
                            <h2>How It Works</h2>
                            <p>Get started in 3 simple steps. It's completely free.</p>
                        </div>
                        <div className="steps-grid">
                            <div className="step-card fade-in-up fade-in-up-delay-1">
                                <div className="step-number">1</div>
                                <h3>Create Your Account</h3>
                                <p>Sign up with your email in seconds. No credit card needed — it's 100% free.</p>
                            </div>
                            <div className="step-card fade-in-up fade-in-up-delay-2">
                                <div className="step-number">2</div>
                                <h3>Set Up Your Dashboard</h3>
                                <p>Upload notes, create tasks, set your study schedule, and customize your space.</p>
                            </div>
                            <div className="step-card fade-in-up fade-in-up-delay-3">
                                <div className="step-number">3</div>
                                <h3>Join Communities &amp; Grow</h3>
                                <p>Join DSA, WebDev, AI, and other communities. Share resources and learn together.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
            TESTIMONIALS SECTION
            ═══════════════════════════════════════ */}
                <section id="testimonials" className="testimonials-section">
                    <div className="container">
                        <div className="section-header fade-in-up">
                            <h2>What Students Say</h2>
                            <p>Hear from students who are already using StudyVerse.</p>
                        </div>
                        <div className="testimonials-grid">
                            <div className="testimonial-card fade-in-up fade-in-up-delay-1">
                                <div className="testimonial-stars">★★★★★</div>
                                <p className="testimonial-text">
                                    "StudyVerse completely changed how I study. The Pomodoro timer and
                                    task tracker keep me focused."
                                </p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">AP</div>
                                    <div>
                                        <div className="name">Arjun Patel</div>
                                        <div className="role">B.Tech CSE, 3rd Year</div>
                                    </div>
                                </div>
                            </div>
                            <div className="testimonial-card fade-in-up fade-in-up-delay-2">
                                <div className="testimonial-stars">★★★★★</div>
                                <p className="testimonial-text">
                                    "The AI bot in the WebDev community is like having a personal tutor 24/7."
                                </p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">PS</div>
                                    <div>
                                        <div className="name">Priya Sharma</div>
                                        <div className="role">B.Tech IT, 2nd Year</div>
                                    </div>
                                </div>
                            </div>
                            <div className="testimonial-card fade-in-up fade-in-up-delay-3">
                                <div className="testimonial-stars">★★★★★</div>
                                <p className="testimonial-text">
                                    "I love the streak system — it keeps me accountable. I've been on a 45-day study streak!"
                                </p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">RK</div>
                                    <div>
                                        <div className="name">Rohan Kumar</div>
                                        <div className="role">B.Tech ECE, 4th Year</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
            GALLERY SECTION
            ═══════════════════════════════════════ */}
                <section id="gallery" className="gallery-section">
                    <div className="container">
                        <div className="section-header">
                            <h2>Join the Study Aesthetic</h2>
                            <p>Thousands of students sharing their progress every day.</p>
                        </div>
                        <div className="gallery-grid">
                            <div className="gallery-item gallery-item-large" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3xZoE86Cs92SqHIiXb9RRKduNyVfSZa9kLeOLWERpuTZV721RdkyxyfWQSqyjGIwEwWwU7oIlaAlvuo30vYUu_X4tT1DU-eDHcwvwdaO1ruZeWUDKMEnuZd2Zqt8PTRkifd0gn0yWaMikDAZpd9IyyZJB7vujfSql6hBVlqpTjVGSMACWC1NfBGe6T2YIZw8EPEkiqgV7cDZlu1_Fg_ER7LnNyMlcGlky33P_PjB5I5yEn_NRouOaYT2m6csNaq8dRz1e0GXWMRx1')" }}>
                                <div className="overlay"><span>Group Study Sessions</span></div>
                            </div>
                            <div className="gallery-item" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARatXoiN_ajOrojIhrxJn91qlFNq27ob8bHzrn_ATjgw_547AURWP4HktDEE5wtQutOKiYfEOoJcLClH3J2wFPVMeLiW5edgFBfoqxEklp9O0tN14misrYc3ffOQ5PHddPmKkWUEcWz1rXkgDhJsG4vKKrxYshIPE80wWDaImQ3U-eIkqKFUGvW1HFGpkL6zbjpYbyOoS4xJwF0P6FZCmivh0nUglkLpFHHOc1dzOjUxJrSOpRekKrVwo66K6p-PbJReMdCpIx0oEp')" }}>
                                <span className="gallery-label">Lofi Room</span>
                            </div>
                            <div className="gallery-item" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCK0PsE07V1kkHrYqedwOo9EstapUu_Ep2Iv-UJJ2_i8yi1s9nhwLRSsTm6XVSakweuxsq--8DSfDhmyKIYHfsOfIFfE10KvrCDaE6m9hpgQGu7nGz3WVdvwAh3TZYFIWmwsnOcd2kJyAV0-WrRlp09EEq_YCXpDZbX7VrkrTEBMxF_VzwbHLz0QsNtC_eVoI0EZ5dfbWG-P9Sjr9h5Ol1jNVJvrPA1bMY78W77F7p-PP04g3l6sgxe5Glsg6FlOpr0hdKjrrC4RdWK')" }}>
                            </div>
                            <div className="gallery-item" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAI5gYb0GFPYnlcWFBv6MWBpXvX6fWZjOGliIkW1d8QZDlw6DTuvvDOEEK25xDpDVFjBX7lddVtZnZzSg9NcKsSCG6MSIQXSQZR219Of3mmekRLYu0Axok2xVeryij3qC6GJyZuH1fzY4PpaE3WA_B5mWoxUax8o1YHMCA-XBteIK8FWU4GFZU3i1l-kkfgG0NviCKxpcYasiuWI7HDatUF3pqA62Tsd_-zxC7_x22YmdI4Z6dIyUFKPODKFaAMMQ-ehrg1N_1WUk0F')" }}>
                            </div>
                            <div className="gallery-item" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgnc6ytT5lb6RlycHKT6xjZyeBAlg2s6l7iKi-UZ2ysvQYZI1J3aG_gKs01mGmHRJBWFTvWIkj5MLVXg2eyS1aSsJFqgtPpe77MqNww5XWSCo_A_-ypdzQCRVCV9AMDjZHH4rXojiPEkVv7oS_bJFIji8lSRMFdNblvHLEcGbHtzIPZt_YeE9SLBJyYu-m0cDSyuDVc3b6ejahhfpCqSTq3CcGBKga6_1u2K-HAc4C5OVKi7N24ZeGcksc5cmtHHUJi3tS7eKcYKCu')" }}>
                                <span className="gallery-label gallery-label-accent">Coding Club</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
            CTA SECTION (Call to Action)
            ═══════════════════════════════════════ */}
                <section className="cta-section">
                    <div className="container">
                        <div className="cta-box fade-in-up">
                            <h2>Ready to Supercharge Your Studies?</h2>
                            <p>Join hundreds of students who are already studying smarter. It's completely free.</p>
                            <Link to="/signup" className="btn-white">
                                Get Started for Free
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
            <footer id="about" className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="brand-row">
                                <div className="logo-icon">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>school</span>
                                </div>
                                <span>StudyVerse</span>
                            </div>
                            <p>Empowering students to achieve their academic goals through community and technology.</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-col">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#how-it-works">How It Works</a>
                                <a href="#testimonials">Reviews</a>
                            </div>
                            <div className="footer-col">
                                <h4>Company</h4>
                                <a href="#about">About</a>
                                <a href="#">Contact</a>
                            </div>
                            <div className="footer-col">
                                <h4>Resources</h4>
                                <a href="#">Help Center</a>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Use</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        © 2025 StudyVerse. All rights reserved.
                    </div>
                </div>
            </footer>
        </>
    );
}

export default LandingPage;
