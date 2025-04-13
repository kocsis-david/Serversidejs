const AgentModel = require('../models/Agent');
const { sampleAgents } = require('../data/sampleData');

/**
 * Initialize the database with sample data if it's empty
 */
async function initializeDatabase() {
  try {
    // Check if there are any agents in the database
    const agents = await AgentModel.getAllAgents();
    if (Object.keys(agents).length === 0) {
      console.log('Initializing database with sample agents...');
      
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

module.exports = initializeDatabase;
