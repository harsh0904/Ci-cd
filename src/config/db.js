const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info('✅ MongoDB connected');
      return;
    } catch (err) {
      retries++;
      logger.warn(`MongoDB connection attempt ${retries}/${maxRetries} failed: ${err.message}`);
      if (retries === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

module.exports = connectDB;
