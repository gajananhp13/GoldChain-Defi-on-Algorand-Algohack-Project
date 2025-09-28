import { Telegraf } from 'telegraf';
import { getPortfolio, recordTransaction, updatePortfolio } from '../storage/db';
import { goldChainApi } from '../services/goldchain';

const VGOLD_PRICE_ALGO_DEFAULT = 0.05;

export default function trade(bot: Telegraf) {
  bot.command('balance', async (ctx) => {
    const pf = getPortfolio(String(ctx.from?.id));
    await ctx.reply(
      `Your balances:\nALGO: ${pf.algoBalance.toFixed(4)}, vGold: ${pf.vGoldBalance.toFixed(4)}`
    );
  });

  bot.command('buy', async (ctx) => {
    try {
      const text = ctx.message?.text || '';
      const parts = text.trim().split(/\s+/);
      const amount = Number(parts[1]);
      if (!amount || amount <= 0) {
        await ctx.reply('Usage: /buy <vGoldAmount>');
        return;
      }

      const price = await goldChainApi.getPrice().catch(() => VGOLD_PRICE_ALGO_DEFAULT);
      const algoCost = amount * (price || VGOLD_PRICE_ALGO_DEFAULT);

      let updated = updatePortfolio(String(ctx.from?.id), (pf) => {
        if (pf.algoBalance < algoCost) {
          throw new Error(`Insufficient ALGO. Need ${algoCost.toFixed(4)} ALGO.`);
        }
        pf.algoBalance -= algoCost;
        pf.vGoldBalance += amount;
      });

      recordTransaction(String(ctx.from?.id), {
        type: 'buy',
        amount,
        algoAmount: algoCost,
        note: 'Buy vGold',
      });

      await ctx.reply(
        `Bought ${amount.toFixed(4)} vGold for ${algoCost.toFixed(4)} ALGO.\nNew balances → ALGO: ${updated.algoBalance.toFixed(4)}, vGold: ${updated.vGoldBalance.toFixed(4)}`
      );
    } catch (err: any) {
      await ctx.reply(`Buy failed: ${err.message || 'unknown error'}`);
    }
  });

  bot.command('sell', async (ctx) => {
    try {
      const text = ctx.message?.text || '';
      const parts = text.trim().split(/\s+/);
      const amount = Number(parts[1]);
      if (!amount || amount <= 0) {
        await ctx.reply('Usage: /sell <vGoldAmount>');
        return;
      }

      const price = await goldChainApi.getPrice().catch(() => VGOLD_PRICE_ALGO_DEFAULT);
      const algoReceive = amount * (price || VGOLD_PRICE_ALGO_DEFAULT);

      let updated = updatePortfolio(String(ctx.from?.id), (pf) => {
        if (pf.vGoldBalance < amount) {
          throw new Error(`Insufficient vGold. Have ${pf.vGoldBalance.toFixed(4)} vGold.`);
        }
        pf.vGoldBalance -= amount;
        pf.algoBalance += algoReceive;
      });

      recordTransaction(String(ctx.from?.id), {
        type: 'sell',
        amount,
        algoAmount: algoReceive,
        note: 'Sell vGold',
      });

      await ctx.reply(
        `Sold ${amount.toFixed(4)} vGold for ${algoReceive.toFixed(4)} ALGO.\nNew balances → ALGO: ${updated.algoBalance.toFixed(4)}, vGold: ${updated.vGoldBalance.toFixed(4)}`
      );
    } catch (err: any) {
      await ctx.reply(`Sell failed: ${err.message || 'unknown error'}`);
    }
  });
}


