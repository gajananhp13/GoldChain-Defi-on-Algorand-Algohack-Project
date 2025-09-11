import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface PriceData {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

interface PriceContextType {
  prices: PriceData;
  loading: boolean;
  error: string | null;
  refreshPrices: () => Promise<void>;
  lastUpdated: Date | null;
}

const PriceContext = createContext<PriceContextType>({
  prices: {},
  loading: false,
  error: null,
  refreshPrices: async () => {},
  lastUpdated: null,
});

export const usePrice = () => useContext(PriceContext);

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<PriceData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Coins to track
  const coins = ['algorand', 'ethereum', 'bitcoin'];

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_24hr_change=true`
      );
      
      setPrices(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching prices:', err);
      setError(err.message || 'Failed to fetch cryptocurrency prices');
      
      // If API fails, set some mock data so the app can still function
      setPrices({
        'algorand': { usd: 0.20, usd_24h_change: 1.5 },
        'ethereum': { usd: 3200, usd_24h_change: 1.2 },
        'bitcoin': { usd: 65000, usd_24h_change: 0.75 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchPrices();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshPrices = async () => {
    await fetchPrices();
  };

  return (
    <PriceContext.Provider
      value={{
        prices,
        loading,
        error,
        refreshPrices,
        lastUpdated
      }}
    >
      {children}
    </PriceContext.Provider>
  );
};

export default PriceProvider; 