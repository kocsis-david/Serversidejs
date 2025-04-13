/**
 * Sample data for initializing the database
 */

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

module.exports = {
  sampleAgents
};
