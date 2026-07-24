"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const env_1 = require("./env");
const logger_1 = __importDefault(require("./logger"));
const sequelize = new sequelize_1.Sequelize(env_1.env.DB_NAME, env_1.env.DB_USER, env_1.env.DB_PASSWORD, {
    host: env_1.env.DB_HOST,
    port: parseInt(env_1.env.DB_PORT, 10),
    dialect: 'mysql',
    logging: (msg) => logger_1.default.debug(msg),
    pool: {
        max: parseInt(env_1.env.DB_POOL_SIZE, 10),
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
exports.default = sequelize;
