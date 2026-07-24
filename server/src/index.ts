import app from './app';
import { env } from './config/env';
import sequelize from './config/database';
import logger from './config/logger';

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

    const port = env.PORT
    app.listen(port, () => {
      logger.info(`Server is running on port ${port} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
