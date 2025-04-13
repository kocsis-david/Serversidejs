const express = require('express');
const router = express.Router();
const AgentModel = require('../models/Agent');

/**
 * @route   GET /
 * @desc    Main page with agents table
 * @access  Public
 */
router.get('/', async (req, res) => {
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

module.exports = router;
