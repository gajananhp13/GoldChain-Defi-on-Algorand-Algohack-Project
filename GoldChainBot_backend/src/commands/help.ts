import { Telegraf } from 'telegraf';

export default function help(bot: Telegraf) {
  bot.start((ctx) => {
    ctx.reply(
      'Welcome to GoldChainBot! Use /help to see commands.'
    );
  });

  bot.help((ctx) => {
    ctx.reply(
      [
        'Available commands:',
        '/start - Start the bot',
        '/help - Show this help',
        '/connectwallet - Connect Pera Wallet',
        '/balance - Show ALGO and vGold balances',
        '/buy - Buy vGold',
        '/sell - Sell vGold',
        '/lend - Start a lending position',
        '/borrow - Open a borrowing position',
        '/history - View transaction history',
      ].join('\n')
    );
  });
}


