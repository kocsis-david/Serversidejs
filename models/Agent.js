// In-memory data store for agents
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
    // Add other agents similarly
  };
  
  // Model methods
  function getAllAgents() {
    return agents;
  }
  
  function getAgentByKey(key) {
    return agents[key];
  }
  
  function createAgent(key, data) {
    agents[key] = data;
  }
  
  function updateAgent(key, data) {
    if (!agents[key]) return false;
    
    Object.assign(agents[key], data);
    return true;
  }
  
  function deleteAgent(key) {
    if (!agents[key]) return false;
    
    delete agents[key];
    return true;
  }
  
  function savePipeline(key, pipeline) {
    if (!agents[key]) return false;
    
    agents[key].pipeline = pipeline;
    return true;
  }
  
  module.exports = {
    getAllAgents,
    getAgentByKey,
    createAgent,
    updateAgent,
    deleteAgent,
    savePipeline
  };
  