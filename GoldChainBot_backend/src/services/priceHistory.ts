/**
 * Price History Service
 * Handles price data storage, retrieval, and analytics
 */

import fs from 'fs';
import path from 'path';

export interface PriceData {
  timestamp: number;
  price: number;
  volume24h?: number;
  marketCap?: number;
}

export interface PriceHistoryRecord {
  symbol: string;
  prices: PriceData[];
  lastUpdated: number;
}

export interface PriceAnalytics {
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  priceChange7d: number;
  priceChangePercent7d: number;
  priceChange30d: number;
  priceChangePercent30d: number;
  averagePrice7d: number;
  averagePrice30d: number;
  volatility7d: number;
  volatility30d: number;
  supportLevel: number;
  resistanceLevel: number;
}

export interface PortfolioAnalytics {
  totalValue: number;
  totalValueChange24h: number;
  totalValueChangePercent24h: number;
  totalValueChange7d: number;
  totalValueChangePercent7d: number;
  totalValueChange30d: number;
  totalValueChangePercent30d: number;
  bestPerformingAsset: string;
  worstPerformingAsset: string;
  diversificationScore: number;
  riskScore: number;
  sharpeRatio: number;
}

const priceHistoryPath = path.join(process.cwd(), 'price_history.json');

function readPriceHistory(): Record<string, PriceHistoryRecord> {
  try {
    const raw = fs.readFileSync(priceHistoryPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writePriceHistory(data: Record<string, PriceHistoryRecord>) {
  fs.writeFileSync(priceHistoryPath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Store price data for a symbol
 */
export function storePriceData(symbol: string, priceData: PriceData): void {
  const history = readPriceHistory();
  
  if (!history[symbol]) {
    history[symbol] = {
      symbol,
      prices: [],
      lastUpdated: Date.now(),
    };
  }
  
  // Add new price data
  history[symbol].prices.push(priceData);
  history[symbol].lastUpdated = Date.now();
  
  // Keep only last 1000 data points to prevent file from growing too large
  if (history[symbol].prices.length > 1000) {
    history[symbol].prices = history[symbol].prices.slice(-1000);
  }
  
  writePriceHistory(history);
}

/**
 * Get price history for a symbol
 */
export function getPriceHistory(symbol: string, days: number = 30): PriceData[] {
  const history = readPriceHistory();
  const symbolHistory = history[symbol];
  
  if (!symbolHistory) {
    return [];
  }
  
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  return symbolHistory.prices.filter(price => price.timestamp >= cutoffTime);
}

/**
 * Get latest price for a symbol
 */
export function getLatestPrice(symbol: string): number | null {
  const history = readPriceHistory();
  const symbolHistory = history[symbol];
  
  if (!symbolHistory || symbolHistory.prices.length === 0) {
    return null;
  }
  
  return symbolHistory.prices[symbolHistory.prices.length - 1].price;
}

/**
 * Calculate price analytics for a symbol
 */
export function calculatePriceAnalytics(symbol: string): PriceAnalytics | null {
  const prices = getPriceHistory(symbol, 30);
  
  if (prices.length < 2) {
    return null;
  }
  
  const currentPrice = prices[prices.length - 1].price;
  const price24hAgo = prices.find(p => p.timestamp <= Date.now() - (24 * 60 * 60 * 1000))?.price || currentPrice;
  const price7dAgo = prices.find(p => p.timestamp <= Date.now() - (7 * 24 * 60 * 60 * 1000))?.price || currentPrice;
  const price30dAgo = prices.find(p => p.timestamp <= Date.now() - (30 * 24 * 60 * 60 * 1000))?.price || currentPrice;
  
  const priceChange24h = currentPrice - price24hAgo;
  const priceChangePercent24h = (priceChange24h / price24hAgo) * 100;
  
  const priceChange7d = currentPrice - price7dAgo;
  const priceChangePercent7d = (priceChange7d / price7dAgo) * 100;
  
  const priceChange30d = currentPrice - price30dAgo;
  const priceChangePercent30d = (priceChange30d / price30dAgo) * 100;
  
  // Calculate averages
  const prices7d = prices.filter(p => p.timestamp >= Date.now() - (7 * 24 * 60 * 60 * 1000));
  const prices30d = prices.filter(p => p.timestamp >= Date.now() - (30 * 24 * 60 * 60 * 1000));
  
  const averagePrice7d = prices7d.reduce((sum, p) => sum + p.price, 0) / prices7d.length;
  const averagePrice30d = prices30d.reduce((sum, p) => sum + p.price, 0) / prices30d.length;
  
  // Calculate volatility (standard deviation)
  const volatility7d = Math.sqrt(
    prices7d.reduce((sum, p) => sum + Math.pow(p.price - averagePrice7d, 2), 0) / prices7d.length
  );
  const volatility30d = Math.sqrt(
    prices30d.reduce((sum, p) => sum + Math.pow(p.price - averagePrice30d, 2), 0) / prices30d.length
  );
  
  // Calculate support and resistance levels
  const allPrices = prices.map(p => p.price);
  const supportLevel = Math.min(...allPrices);
  const resistanceLevel = Math.max(...allPrices);
  
  return {
    currentPrice,
    priceChange24h,
    priceChangePercent24h,
    priceChange7d,
    priceChangePercent7d,
    priceChange30d,
    priceChangePercent30d,
    averagePrice7d,
    averagePrice30d,
    volatility7d,
    volatility30d,
    supportLevel,
    resistanceLevel,
  };
}

/**
 * Calculate portfolio analytics
 */
export function calculatePortfolioAnalytics(
  portfolio: { symbol: string; amount: number }[],
  currentPrices: Record<string, number>
): PortfolioAnalytics | null {
  if (portfolio.length === 0) {
    return null;
  }
  
  // Calculate current total value
  const totalValue = portfolio.reduce((sum, asset) => {
    const price = currentPrices[asset.symbol] || 0;
    return sum + (asset.amount * price);
  }, 0);
  
  // Calculate historical values (simplified - would need historical portfolio data)
  const totalValue24hAgo = totalValue * 0.98; // Mock 2% change
  const totalValue7dAgo = totalValue * 0.95; // Mock 5% change
  const totalValue30dAgo = totalValue * 0.90; // Mock 10% change
  
  const totalValueChange24h = totalValue - totalValue24hAgo;
  const totalValueChangePercent24h = (totalValueChange24h / totalValue24hAgo) * 100;
  
  const totalValueChange7d = totalValue - totalValue7dAgo;
  const totalValueChangePercent7d = (totalValueChange7d / totalValue7dAgo) * 100;
  
  const totalValueChange30d = totalValue - totalValue30dAgo;
  const totalValueChangePercent30d = (totalValueChange30d / totalValue30dAgo) * 100;
  
  // Calculate asset performance
  const assetPerformance = portfolio.map(asset => {
    const price = currentPrices[asset.symbol] || 0;
    const value = asset.amount * price;
    const change24h = value * 0.02; // Mock change
    return {
      symbol: asset.symbol,
      value,
      change24h,
      changePercent24h: (change24h / value) * 100,
    };
  });
  
  const bestPerformingAsset = assetPerformance.reduce((best, current) => 
    current.changePercent24h > best.changePercent24h ? current : best
  ).symbol;
  
  const worstPerformingAsset = assetPerformance.reduce((worst, current) => 
    current.changePercent24h < worst.changePercent24h ? current : worst
  ).symbol;
  
  // Calculate diversification score (simplified)
  const diversificationScore = Math.min(100, portfolio.length * 20);
  
  // Calculate risk score (simplified)
  const riskScore = Math.min(100, portfolio.length * 15);
  
  // Calculate Sharpe ratio (simplified)
  const sharpeRatio = totalValueChangePercent30d / 10; // Mock calculation
  
  return {
    totalValue,
    totalValueChange24h,
    totalValueChangePercent24h,
    totalValueChange7d,
    totalValueChangePercent7d,
    totalValueChange30d,
    totalValueChangePercent30d,
    bestPerformingAsset,
    worstPerformingAsset,
    diversificationScore,
    riskScore,
    sharpeRatio,
  };
}

/**
 * Get price chart data for frontend
 */
export function getPriceChartData(symbol: string, days: number = 7): Array<{ timestamp: number; price: number }> {
  const prices = getPriceHistory(symbol, days);
  return prices.map(p => ({
    timestamp: p.timestamp,
    price: p.price,
  }));
}

/**
 * Simulate price updates (for development)
 */
export function simulatePriceUpdate(symbol: string): void {
  const currentPrice = getLatestPrice(symbol) || 1.0;
  const change = (Math.random() - 0.5) * 0.1; // ±5% change
  const newPrice = Math.max(0.01, currentPrice + (currentPrice * change));
  
  storePriceData(symbol, {
    timestamp: Date.now(),
    price: newPrice,
    volume24h: Math.random() * 1000000,
    marketCap: newPrice * 10000000,
  });
}
