import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/telegram/webhook', (_req, res) => {
  // Telegraf webhook will be wired here later
  res.sendStatus(200);
});

export function registerWebhook(bot: any) {
  // Remove any previously attached handler to avoid duplicate bindings in dev
  // Note: In typical Express usage, you'd conditionally set this before listen.
  app.post('/telegram/webhook', bot.webhookCallback('/telegram/webhook'));
}

app.listen(Number(env.PORT), () => {
  logger.info(`Server listening on :${env.PORT}`);
});


