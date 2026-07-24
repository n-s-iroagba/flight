"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DB_HOST: zod_1.z.string(),
    DB_PORT: zod_1.z.string().default('3306'),
    DB_USER: zod_1.z.string(),
    DB_PASSWORD: zod_1.z.string(),
    DB_NAME: zod_1.z.string(),
    DB_POOL_SIZE: zod_1.z.string().default('10'),
    JWT_SECRET: zod_1.z.string(),
    JWT_EXPIRATION: zod_1.z.string().default('24h'),
    LETSFG_API_KEY: zod_1.z.string().optional(),
    LETSFG_BASE_URL: zod_1.z.string().default('https://letsfg.co/developers/api/v1'),
    LETSFG_TIMEOUT: zod_1.z.string().default('30000'),
    WHATSAPP_BUSINESS_NUMBER: zod_1.z.string().optional(),
    WHATSAPP_API_URL: zod_1.z.string().default('https://api.whatsapp.com/send'),
    CACHE_TTL_SEARCH: zod_1.z.string().default('300'),
    CACHE_TTL_FLIGHTS: zod_1.z.string().default('3600'),
    RATE_LIMIT_WINDOW: zod_1.z.string().default('60000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().default('100'),
    LOG_LEVEL: zod_1.z.string().default('info'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    throw new Error('Invalid environment variables');
}
exports.env = _env.data;
