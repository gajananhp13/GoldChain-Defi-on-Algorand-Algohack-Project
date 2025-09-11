"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const isProd = process.env.NODE_ENV === 'production';
exports.logger = isProd
    ? (0, pino_1.default)({ level: 'info' })
    : (0, pino_1.default)({
        level: 'debug',
        // Casting to any to accommodate pino transport typing with exactOptionalPropertyTypes enabled
        transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:standard' },
        },
    });
//# sourceMappingURL=logger.js.map