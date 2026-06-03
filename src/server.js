require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 Task Manager API running on port ${PORT}`);
    logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔖 Version: ${process.env.APP_VERSION || '1.0.0'}`);
  });
}).catch((err) => {
  logger.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

module.exports = app;
