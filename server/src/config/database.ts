import { Sequelize } from 'sequelize';
import { env } from './env';
import logger from './logger';

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
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

export default sequelize;
