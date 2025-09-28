import fs from 'fs';
import path from 'path';

export type SessionRecord = {
  telegram_id: string;
  wallet_address?: string;
  wallet_type?: string;
  created_at: number;
};

export type TransactionType = 'buy' | 'sell' | 'lend' | 'borrow' | 'repay' | 'claim';

export type TransactionRecord = {
  id: string;
  type: TransactionType;
  amount: number;
  algoAmount?: number;
  timestamp: number;
  note?: string;
  status: 'completed' | 'failed';
};

export type LendPosition = {
  id: string;
  amount: number;
  startDate: number;
  endDate: number;
  interest: number; // decimal e.g., 0.07
  status: 'active' | 'completed';
};

export type BorrowPosition = {
  id: string;
  amount: number; // vGold borrowed
  collateral: number; // ALGO locked
  startDate: number;
  endDate: number;
  interest: number; // decimal
  status: 'active' | 'repaid';
};

export type UserPortfolio = {
  telegram_id: string;
  algoBalance: number; // simulated ALGO balance
  vGoldBalance: number; // simulated vGold balance
  transactions: TransactionRecord[];
  lendPositions: LendPosition[];
  borrowPositions: BorrowPosition[];
  portfolioHistory: Array<{
    timestamp: number;
    totalValue: number;
    vGoldValue: number;
    algoValue: number;
  }>;
};

export type StoreShape = {
  sessions: Record<string, SessionRecord>;
  portfolios: Record<string, UserPortfolio>;
};

const storePath = path.join(process.cwd(), 'bot_store.json');

function readStore(): StoreShape {
  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    const parsed = JSON.parse(raw) as StoreShape;
    // Basic shape fallback
    if (!parsed.sessions) parsed.sessions = {} as any;
    if (!parsed.portfolios) parsed.portfolios = {} as any;
    return parsed;
  } catch {
    return { sessions: {}, portfolios: {} };
  }
}

function writeStore(data: StoreShape) {
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf8');
}

export const upsertSession = (telegramId: string, address: string, walletType: string) => {
  const data = readStore();
  data.sessions[telegramId] = {
    telegram_id: telegramId,
    wallet_address: address,
    wallet_type: walletType,
    created_at: data.sessions[telegramId]?.created_at || Math.floor(Date.now() / 1000),
  };
  writeStore(data);
};

export const getSession = (telegramId: string) => {
  const data = readStore();
  return data.sessions[telegramId];
};

function ensurePortfolio(data: StoreShape, telegramId: string): UserPortfolio {
  if (!data.portfolios[telegramId]) {
    data.portfolios[telegramId] = {
      telegram_id: telegramId,
      algoBalance: 100, // start with 100 ALGO simulated
      vGoldBalance: 0,
      transactions: [],
      lendPositions: [],
      borrowPositions: [],
      portfolioHistory: [],
    };
  }
  return data.portfolios[telegramId];
}

export function getPortfolio(telegramId: string): UserPortfolio {
  const data = readStore();
  return ensurePortfolio(data, telegramId);
}

export function recordTransaction(telegramId: string, tx: Omit<TransactionRecord, 'id' | 'timestamp' | 'status'> & { status?: TransactionRecord['status'] }): TransactionRecord {
  const data = readStore();
  const pf = ensurePortfolio(data, telegramId);
  const newTx: TransactionRecord = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    timestamp: Date.now(),
    status: 'completed',
    ...tx,
  };
  pf.transactions.unshift(newTx);
  writeStore(data);
  return newTx;
}

export function updatePortfolio(telegramId: string, updater: (pf: UserPortfolio) => void): UserPortfolio {
  const data = readStore();
  const pf = ensurePortfolio(data, telegramId);
  updater(pf);
  writeStore(data);
  return pf;
}

export function addLendPosition(telegramId: string, pos: Omit<LendPosition, 'id' | 'startDate' | 'status'>): LendPosition {
  const data = readStore();
  const pf = ensurePortfolio(data, telegramId);
  const newPos: LendPosition = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    startDate: Date.now(),
    status: 'active',
    ...pos,
  };
  pf.lendPositions.push(newPos);
  writeStore(data);
  return newPos;
}

export function completeLendPosition(telegramId: string, id: string): LendPosition | undefined {
  const data = readStore();
  const pf = ensurePortfolio(data, telegramId);
  const idx = pf.lendPositions.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  const pos = pf.lendPositions[idx];
  if (!pos) return undefined;
  pf.lendPositions[idx] = { ...pos, status: 'completed' };
  writeStore(data);
  return pf.lendPositions[idx];
}

export function addBorrowPosition(telegramId: string, pos: Omit<BorrowPosition, 'id' | 'startDate' | 'status'>): BorrowPosition {
  const data = readStore();
  const pf = ensurePortfolio(data, telegramId);
  const newPos: BorrowPosition = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    startDate: Date.now(),
    status: 'active',
    ...pos,
  };
  pf.borrowPositions.push(newPos);
  writeStore(data);
  return newPos;
}

export function repayBorrowPosition(telegramId: string, id: string): BorrowPosition | undefined {
  const data = readStore();
  const pf = ensurePortfolio(data, telegramId);
  const idx = pf.borrowPositions.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  const pos = pf.borrowPositions[idx];
  if (!pos) return undefined;
  pf.borrowPositions[idx] = { ...pos, status: 'repaid' };
  writeStore(data);
  return pf.borrowPositions[idx];
}

export function recordPortfolioSnapshot(telegramId: string, vGoldPrice: number): void {
  const data = readStore();
  const pf = ensurePortfolio(data, telegramId);
  
  const snapshot = {
    timestamp: Date.now(),
    totalValue: pf.algoBalance + (pf.vGoldBalance * vGoldPrice),
    vGoldValue: pf.vGoldBalance * vGoldPrice,
    algoValue: pf.algoBalance,
  };
  
  pf.portfolioHistory.push(snapshot);
  
  // Keep only last 100 snapshots to prevent file from growing too large
  if (pf.portfolioHistory.length > 100) {
    pf.portfolioHistory = pf.portfolioHistory.slice(-100);
  }
  
  writeStore(data);
}

export function getPortfolioHistory(telegramId: string, days: number = 30): Array<{
  timestamp: number;
  totalValue: number;
  vGoldValue: number;
  algoValue: number;
}> {
  const data = readStore();
  const pf = ensurePortfolio(data, telegramId);
  
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  return pf.portfolioHistory.filter(snapshot => snapshot.timestamp >= cutoffTime);
}


