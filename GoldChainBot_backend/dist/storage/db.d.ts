type SessionRecord = {
    telegram_id: string;
    wallet_address?: string;
    wallet_type?: string;
    created_at: number;
};
export declare const upsertSession: (telegramId: string, address: string, walletType: string) => void;
export declare const getSession: (telegramId: string) => SessionRecord | undefined;
export {};
//# sourceMappingURL=db.d.ts.map