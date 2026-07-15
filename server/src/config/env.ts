import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  DB_HOST: z.string(),
  DB_PORT: z.string().default('3306'),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_POOL_SIZE: z.string().default('10'),
  
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.string().default('24h'),
  
  LETSFG_API_KEY: z.string().optional(),
  LETSFG_BASE_URL: z.string().default('https://letsfg.co/developers/api/v1'),
  LETSFG_TIMEOUT: z.string().default('30000'),
  
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
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
