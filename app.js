const express = require('express');
const path = require('path');
const connectDB = require('./config/database');
const initializeDatabase = require('./services/dbInitializer');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies for POST requests
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine and define the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/index'));
app.use('/agent', require('./routes/agents'));
app.use('/dashboard', require('./routes/dashboard'));

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  // Initialize the database with sample data
  await initializeDatabase();
});

module.exports = app;
