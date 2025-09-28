import { Telegraf, Markup } from 'telegraf';

export default function wallet(bot: Telegraf) {
	bot.command('connectwallet', async (ctx) => {
		await ctx.reply(
			"Install Pera Wallet to connect. Choose your platform or visit the website.",
			Markup.inlineKeyboard([
				[Markup.button.url('Pera Wallet Website', 'https://perawallet.app/download')],
			])
		);
	});
}


