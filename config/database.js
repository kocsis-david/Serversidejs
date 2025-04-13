const mongoose = require('mongoose');

// Database connection function
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/agentDesigner', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
