# Multi-Agent Designer

A Node.js application for designing and managing multi-agent systems.

## Project Structure

```
├── app.js                  # Main application entry point
├── config/
│   └── database.js         # Database configuration
├── data/
│   └── sampleData.js       # Sample data for initialization
├── models/
│   ├── Agent.js            # Agent model with MongoDB methods
│   └── AgentSchema.js      # Mongoose schema for Agent
├── public/
│   └── css/                # CSS files
│       ├── agent.css       # Styles for agent edit/add page
│       ├── common.css      # Common styles
│       ├── dashboard.css   # Styles for dashboard page
│       ├── index.css       # Styles for main page
│       └── reset.css       # Global reset styles
├── routes/
│   ├── agents.js           # Routes for agent operations
│   ├── dashboard.js        # Routes for dashboard operations
│   └── index.js            # Main routes
├── scripts/
│   └── initDb.js           # Script to initialize the database
├── services/
│   └── dbInitializer.js    # Service to initialize the database
├── utils/
│   └── helpers.js          # Utility functions
└── views/                  # EJS templates
    ├── agent.ejs           # Agent edit/add page template
    ├── dashboard.ejs       # Dashboard page template
    └── index.ejs           # Main page template
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure MongoDB is running on your system.

3. Initialize the database with sample data:
   ```
   npm run init-db
   ```

4. Start the application:
   ```
   npm start
   ```

5. For development with auto-restart:
   ```
   npm run dev
   ```

## Features

- Create, read, update, and delete agents
- Design agent pipelines with a visual editor
- Filter agents by status
- Pagination for agent listing
- MongoDB integration for data persistence
