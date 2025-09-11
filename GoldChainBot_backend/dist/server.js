"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const body_parser_1 = __importDefault(require("body-parser"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use((0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
}));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.post('/telegram/webhook', (_req, res) => {
    // Telegraf webhook will be wired here later
    res.sendStatus(200);
});
app.listen(Number(env_1.env.PORT), () => {
    logger_1.logger.info(`Server listening on :${env_1.env.PORT}`);
});
//# sourceMappingURL=server.js.map