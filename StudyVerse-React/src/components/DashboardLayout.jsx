/* ============================================================
   STUDYVERSE — DashboardLayout Component (DashboardLayout.jsx)
   ============================================================
   A "layout" component that wraps every dashboard page with
   the sidebar + main content area.
   
   COLLAPSIBLE SIDEBAR:
   - Uses useState to track if sidebar is open or closed
   - When closed, a hamburger button appears in the top-header
   - CSS handles positioning so nothing overlaps
   
   REACT CONCEPT: "children" PROP
   - When you put content BETWEEN component tags, React passes
     it as a special prop called "children"
   - <DashboardLayout>  <h1>Hello</h1>  </DashboardLayout>
     → children = <h1>Hello</h1>
   ============================================================ */

import React, { useState } from 'react';
import Sidebar from './Sidebar';

function DashboardLayout({ children }) {
  // ─── STATE: Is the sidebar open or closed? ───
  // true = sidebar visible, false = sidebar hidden
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toggle function — flips open↔closed
  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  return (
    <div className={'layout-dashboard' + (sidebarOpen ? '' : ' sidebar-closed')}>
      {/* Sidebar receives "isOpen" and "onToggle" as props */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main content area on the right */}
      <main className="main-content">
        {/* 
          When sidebar is closed, this button appears INSIDE
          the top-header area using CSS absolute positioning.
          It sits at the left edge of the header without
          creating a separate bar or overlapping content.
        */}
        {!sidebarOpen && (
          <button
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            title="Open sidebar"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}

        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
