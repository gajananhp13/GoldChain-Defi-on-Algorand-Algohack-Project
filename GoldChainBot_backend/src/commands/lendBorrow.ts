import { Telegraf } from 'telegraf';

export default function lendBorrow(bot: Telegraf) {
  bot.command('lend', async (ctx) => {
    await ctx.reply('Lending flow coming soon. Use /lend 100 90d');
  });

  bot.command('borrow', async (ctx) => {
    await ctx.reply('Borrowing flow coming soon. Use /borrow 50 150% collateral');
  });
}


