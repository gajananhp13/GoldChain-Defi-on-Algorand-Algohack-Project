"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = registerCommands;
const help_1 = __importDefault(require("./help"));
const wallet_1 = __importDefault(require("./wallet"));
const trade_1 = __importDefault(require("./trade"));
const lendBorrow_1 = __importDefault(require("./lendBorrow"));
const history_1 = __importDefault(require("./history"));
function registerCommands(bot) {
    (0, help_1.default)(bot);
    (0, wallet_1.default)(bot);
    (0, trade_1.default)(bot);
    (0, lendBorrow_1.default)(bot);
    (0, history_1.default)(bot);
}
//# sourceMappingURL=index.js.map