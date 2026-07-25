import app from './app';
import { env } from './config/env';
import sequelize from './config/database';
import logger from './config/logger';
import authService from './services/AuthService';

const port = parseInt(env.PORT || '3000', 10);

// Start HTTP server immediately on 0.0.0.0 so Fly.io / container networking health checks succeed instantly
app.listen(port, '0.0.0.0', () => {
  logger.info(`Server is running on port ${port} bound to 0.0.0.0 in ${env.NODE_ENV} mode.`);
});

// Authenticate database connection and sync models asynchronously
const initDatabase = async () => {
  let connected = false;
  let retries = 5;

  while (retries > 0 && !connected) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully.');
      connected = true;
    } catch (err: any) {
      retries--;
      logger.warn(`Database connection attempt failed: ${err.message}. Retrying in 3s... (${retries} retries left)`);
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  if (connected) {
    try {
      await sequelize.sync();
      logger.info('Database models synchronized.');
      await authService.seedAdminUser();
    } catch (syncError: any) {
      logger.error('Error syncing models or seeding admin user:', syncError);
    }
  } else {
    logger.error('Could not connect to database after 5 attempts. Server running in degraded mode.');
  }
};

initDatabase();
