# GoldChain � Tokenized Gold DeFi on Algorand

A fullstack project that lets users buy tokenized gold, lend/borrow against their holdings, and manage a noncustodial portfolio using the Pera Wallet on the Algorand blockchain.

##  Functionality Overview
- Noncustodial wallet connect (Pera Wallet) and account session management
- Buy/sell tokenized gold assets; view live reference prices
- Lend/borrow flows with collateralization against tokenized gold
- Portfolio management (balances, positions) and transaction history
- Dashboard with quick actions and key portfolio metrics

##  Core Features
- **Wallet & Accounts**: Connect/disconnect via Pera Wallet; read account, balances
- **Trading**: Initiate buy/sell flows of the gold token; clientside validations
- **Lending & Borrowing**: Open/close lend/borrow positions; simple health checks
- **Portfolio & History**: Portfolio view, transaction list, and highlevel analytics
- **Rate Limiting & Validation**: Backend Amiddleware to protect APIs and validate payloads
- **Logging**: Structured request/error logging

##  Tech Stack
- **Frontend**: React + TypeScript, Vite/CRA structure, Context API for state, custom theming
- **Wallet**: Pera Wallet SDK (Algorand)
- **Backend**: Node.js + TypeScript (Expressstyle server)
- **Blockchain**: Algorand SDK integrations
- **Infra/Deploy**: Vercel (frontend); Node server (backend)

Repo structure:
- Goldchain/ � React app (UI, contexts, pages, theming)
- GoldChainBot_backend/ � TypeScript backend (services, middlewares, APIs)

##  Frontend (Goldchain)
Key paths:
- src/pages/ � Home, Dashboard, Buy, Lend, Borrow, Portfolio, Transactions, Login, Register
- src/context/ � WalletContext, PriceContext, LanguageContext, GoldContext
- src/components/ � Header, Navbar, Footer

Run locally:
`ash
cd Goldchain
npm install
npm start
`

Env (optional):
`
# Gold/token price source etc.
REACT_APP_PRICE_API_URL=
REACT_APP_BACKEND_URL=http://localhost:4000
`

##  Backend (GoldChainBot_backend)
Key modules:
- services/algorand.ts � Algorand client ops
- services/pera.ts � Pera wallet helpers
- services/goldchain.ts � domain ops for trades/lend/borrow
- middlewares/rateLimit.ts � API rate limiting
- utils/validators.ts � input validation
- docs/apis.md � API surface
- docs/webhook.md � webhook notes

Run locally:
`ash
cd GoldChainBot_backend
npm install
npm run build
npm start
`

Env example (.env):
`
PORT=4000
ALGOD_TOKEN=
ALGOD_SERVER=
ALGOD_PORT=
PERA_ENV=mainnet   # or testnet
PRICE_FEED_URL=
`

##  Security Notes
- Keep private keys in wallet (noncustodial); never store secrets in the repo
- Validate all inputs serverside; ratelimit sensitive endpoints
- Use .env files locally and secrets in your host for deploy

##  Deployment
- Frontend: Vercel or any static host
- Backend: Node host (Render/Fly/Heroku/VPS). Build with 
pm run build and run 
ode dist/index.js

##  Roadmap
- Advanced liquidation/health factor for borrow positions
- Onchain price oracles and stronger price integrity
- Notifications and position automation
- Ledger/Hardware wallet support

##  Pitch (1pager)
- **Problem**: Gold is a trusted store of value but lacks DeFi composability and 24/7 programmable access
- **Solution**: Tokenize gold on Algorand with instant settlement, enabling buy/sell, borrow against holdings, and yield via lending�all noncustodially
- **Why Now**: Maturing wallets (Pera), cheap/final Algorand settlement, and growing DeFi demand for realworld assets
- **Differentiation**: Low fees (Algorand), simple UX, noncustodial by default, and modular services for rapid iteration
- **GotoMarket**: Cryptonative users, integrations with Algorand ecosystem partners, referralbased growth
- **Business Model**: Spread/fees on trades and borrow, optional premium features for analytics/alerts
- **Vision**: Become the default noncustodial gold account with programmable liquidity

##  Development Tips
- Avoid committing 
ode_modules and builds; use .gitignore as configured
- Use testnet for development
- Keep backend docs in GoldChainBot_backend/docs/

---
Maintainers: @gajananhp13
