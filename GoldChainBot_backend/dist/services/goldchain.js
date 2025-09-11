"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.goldChainApi = exports.GoldChainApi = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
class GoldChainApi {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: env_1.env.GOLDCHAIN_API_BASE || 'https://api.example.com',
            headers: env_1.env.GOLDCHAIN_API_KEY ? { 'x-api-key': env_1.env.GOLDCHAIN_API_KEY } : {},
            timeout: 10_000,
        });
    }
    async getPrice() {
        // Fallback default
        try {
            const { data } = await this.client.get('/price/vgold');
            return data?.price ?? 0.05;
        }
        catch {
            return 0.05;
        }
    }
}
exports.GoldChainApi = GoldChainApi;
exports.goldChainApi = new GoldChainApi();
//# sourceMappingURL=goldchain.js.map