import app from './app';
import { env } from './config/env';
import sequelize from './config/database';
import logger from './config/logger';
import authService from './services/AuthService';

// Test DB Connection and sync models
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync models (in production, prefer migrations)
    if (env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized with alter: true.');
    }

    // Seed admin user (username: Daniel, password: Daniel123)
    await authService.seedAdminUser();
  } catch (error) {
    logger.error('Unable to connect to the database, starting in fallback mode:', error);
  }

  const port = env.PORT || 5000;
  app.listen(port, () => {
    logger.info(`Server is running on port ${port} in ${env.NODE_ENV} mode.`);
  });
};

startServer();
