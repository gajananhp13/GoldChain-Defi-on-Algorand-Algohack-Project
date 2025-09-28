import { Telegraf } from 'telegraf';
import { addBorrowPosition, addLendPosition, getPortfolio, recordTransaction, repayBorrowPosition, updatePortfolio } from '../storage/db';

const LENDING_TERMS: Record<number, number> = {
  30: 0.04,
  60: 0.055,
  90: 0.07,
};

const BORROWING_TERMS: Record<number, number> = {
  30: 0.06,
  60: 0.075,
  90: 0.09,
};

const COLLATERAL_RATIO = 1.5; // 150% of vGold value (in ALGO units at 1 vGold = 1 unit basis)

export default function lendBorrow(bot: Telegraf) {
  bot.command('lend', async (ctx) => {
    try {
      const text = ctx.message?.text || '';
      const parts = text.trim().split(/\s+/);
      const amount = Number(parts[1]);
      const days = Number((parts[2] || '').replace(/[^0-9]/g, '')) || 30;
      const interest = LENDING_TERMS[days as 30 | 60 | 90] ?? 0.04;
      if (!amount || amount <= 0) {
        await ctx.reply('Usage: /lend <vGoldAmount> <days: 30|60|90>');
        return;
      }

      updatePortfolio(String(ctx.from?.id), (pf) => {
        if (pf.vGoldBalance < amount) {
          throw new Error(`Insufficient vGold. Have ${pf.vGoldBalance.toFixed(4)} vGold.`);
        }
        pf.vGoldBalance -= amount;
      });

      const pos = addLendPosition(String(ctx.from?.id), {
        amount,
        endDate: Date.now() + days * 24 * 60 * 60 * 1000,
        interest,
      });

      recordTransaction(String(ctx.from?.id), {
        type: 'lend',
        amount,
        note: `Lend ${amount} vGold for ${days}d`,
      });

      await ctx.reply(
        `Lent ${amount.toFixed(4)} vGold for ${days} days at ${(interest * 100).toFixed(2)}%.\nPosition ID: ${pos.id}`
      );
    } catch (err: any) {
      await ctx.reply(`Lend failed: ${err.message || 'unknown error'}`);
    }
  });

  bot.command('borrow', async (ctx) => {
    try {
      const text = ctx.message?.text || '';
      const parts = text.trim().split(/\s+/);
      const amount = Number(parts[1]);
      const days = Number((parts[2] || '').replace(/[^0-9]/g, '')) || 30;
      const interest = BORROWING_TERMS[days as 30 | 60 | 90] ?? 0.06;
      if (!amount || amount <= 0) {
        await ctx.reply('Usage: /borrow <vGoldAmount> <days: 30|60|90>');
        return;
      }

      const collateral = amount * COLLATERAL_RATIO;

      updatePortfolio(String(ctx.from?.id), (pf) => {
        if (pf.algoBalance < collateral) {
          throw new Error(`Insufficient ALGO for collateral. Need ${collateral.toFixed(4)} ALGO.`);
        }
        pf.algoBalance -= collateral;
        pf.vGoldBalance += amount;
      });

      const pos = addBorrowPosition(String(ctx.from?.id), {
        amount,
        collateral,
        endDate: Date.now() + days * 24 * 60 * 60 * 1000,
        interest,
      });

      recordTransaction(String(ctx.from?.id), {
        type: 'borrow',
        amount,
        note: `Borrow ${amount} vGold for ${days}d`,
      });

      await ctx.reply(
        `Borrowed ${amount.toFixed(4)} vGold with ${collateral.toFixed(4)} ALGO collateral for ${days} days.
Loan ID: ${pos.id}`
      );
    } catch (err: any) {
      await ctx.reply(`Borrow failed: ${err.message || 'unknown error'}`);
    }
  });

  bot.command('repay', async (ctx) => {
    try {
      const text = ctx.message?.text || '';
      const parts = text.trim().split(/\s+/);
      const id = parts[1];
      if (!id) {
        await ctx.reply('Usage: /repay <loanId>');
        return;
      }

      const pf = getPortfolio(String(ctx.from?.id));
      const loan = pf.borrowPositions.find((p) => p.id === id && p.status === 'active');
      if (!loan) {
        await ctx.reply('Active loan not found for given ID.');
        return;
      }

      // Simple flat interest repayment based on configured interest and full term
      const days = Math.round((loan.endDate - loan.startDate) / (24 * 60 * 60 * 1000));
      const repayment = loan.amount * (1 + loan.interest);

      updatePortfolio(String(ctx.from?.id), (portfolio) => {
        if (portfolio.vGoldBalance < repayment) {
          throw new Error(`Insufficient vGold to repay. Need ${repayment.toFixed(4)} vGold.`);
        }
        portfolio.vGoldBalance -= repayment;
        portfolio.algoBalance += loan.collateral; // return collateral
      });

      repayBorrowPosition(String(ctx.from?.id), id);
      recordTransaction(String(ctx.from?.id), {
        type: 'repay',
        amount: repayment,
        note: `Repay loan ${id}`,
      });

      const updated = getPortfolio(String(ctx.from?.id));
      await ctx.reply(
        `Loan repaid. Returned collateral ${loan.collateral.toFixed(4)} ALGO.\nBalances → ALGO: ${updated.algoBalance.toFixed(4)}, vGold: ${updated.vGoldBalance.toFixed(4)}`
      );
    } catch (err: any) {
      await ctx.reply(`Repay failed: ${err.message || 'unknown error'}`);
    }
  });
}


