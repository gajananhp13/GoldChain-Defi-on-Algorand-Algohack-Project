import { Telegraf, Markup } from 'telegraf';

export default function wallet(bot: Telegraf) {
  bot.command('connectwallet', async (ctx) => {
    await ctx.reply(
      'To connect your Pera Wallet, tap the button below to open Pera Connect.',
      Markup.inlineKeyboard([
        [Markup.button.url('Connect Pera Wallet', 'https://perawallet.app/connect')],
      ])
    );
  });
}


