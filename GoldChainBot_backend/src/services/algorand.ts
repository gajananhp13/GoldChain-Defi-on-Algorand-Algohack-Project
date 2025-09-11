import algosdk, { Algodv2, Indexer } from 'algosdk';
import { env } from '../config/env';

export class AlgorandService {
  public algod: Algodv2;
  public indexer?: Indexer;

  constructor() {
    this.algod = new algosdk.Algodv2(
      env.ALGOD_TOKEN || '',
      env.ALGOD_NODE || 'https://testnet-api.algonode.cloud',
      ''
    );

    if (env.INDEXER_NODE) {
      this.indexer = new algosdk.Indexer(env.INDEXER_TOKEN || '', env.INDEXER_NODE, '');
    }
  }

  async getAccountBalance(address: string): Promise<number> {
    const res = await this.algod.accountInformation(address).do();
    const microAlgos = res.amount as unknown as number; // SDK returns number | bigint in types
    return Number(microAlgos) / 1_000_000;
  }

  async getSuggestedParams() {
    return await this.algod.getTransactionParams().do();
  }
}

export const algorandService = new AlgorandService();


