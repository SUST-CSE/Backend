import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string({
    required_error: 'MONGODB_URI is required',
  }),
  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET is required',
  }),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_SECRET: z.string({
    required_error: 'JWT_REFRESH_SECRET is required',
  }),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CLOUDINARY_CLOUD_NAME: z.string({
    required_error: 'CLOUDINARY_CLOUD_NAME is required',
  }),
  CLOUDINARY_API_KEY: z.string({
    required_error: 'CLOUDINARY_API_KEY is required',
  }),
  CLOUDINARY_API_SECRET: z.string({
    required_error: 'CLOUDINARY_API_SECRET is required',
  }),
  CLIENT_URL: z.string().default('http://localhost:3000'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
