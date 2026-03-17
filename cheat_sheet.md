# StudyVerse React Presentation Cheat Sheet

Use this quick-reference guide during your presentation. It breaks down every file in your project into a simple 2-sentence explanation of *what it does* and *the React concepts it proves you know*.

## ⚙️ The Setup Files (How the app starts)

### [index.html](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/index.html)
* **What you say:** "This is the only actual HTML file in the project. It contains an empty `<div id="root">` which acts as the container where React injects our entire application."
* **Concept to drop:** Single Page Application (SPA).

### [src/main.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/main.jsx)
* **What you say:** "This is the spark that starts the app. It finds that empty root `div` from the HTML file and uses `ReactDOM.createRoot().render()` to draw our main `<App />` component inside it."
* **Concept to drop:** Rendering to the DOM.

### [src/App.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/App.jsx)
* **What you say:** "This is the 'Traffic Cop' of my app. It uses `React Router` to look at the URL in the browser and decide which Page component to display (like `/dashboard` vs `/notes`) without ever reloading the browser."
* **Concept to drop:** Client-side Routing (`BrowserRouter`, `Routes`, `Route`).

### [src/styles/style.css](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/styles/style.css)
* **What you say:** "This holds the global CSS variables and layout rules. For example, I used CSS Grid in `.layout-dashboard` to perfectly split the screen between my fixed sidebar (260px) and the main content area (1fr)."
* **Concept to drop:** CSS Grid, CSS Variables.

---

## 🧱 The Layout Components (The reusability)

### [src/components/DashboardLayout.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/components/DashboardLayout.jsx)
* **What you say:** "Instead of copying the sidebar code onto every page, I created this wrapper layout. It holds the Sidebar on the left, and uses the special React `children` prop to inject whatever specific page the user is on into the right side."
* **Concept to drop:** The `children` prop, Layout Wrappers.

### [src/components/Sidebar.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/components/Sidebar.jsx)
* **What you say:** "This is the collapsible navigation menu. It receives a true/false `isOpen` prop from the DashboardLayout to know if it should add a CSS class to hide itself. It also uses `.map()` to generate all the navigation links from a clean array of data."
* **Concept to drop:** Props (passing data down), `.map()` for lists, `useLocation()` for active link styles.

---

## 📄 The Dashboard Pages (The features)

### [src/pages/DashboardPage.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/pages/DashboardPage.jsx)
* **What you say:** "This is the main overview screen. It has a list of upcoming tasks where the checkboxes actually work. I achieved this by storing an array of true/false values in `useState`, and updating the state array when a user clicks a box to toggle the checkmark."
* **Concept to drop:** `useState` (managing arrays), Ternary Operators (`? :`) for dynamic CSS classes.

### [src/pages/NotesPage.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/pages/NotesPage.jsx)
* **What you say:** "This page displays study notes. I implemented a working filter (All, Recent, Favorited) using State. Whenever the user clicks a filter button, React recalculates a `filteredNotes` variable and instantly redraws the screen with the correct notes."
* **Concept to drop:** State-driven filtering, `.filter()` and `.map()`.

### [src/pages/TasksPage.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/pages/TasksPage.jsx)
* **What you say:** "This is a Kanban-style board with three columns: To Do, In Progress, and Done. I built this using nested data—an array of Columns, each containing an array of Tasks—and used a double `.map()` loop to render the UI."
* **Concept to drop:** Nested Arrays, Double `.map()` loops, Inline styling (`style={{ textDecoration: '...' }}`).

### [src/pages/PomodoroPage.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/pages/PomodoroPage.jsx)
* **What you say:** "This is a working focus timer. I used `useState` to track the seconds remaining, and `useEffect` to start a `setInterval` that ticks down the clock every second if the timer is running."
* **Concept to drop:** `useEffect` (for starting/stopping intervals), `useRef` (to safely store the interval ID).

### [src/pages/CommunitiesPage.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/pages/CommunitiesPage.jsx)
* **What you say:** "This page lets users browse study groups. The 'Join' button is fully dynamic. When clicked, it updates the community object in State, and the button instantly changes its text (from 'Join' to 'Joined') and its CSS color using a ternary operator."
* **Concept to drop:** Updating Objects in State arrays.

### [src/pages/ResourcesPage.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/pages/ResourcesPage.jsx)
* **What you say:** "This page simulates a file explorer (Semesters > Subjects > Files). Instead of changing the URL, I used 'Stateful Navigation'. A state variable tracks whether the user is viewing the 'semesters' grid or the 'files' list, and I use `&&` conditional rendering to swap the HTML instantly."
* **Concept to drop:** Conditional Rendering (`condition && <HTML>`), Stateful Navigation.

### [src/pages/ProfilePage.jsx](file:///c:/Users/POOJAN/OneDrive%20-%20Adani%20University/Sem-6/WAD/StudyVerse/StudyVerse-React/src/pages/ProfilePage.jsx)
* **What you say:** "This page allows users to update their info. I connected the HTML input fields directly to React State so every keystroke is tracked. When they click save, it writes the data to the browser's `localStorage`."
* **Concept to drop:** Controlled Inputs (`value={state} onChange={...}`), `localStorage`, `useEffect` (fetching local storage ONCE on page load).
