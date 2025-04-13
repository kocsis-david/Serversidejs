const express = require('express');
const router = express.Router();
const AgentModel = require('../models/Agent');
const { slugify } = require('../utils/helpers');

/**
 * @route   GET /agent/:agentKey
 * @desc    Get agent edit/add page
 * @access  Public
 */
router.get('/:agentKey', async (req, res) => {
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

/**
 * @route   POST /agent/:agentKey/save
 * @desc    Save agent data
 * @access  Public
 */
router.post('/:agentKey/save', async (req, res) => {
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

/**
 * @route   POST /agent/:agentKey/delete
 * @desc    Delete an agent
 * @access  Public
 */
router.post('/:agentKey/delete', async (req, res) => {
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

module.exports = router;
