/* ============================================================
   STUDYVERSE — App Component (App.jsx)
   ============================================================
   This is the ROOT component of the entire application.
   
   WHAT IS A COMPONENT?
   - A component is a reusable piece of UI (like a building block)
   - In React, every page is a component
   - Components are JavaScript functions that return HTML (JSX)
   
   WHAT IS ROUTING?
   - Routing lets us show different pages based on the URL
   - "/" shows the Landing Page
   - "/login" shows the Login Page
   - We use React Router's <Routes> and <Route> components
   ============================================================ */

import React from 'react';

// Routes = container for all routes, Route = one route definition
import { Routes, Route } from 'react-router-dom';

// ─── Import all page components ───
// Public pages (visible to everyone)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Dashboard pages (visible after login)
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/NotesPage';
import TasksPage from './pages/TasksPage';
import PomodoroPage from './pages/PomodoroPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityInnerPage from './pages/CommunityInnerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';

// ─────────────────────────────────────────────
// APP COMPONENT
// ─────────────────────────────────────────────
// This function defines WHAT to show for each URL.
// When the user navigates to "/login", React Router
// looks at the path and renders the matching component.

function App() {
  return (
    <Routes>
      {/* === PUBLIC ROUTES === */}
      {/* path="/" means this is the homepage */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* === DASHBOARD ROUTES === */}
      {/* These pages have the sidebar + header layout */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/pomodoro" element={<PomodoroPage />} />
      <Route path="/communities" element={<CommunitiesPage />} />
      <Route path="/communities/:id" element={<CommunityInnerPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

// Export the component so main.jsx can import it
export default App;
