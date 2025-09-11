"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.algorandService = exports.AlgorandService = void 0;
const algosdk_1 = __importDefault(require("algosdk"));
const env_1 = require("../config/env");
class AlgorandService {
    constructor() {
        this.algod = new algosdk_1.default.Algodv2(env_1.env.ALGOD_TOKEN || '', env_1.env.ALGOD_NODE || 'https://testnet-api.algonode.cloud', '');
        if (env_1.env.INDEXER_NODE) {
            this.indexer = new algosdk_1.default.Indexer(env_1.env.INDEXER_TOKEN || '', env_1.env.INDEXER_NODE, '');
        }
    }
    async getAccountBalance(address) {
        const res = await this.algod.accountInformation(address).do();
        const microAlgos = res.amount; // SDK returns number | bigint in types
        return Number(microAlgos) / 1_000_000;
    }
    async getSuggestedParams() {
        return await this.algod.getTransactionParams().do();
    }
}
exports.AlgorandService = AlgorandService;
exports.algorandService = new AlgorandService();
//# sourceMappingURL=algorand.js.map