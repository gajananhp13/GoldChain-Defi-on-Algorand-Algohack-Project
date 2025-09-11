import { Algodv2, Indexer } from 'algosdk';
export declare class AlgorandService {
    algod: Algodv2;
    indexer?: Indexer;
    constructor();
    getAccountBalance(address: string): Promise<number>;
    getSuggestedParams(): Promise<import("algosdk/dist/types/client/v2/algod/suggestedParams").SuggestedParamsFromAlgod>;
}
export declare const algorandService: AlgorandService;
//# sourceMappingURL=algorand.d.ts.map