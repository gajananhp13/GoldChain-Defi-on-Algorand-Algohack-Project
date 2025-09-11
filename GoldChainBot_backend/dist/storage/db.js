"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = exports.upsertSession = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const storePath = path_1.default.join(process.cwd(), 'sessions.json');
function readStore() {
    try {
        const raw = fs_1.default.readFileSync(storePath, 'utf8');
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function writeStore(data) {
    fs_1.default.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf8');
}
const upsertSession = (telegramId, address, walletType) => {
    const data = readStore();
    data[telegramId] = {
        telegram_id: telegramId,
        wallet_address: address,
        wallet_type: walletType,
        created_at: data[telegramId]?.created_at || Math.floor(Date.now() / 1000),
    };
    writeStore(data);
};
exports.upsertSession = upsertSession;
const getSession = (telegramId) => {
    const data = readStore();
    return data[telegramId];
};
exports.getSession = getSession;
//# sourceMappingURL=db.js.map