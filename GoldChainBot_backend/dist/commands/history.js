"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = history;
function history(bot) {
    bot.command('history', async (ctx) => {
        await ctx.reply('No transactions yet. History feature coming soon.');
    });
}
//# sourceMappingURL=history.js.map