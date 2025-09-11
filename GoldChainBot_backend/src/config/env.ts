import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  BOT_TOKEN: z.string().min(10),
  PORT: z.string().default('8080'),
  NODE_ENV: z.string().default('development'),
  WEBHOOK_URL: z.string().url().optional(),
  GOLDCHAIN_API_BASE: z.string().url().optional(),
  GOLDCHAIN_API_KEY: z.string().optional(),
  ALGOD_NODE: z.string().url().optional(),
  ALGOD_TOKEN: z.string().optional(),
  INDEXER_NODE: z.string().url().optional(),
  INDEXER_TOKEN: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);


