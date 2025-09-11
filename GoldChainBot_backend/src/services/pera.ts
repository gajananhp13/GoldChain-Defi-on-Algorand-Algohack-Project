import { PeraWalletConnect } from '@perawallet/connect';

export class PeraService {
  private pera: PeraWalletConnect;

  constructor() {
    this.pera = new PeraWalletConnect();
  }

  // Placeholder: In-telegram deep linking requires an external page to complete pairing
  getConnectUrl(): string {
    return 'https://perawallet.app/connect';
  }
}

export const peraService = new PeraService();


