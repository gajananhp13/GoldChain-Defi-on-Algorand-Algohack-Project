"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const commands_1 = require("./commands");
async function bootstrap() {
    if (!env_1.env.BOT_TOKEN) {
        logger_1.logger.error('BOT_TOKEN missing');
        process.exit(1);
    }
    const bot = new telegraf_1.Telegraf(env_1.env.BOT_TOKEN);
    (0, commands_1.registerCommands)(bot);
    if (env_1.env.WEBHOOK_URL) {
        await bot.telegram.setWebhook(`${env_1.env.WEBHOOK_URL}/telegram/webhook`);
        logger_1.logger.info('Webhook set');
    }
    else {
        await bot.launch();
        logger_1.logger.info('Bot launched with long polling');
    }
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
bootstrap().catch((err) => {
    logger_1.logger.error({ err }, 'Failed to bootstrap bot');
    process.exit(1);
});
//# sourceMappingURL=index.js.map