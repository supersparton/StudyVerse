# AI Context for StudyVerse

## Project Overview
- **Purpose**: A web application for studying management, including notes, pomodoro, tasks, and analytics.
- **Tech Stack**: React, Vite, JavaScript
- **Architecture**: A React-based SPA located in the `StudyVerse-React` directory. 

## Current State
- **Version**: 0.1.0
- **Status**: In Development
- **Last Updated**: 2026-03-11

## File Structure
```
StudyVerse/
├── AI_CONTEXT.md         # This context file
├── CHANGELOG.md          # Project changelog
└── StudyVerse-React/     # Main React application
    ├── package.json      # Dependencies and scripts
    ├── vite.config.js    # Vite builder configuration
    ├── index.html        # Entry HTML
    ├── src/              # React components and logic
    └── public/           # Public assets
```

## Key Components
### Application Core
- **Location**: `StudyVerse-React/src/`
- **Purpose**: Central location for the React application components and routing.

## Configuration
- **Environment Variables**: Managed via Vite (typically in `.env` files).
- **API Endpoints**: N/A
- **Database Schema**: N/A

## Known Issues
- None explicitly tracked yet.

## Future Improvements
- Further development of frontend features using React components.

## Development Notes
Project initialized locally by cloning from `supersparton/StudyVerse`.
Switched to the `poojan` branch to work on the React-based implementation.
To run the dev server: `cd StudyVerse-React && npm run dev`.
