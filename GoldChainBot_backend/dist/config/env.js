"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const EnvSchema = zod_1.z.object({
    BOT_TOKEN: zod_1.z.string().min(10),
    PORT: zod_1.z.string().default('8080'),
    NODE_ENV: zod_1.z.string().default('development'),
    WEBHOOK_URL: zod_1.z.string().url().optional(),
    GOLDCHAIN_API_BASE: zod_1.z.string().url().optional(),
    GOLDCHAIN_API_KEY: zod_1.z.string().optional(),
    ALGOD_NODE: zod_1.z.string().url().optional(),
    ALGOD_TOKEN: zod_1.z.string().optional(),
    INDEXER_NODE: zod_1.z.string().url().optional(),
    INDEXER_TOKEN: zod_1.z.string().optional(),
});
exports.env = EnvSchema.parse(process.env);
//# sourceMappingURL=env.js.map