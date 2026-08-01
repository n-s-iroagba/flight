import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.string().default('3306'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('flight_db'),
  DB_POOL_SIZE: z.string().default('10'),
  
  JWT_SECRET: z.string().default('swift-wings-super-secret-jwt-key-2026'),
  JWT_EXPIRATION: z.string().default('24h'),
  
  LETSFG_API_KEY: z.string().optional(),
  LETSFG_BASE_URL: z.string().default('https://letsfg.co/developers/api/v1'),
  LETSFG_TIMEOUT: z.string().default('30000'),
  LETSFG_USE_SANDBOX: z.string().default('true'),
  
  WHATSAPP_BUSINESS_NUMBER: z.string().optional(),
  WHATSAPP_API_URL: z.string().default('https://api.whatsapp.com/send'),
  
  CACHE_TTL_SEARCH: z.string().default('300'),
  CACHE_TTL_FLIGHTS: z.string().default('3600'),
  
  RATE_LIMIT_WINDOW: z.string().default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  LOG_LEVEL: z.string().default('info'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.warn('⚠️ Environment variable validation warnings:', _env.error.format());
}

export const env = _env.success ? _env.data : {
  PORT: process.env.PORT || '3000',
  NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: process.env.DB_PORT || '3306',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'flight_db',
  DB_POOL_SIZE: process.env.DB_POOL_SIZE || '10',
  JWT_SECRET: process.env.JWT_SECRET || 'swift-wings-super-secret-jwt-key-2026',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
  LETSFG_API_KEY: process.env.LETSFG_API_KEY,
  LETSFG_BASE_URL: process.env.LETSFG_BASE_URL || 'https://letsfg.co/developers/api/v1',
  LETSFG_TIMEOUT: process.env.LETSFG_TIMEOUT || '30000',
  LETSFG_USE_SANDBOX: process.env.LETSFG_USE_SANDBOX || 'true',
  WHATSAPP_BUSINESS_NUMBER: process.env.WHATSAPP_BUSINESS_NUMBER,
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/send',
  CACHE_TTL_SEARCH: process.env.CACHE_TTL_SEARCH || '300',
  CACHE_TTL_FLIGHTS: process.env.CACHE_TTL_FLIGHTS || '3600',
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || '60000',
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
