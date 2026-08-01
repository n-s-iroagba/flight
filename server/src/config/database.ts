import { Sequelize } from 'sequelize';
import { env } from './env';
import logger from './logger';

let sequelize: Sequelize;

if (env.DATABASE_URL || process.env.DATABASE_URL) {
  const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL || '';
  sequelize = new Sequelize(dbUrl, {
    logging: (msg: string) => logger.debug(msg),
    pool: {
      max: parseInt(env.DB_POOL_SIZE || '10', 10),
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT, 10),
    dialect: 'mysql',
    logging: (msg: string) => logger.debug(msg),
    pool: {
      max: parseInt(env.DB_POOL_SIZE, 10),
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

export default sequelize;
