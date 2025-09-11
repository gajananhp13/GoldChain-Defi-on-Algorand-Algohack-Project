"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = wallet;
const telegraf_1 = require("telegraf");
function wallet(bot) {
    bot.command('connectwallet', async (ctx) => {
        await ctx.reply('To connect your Pera Wallet, tap the button below to open Pera Connect.', telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.url('Connect Pera Wallet', 'https://perawallet.app/connect')],
        ]));
    });
}
//# sourceMappingURL=wallet.js.map