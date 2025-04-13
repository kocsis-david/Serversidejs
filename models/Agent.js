const Agent = require('./AgentSchema');

// Model methods
async function getAllAgents() {
  try {
    const agents = await Agent.find({});
    // Convert array of documents to object with key as the index
    return agents.reduce((acc, agent) => {
      acc[agent.key] = {
        name: agent.name,
        type: agent.type,
        priority: agent.priority,
        deadline: agent.deadline,
        progress: agent.progress,
        documentation: agent.documentation,
        pipeline: agent.pipeline || {}
      };
      return acc;
    }, {});
  } catch (error) {
    console.error('Error getting all agents:', error);
    return {};
  }
}

async function getAgentByKey(key) {
  try {
    const agent = await Agent.findOne({ key });
    if (!agent) return null;

    return {
      name: agent.name,
      type: agent.type,
      priority: agent.priority,
      deadline: agent.deadline,
      progress: agent.progress,
      documentation: agent.documentation,
      pipeline: agent.pipeline || {}
    };
  } catch (error) {
    console.error(`Error getting agent with key ${key}:`, error);
    return null;
  }
}

async function createAgent(key, data) {
  try {
    const newAgent = new Agent({
      key,
      ...data
    });
    await newAgent.save();
    return true;
  } catch (error) {
    console.error(`Error creating agent with key ${key}:`, error);
    return false;
  }
}

async function updateAgent(key, data) {
  try {
    const result = await Agent.findOneAndUpdate(
      { key },
      { $set: data },
      { new: true }
    );
    return !!result;
  } catch (error) {
    console.error(`Error updating agent with key ${key}:`, error);
    return false;
  }
}

async function deleteAgent(key) {
  try {
    const result = await Agent.findOneAndDelete({ key });
    return !!result;
  } catch (error) {
    console.error(`Error deleting agent with key ${key}:`, error);
    return false;
  }
}

async function savePipeline(key, pipeline) {
  try {
    const result = await Agent.findOneAndUpdate(
      { key },
      { $set: { pipeline } },
      { new: true }
    );
    return !!result;
  } catch (error) {
    console.error(`Error saving pipeline for agent with key ${key}:`, error);
    return false;
  }
}

module.exports = {
  getAllAgents,
  getAgentByKey,
  createAgent,
  updateAgent,
  deleteAgent,
  savePipeline
};
