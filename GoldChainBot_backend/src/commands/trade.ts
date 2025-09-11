import { Telegraf } from 'telegraf';

export default function trade(bot: Telegraf) {
  bot.command('balance', async (ctx) => {
    await ctx.reply('Your balances: ALGO: 0.0000, vGold: 0.0000 (stub).');
  });

  bot.command('buy', async (ctx) => {
    await ctx.reply('Buying vGold is coming soon. Send amount like /buy 100');
  });

  bot.command('sell', async (ctx) => {
    await ctx.reply('Selling vGold is coming soon. Send amount like /sell 50');
  });
}


