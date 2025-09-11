import axios from 'axios';
import { env } from '../config/env';

export class GoldChainApi {
  private client = axios.create({
    baseURL: env.GOLDCHAIN_API_BASE || 'https://api.example.com',
    headers: env.GOLDCHAIN_API_KEY ? { 'x-api-key': env.GOLDCHAIN_API_KEY } : {},
    timeout: 10_000,
  });

  async getPrice(): Promise<number> {
    // Fallback default
    try {
      const { data } = await this.client.get('/price/vgold');
      return data?.price ?? 0.05;
    } catch {
      return 0.05;
    }
  }
}

export const goldChainApi = new GoldChainApi();


