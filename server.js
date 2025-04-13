const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/agentDesigner', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies for POST requests
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine and define the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ----- UTILITY: Slugify a Name into a Key -----
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumerics with hyphens
    .replace(/^-+|-+$/g, '');      // Trim leading/trailing hyphens
}

// Import the Agent model
const AgentModel = require('./models/Agent');

// ----- ROUTES -----
// MAIN PAGE: AGENTS TABLE
app.get('/', async (req, res) => {
  try {
    const currentTab = req.query.tab || 'all';

    // Get all agents from the database
    const allAgents = await AgentModel.getAllAgents();
    let agentEntries = Object.entries(allAgents);

    // Filter agents based on the selected tab
    if (currentTab === 'in-progress') {
      agentEntries = agentEntries.filter(([, data]) => data.progress.toLowerCase() !== 'production');
    } else if (currentTab === 'in-production') {
      agentEntries = agentEntries.filter(([, data]) => data.progress.toLowerCase() === 'production');
    }

    // Pagination
    const itemsPerPage = 10;
    const currentPage = parseInt(req.query.page, 10) || 1;
    const totalItems = agentEntries.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedAgents = agentEntries.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    res.render('index', { currentTab, agents: paginatedAgents, totalPages, currentPage });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).send('Server error');
  }
});

// AGENT EDIT/ADD PAGE
app.get('/agent/:agentKey', async (req, res) => {
  try {
    const agentKey = req.params.agentKey;
    let agentData = {
      name: '',
      type: '',
      priority: 'High',
      deadline: '',
      progress: '',
      documentation: ''
    };
    let isNew = false;

    if (agentKey === 'new') {
      isNew = true;
    } else {
      const agent = await AgentModel.getAgentByKey(agentKey);
      if (agent) {
        agentData = agent;
      } else {
        return res.send(`
          <h1>Agent not found</h1>
          <p><a href="/">Go back</a></p>
        `);
      }
    }

    let deadlineYear = '';
    let deadlineQuarter = '';
    if (agentData.deadline) {
      const parts = agentData.deadline.split(' ');
      deadlineYear = parts[0] || '';
      deadlineQuarter = parts[1] || '';
    }

    res.render('agent', { agentKey, agentData, isNew, deadlineYear, deadlineQuarter });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).send('Server error');
  }
});

// HANDLE AGENT SAVE (POST)
app.post('/agent/:agentKey/save', async (req, res) => {
  try {
    const deadline = req.body.deadlineYear + ' ' + req.body.deadlineQuarter;
    const agentKey = req.params.agentKey;

    if (agentKey === 'new') {
      const newSlug = slugify(req.body.name || 'untitled-agent');
      const newAgentData = {
        name: req.body.name || 'Untitled Agent',
        type: req.body.type || '',
        priority: req.body.priority || 'High',
        deadline,
        progress: req.body.progress || '',
        documentation: req.body.documentation || '',
        pipeline: {}
      };

      await AgentModel.createAgent(newSlug, newAgentData);
      return res.redirect('/');
    }

    const agent = await AgentModel.getAgentByKey(agentKey);
    if (!agent) return res.send('Agent not found');

    const updatedData = {
      name: req.body.name || agent.name,
      type: req.body.type || agent.type,
      priority: req.body.priority || agent.priority,
      deadline,
      progress: req.body.progress || agent.progress,
      documentation: req.body.documentation || agent.documentation
    };

    await AgentModel.updateAgent(agentKey, updatedData);
    res.redirect('/');
  } catch (error) {
    console.error('Error saving agent:', error);
    res.status(500).send('Server error');
  }
});

// HANDLE AGENT DELETE (POST)
app.post('/agent/:agentKey/delete', async (req, res) => {
  try {
    const agentKey = req.params.agentKey;
    const result = await AgentModel.deleteAgent(agentKey);

    if (result) {
      return res.redirect('/');
    }
    res.send('Agent not found');
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).send('Server error');
  }
});

// DASHBOARD PAGE
app.get('/dashboard/:agentKey', async (req, res) => {
  try {
    const agentKey = req.params.agentKey;
    const agentData = await AgentModel.getAgentByKey(agentKey);

    if (!agentData) {
      return res.send(`
        <h1>Agent not found</h1>
        <p><a href="/">Go back</a></p>
      `);
    }
    res.render('dashboard', { agentKey, agentData });
  } catch (error) {
    console.error('Error fetching agent for dashboard:', error);
    res.status(500).send('Server error');
  }
});

// HANDLE PIPELINE SAVE (POST)
app.post('/dashboard/:agentKey/save', async (req, res) => {
  try {
    const agentKey = req.params.agentKey;
    const agent = await AgentModel.getAgentByKey(agentKey);

    if (!agent) {
      return res.status(404).json({ status: 'error', message: 'Agent not found' });
    }

    let pipeline = {};
    try {
      pipeline = JSON.parse(req.body.pipeline || '{}');
    } catch (e) {
      console.error('Error parsing pipeline JSON:', e);
    }

    await AgentModel.savePipeline(agentKey, pipeline);
    return res.json({ status: 'success' });
  } catch (error) {
    console.error('Error saving pipeline:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});



// Function to initialize the database with sample data
async function initializeDatabase() {
  try {
    // Check if there are any agents in the database
    const agents = await AgentModel.getAllAgents();
    if (Object.keys(agents).length === 0) {
      console.log('Initializing database with sample agents...');

      // Sample agents data
      const sampleAgents = [
        {
          key: 'it-support',
          name: 'IT support',
          type: 'IT',
          priority: 'High',
          deadline: '2025 Q2',
          progress: 'Testing',
          documentation: `# IT Support Documentation

This is where you can describe all processes, guidelines, etc. for IT support.
- Step 1: ...
- Step 2: ...`,
          pipeline: {}
        },
        {
          key: 'sales-agent',
          name: 'Sales Agent',
          type: 'Sales',
          priority: 'High',
          deadline: '2025 Q3',
          progress: 'Planning',
          documentation: `# Sales Agent Documentation

Sales best practices, scripts, and pipelines.
- Always greet the customer...`,
          pipeline: {}
        },
        {
          key: 'testing-agent',
          name: 'Testing Agent',
          type: 'Developer',
          priority: 'Medium',
          deadline: '2026 Q1',
          progress: 'Integration',
          documentation: `# Testing Agent Documentation

Details on how to run tests, coverage metrics, CI/CD steps...`,
          pipeline: {}
        },
        {
          key: 'report-finder',
          name: 'Report Finder',
          type: 'Information',
          priority: 'Low',
          deadline: '2024 Q4',
          progress: 'Developing',
          documentation: `# Report Finder Documentation

Locate and compile internal or external reports.
- Tooling used: ...
- Data sources: ...`,
          pipeline: {}
        },
        {
          key: 'cv-checker',
          name: 'CV Checker',
          type: 'HR',
          priority: 'Low',
          deadline: '2026 Q1',
          progress: 'Planning',
          documentation: `# CV Checker Documentation

Analyze resumes, check for keywords, automate shortlisting...`,
          pipeline: {}
        },
        {
          key: 'automated-customer-support',
          name: 'Automated Customer support',
          type: 'IT',
          priority: 'High',
          deadline: '2026 Q2',
          progress: 'Production',
          documentation: `# Automated Customer Support

Runs automated chat bots, customer tickets, etc.`,
          pipeline: {}
        }
      ];

      // Insert sample agents into the database
      for (const agent of sampleAgents) {
        await AgentModel.createAgent(agent.key, agent);
      }

      console.log('Sample agents added successfully!');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// ----- START THE SERVER -----
app.listen(PORT, async () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  // Initialize the database with sample data
  await initializeDatabase();
});
