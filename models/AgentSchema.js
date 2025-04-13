const mongoose = require('mongoose');

// Define the pipeline schema
const pipelineSchema = new mongoose.Schema({
  // Pipeline is a flexible object that can contain any structure
  // We'll store it as a mixed type
}, { strict: false });

// Define the agent schema
const agentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'High'
  },
  deadline: {
    type: String,
    trim: true
  },
  progress: {
    type: String,
    trim: true
  },
  documentation: {
    type: String
  },
  pipeline: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create the Agent model
const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;
