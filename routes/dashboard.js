const express = require('express');
const router = express.Router();
const AgentModel = require('../models/Agent');

/**
 * @route   GET /dashboard/:agentKey
 * @desc    Get agent dashboard page
 * @access  Public
 */
router.get('/:agentKey', async (req, res) => {
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

/**
 * @route   POST /dashboard/:agentKey/save
 * @desc    Save agent pipeline data
 * @access  Public
 */
router.post('/:agentKey/save', async (req, res) => {
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

module.exports = router;
