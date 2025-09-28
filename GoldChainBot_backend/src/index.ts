import { Telegraf, Markup } from 'telegraf';
import { env } from './config/env';
import { logger } from './utils/logger';
import { registerCommands } from './commands';
import { registerWebhook } from './server';

async function bootstrap() {
  if (!env.BOT_TOKEN) {
    logger.error('BOT_TOKEN missing');
    process.exit(1);
  }

  const bot = new Telegraf(env.BOT_TOKEN);

  registerCommands(bot);

  if (env.WEBHOOK_URL) {
    await bot.telegram.setWebhook(`${env.WEBHOOK_URL}/telegram/webhook`);
    registerWebhook(bot);
    logger.info('Webhook set');
  } else {
    await bot.launch();
    logger.info('Bot launched with long polling');
  }

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to bootstrap bot');
  process.exit(1);
});


