import { Telegraf } from 'telegraf';

export default function history(bot: Telegraf) {
  bot.command('history', async (ctx) => {
    await ctx.reply('No transactions yet. History feature coming soon.');
  });
}


