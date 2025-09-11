import fs from 'fs';
import path from 'path';

type SessionRecord = {
  telegram_id: string;
  wallet_address?: string;
  wallet_type?: string;
  created_at: number;
};

const storePath = path.join(process.cwd(), 'sessions.json');

function readStore(): Record<string, SessionRecord> {
  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, SessionRecord>) {
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf8');
}

export const upsertSession = (telegramId: string, address: string, walletType: string) => {
  const data = readStore();
  data[telegramId] = {
    telegram_id: telegramId,
    wallet_address: address,
    wallet_type: walletType,
    created_at: data[telegramId]?.created_at || Math.floor(Date.now() / 1000),
  };
  writeStore(data);
};

export const getSession = (telegramId: string) => {
  const data = readStore();
  return data[telegramId];
};


