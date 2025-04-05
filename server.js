const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

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

// ----- IN-MEMORY DATA STORE -----
const agents = {
  'it-support': {
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
  'sales-agent': {
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
  'testing-agent': {
    name: 'Testing Agent',
    type: 'Developer',
    priority: 'Medium',
    deadline: '2026 Q1',
    progress: 'Integration',
    documentation: `# Testing Agent Documentation

Details on how to run tests, coverage metrics, CI/CD steps...`,
    pipeline: {}
  },
  'report-finder': {
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
  'cv-checker': {
    name: 'CV Checker',
    type: 'HR',
    priority: 'Low',
    deadline: '2026 Q1',
    progress: 'Planning',
    documentation: `# CV Checker Documentation

Analyze resumes, check for keywords, automate shortlisting...`,
    pipeline: {}
  },
  'automated-customer-support': {
    name: 'Automated Customer support',
    type: 'IT',
    priority: 'High',
    deadline: '2026 Q2',
    progress: 'Production',
    documentation: `# Automated Customer Support

Runs automated chat bots, customer tickets, etc.`,
    pipeline: {}
  }
};

// ----- ROUTES -----
// MAIN PAGE: AGENTS TABLE
app.get('/', (req, res) => {
  const currentTab = req.query.tab || 'all';
  let agentEntries = Object.entries(agents);

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
});

// AGENT EDIT/ADD PAGE
app.get('/agent/:agentKey', (req, res) => {
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
  } else if (agents[agentKey]) {
    agentData = agents[agentKey];
  } else {
    return res.send(`
      <h1>Agent not found</h1>
      <p><a href="/">Go back</a></p>
    `);
  }

  let deadlineYear = '';
  let deadlineQuarter = '';
  if (agentData.deadline) {
    const parts = agentData.deadline.split(' ');
    deadlineYear = parts[0] || '';
    deadlineQuarter = parts[1] || '';
  }

  res.render('agent', { agentKey, agentData, isNew, deadlineYear, deadlineQuarter });
});

// HANDLE AGENT SAVE (POST)
app.post('/agent/:agentKey/save', (req, res) => {
  const deadline = req.body.deadlineYear + ' ' + req.body.deadlineQuarter;
  const agentKey = req.params.agentKey;

  if (agentKey === 'new') {
    const newSlug = slugify(req.body.name || 'untitled-agent');
    agents[newSlug] = {
      name: req.body.name || 'Untitled Agent',
      type: req.body.type || '',
      priority: req.body.priority || 'High',
      deadline,
      progress: req.body.progress || '',
      documentation: req.body.documentation || '',
      pipeline: {}
    };
    return res.redirect('/');
  }

  const agentData = agents[agentKey];
  if (!agentData) return res.send('Agent not found');

  agentData.name = req.body.name || agentData.name;
  agentData.type = req.body.type || agentData.type;
  agentData.priority = req.body.priority || agentData.priority;
  agentData.deadline = deadline;
  agentData.progress = req.body.progress || agentData.progress;
  agentData.documentation = req.body.documentation || agentData.documentation;

  res.redirect('/');
});

// HANDLE AGENT DELETE (POST)
app.post('/agent/:agentKey/delete', (req, res) => {
  const agentKey = req.params.agentKey;
  if (agents[agentKey]) {
    delete agents[agentKey];
    return res.redirect('/');
  }
  res.send('Agent not found');
});

// DASHBOARD PAGE
app.get('/dashboard/:agentKey', (req, res) => {
  const agentKey = req.params.agentKey;
  const agentData = agents[agentKey];
  if (!agentData) {
    return res.send(`
      <h1>Agent not found</h1>
      <p><a href="/">Go back</a></p>
    `);
  }
  res.render('dashboard', { agentKey, agentData });
});

// HANDLE PIPELINE SAVE (POST)

app.post('/dashboard/:agentKey/save', (req, res) => {
  const agentKey = req.params.agentKey;
  const agentData = agents[agentKey];
  if (!agentData) return res.status(404).json({ status: 'error', message: 'Agent not found' });
  try {
    agentData.pipeline = JSON.parse(req.body.pipeline || '{}');
  } catch (e) {
    agentData.pipeline = {};
  }
  return res.json({ status: 'success' });
});



// ----- START THE SERVER -----
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
