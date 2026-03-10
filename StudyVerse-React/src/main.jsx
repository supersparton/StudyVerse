/* ============================================================
   STUDYVERSE — React App Entry Point (main.jsx)
   ============================================================
   This is the VERY FIRST file that runs when the app starts.
   
   What it does:
   1. Imports React and ReactDOM (the library)
   2. Imports BrowserRouter (for page navigation)
   3. Imports our main App component
   4. Renders (displays) the App inside the HTML page
   ============================================================ */

// React is the core library for building components
import React from 'react';

// ReactDOM connects React to the actual browser DOM (the HTML page)
import ReactDOM from 'react-dom/client';

// BrowserRouter enables client-side routing (navigation without page reload)
import { BrowserRouter } from 'react-router-dom';

// Our main App component that contains all pages and routes
import App from './App';

// Import the main stylesheet (applies to ALL pages)
import './styles/style.css';

// ─────────────────────────────────────────────
// RENDER THE APP
// ─────────────────────────────────────────────
// document.getElementById('root') finds the <div id="root"> in index.html
// We wrap <App /> inside <BrowserRouter> so that React Router works
// throughout the entire application

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
