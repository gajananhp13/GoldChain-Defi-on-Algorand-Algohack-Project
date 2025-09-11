"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peraService = exports.PeraService = void 0;
const connect_1 = require("@perawallet/connect");
class PeraService {
    constructor() {
        this.pera = new connect_1.PeraWalletConnect();
    }
    // Placeholder: In-telegram deep linking requires an external page to complete pairing
    getConnectUrl() {
        return 'https://perawallet.app/connect';
    }
}
exports.PeraService = PeraService;
exports.peraService = new PeraService();
//# sourceMappingURL=pera.js.map