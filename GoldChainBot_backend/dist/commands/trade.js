"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = trade;
function trade(bot) {
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
//# sourceMappingURL=trade.js.map