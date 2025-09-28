import { Telegraf } from 'telegraf';
import { getPortfolio } from '../storage/db';

export default function history(bot: Telegraf) {
  bot.command('history', async (ctx) => {
    const pf = getPortfolio(String(ctx.from?.id));
    if (pf.transactions.length === 0) {
      await ctx.reply('No transactions yet.');
      return;
    }

    const last = pf.transactions.slice(0, 10);
    const lines = last.map((t) => {
      const amo = t.amount.toFixed(4);
      const algo = t.algoAmount != null ? ` (${t.algoAmount.toFixed(4)} ALGO)` : '';
      const d = new Date(t.timestamp).toLocaleString();
      return `${t.type.toUpperCase()} ${amo}${algo} — ${d}`;
    });

    await ctx.reply(['Recent transactions:', ...lines].join('\n'));
  });
}


