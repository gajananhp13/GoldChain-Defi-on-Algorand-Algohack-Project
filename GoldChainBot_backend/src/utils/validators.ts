import { z } from 'zod';

export const amountSchema = z.number().positive();

export function parseAmount(input?: string) {
  const value = Number(input);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Invalid amount');
  }
  return value;
}


