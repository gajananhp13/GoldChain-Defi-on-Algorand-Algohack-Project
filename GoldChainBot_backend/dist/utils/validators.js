"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amountSchema = void 0;
exports.parseAmount = parseAmount;
const zod_1 = require("zod");
exports.amountSchema = zod_1.z.number().positive();
function parseAmount(input) {
    const value = Number(input);
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error('Invalid amount');
    }
    return value;
}
//# sourceMappingURL=validators.js.map