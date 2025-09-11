## GoldChainBot Backend

Telegram bot for GoldChain DeFi on Algorand. Node.js + TypeScript.

### Setup

1. Create .env from example and set `BOT_TOKEN`:
   - Ask admins for API URLs and keys.
2. Install deps: `npm install`
3. Dev (polling): `npm run dev`
4. Build: `npm run build` then `npm start`

### Commands

- /start, /help
- /connectwallet
- /balance, /buy, /sell
- /lend, /borrow
- /history

### Webhook

Set `WEBHOOK_URL` and expose `/telegram/webhook` over HTTPS.


