import React, { createContext, useState, useEffect, useContext } from 'react';
import { useWallet } from './WalletContext';
import { useToast } from '@chakra-ui/react';

// Define transaction types
export type TransactionType = 'buy' | 'sell' | 'lend' | 'borrow' | 'repay' | 'claim';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  algoAmount?: number;
  duration?: number;
  interest?: number;
  collateral?: number;
  txHash?: string;
}

export interface LendPosition {
  id: string;
  amount: number;
  startDate: number;
  endDate: number;
  interest: number;
  status: 'active' | 'completed';
}

export interface BorrowPosition {
  id: string;
  amount: number;
  collateral: number;
  startDate: number;
  endDate: number;
  interest: number;
  status: 'active' | 'repaid';
}

interface GoldContextType {
  vGoldBalance: number;
  vGoldPrice: number;
  transactions: Transaction[];
  lendPositions: LendPosition[];
  borrowPositions: BorrowPosition[];
  buyGold: (amount: number) => Promise<Transaction>;
  sellGold: (amount: number) => Promise<Transaction>;
  lendGold: (amount: number, days: number) => Promise<Transaction>;
  borrowGold: (amount: number, days: number) => Promise<Transaction>;
  repayLoan: (borrowId: string) => Promise<Transaction>;
  claimLendReturns: (lendId: string) => Promise<Transaction>;
}

const GoldContext = createContext<GoldContextType>({
  vGoldBalance: 0,
  vGoldPrice: 0.05, // Default price in ALGO
  transactions: [],
  lendPositions: [],
  borrowPositions: [],
  buyGold: async () => ({ id: '', type: 'buy', amount: 0, status: 'pending', timestamp: 0 }),
  sellGold: async () => ({ id: '', type: 'sell', amount: 0, status: 'pending', timestamp: 0 }),
  lendGold: async () => ({ id: '', type: 'lend', amount: 0, status: 'pending', timestamp: 0 }),
  borrowGold: async () => ({ id: '', type: 'borrow', amount: 0, status: 'pending', timestamp: 0 }),
  repayLoan: async () => ({ id: '', type: 'repay', amount: 0, status: 'pending', timestamp: 0 }),
  claimLendReturns: async () => ({ id: '', type: 'claim', amount: 0, status: 'pending', timestamp: 0 }),
});

export const useGold = () => useContext(GoldContext);

export const GoldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, sendTransaction } = useWallet();
  const toast = useToast();
  
  const [vGoldBalance, setVGoldBalance] = useState(100);
  const [vGoldPrice, setVGoldPrice] = useState(0.05); // Default price in ALGO
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lendPositions, setLendPositions] = useState<LendPosition[]>([]);
  const [borrowPositions, setBorrowPositions] = useState<BorrowPosition[]>([]);

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || 'YOUR_DEFAULT_CONTRACT_ADDRESS';

  useEffect(() => {
    if (!isConnected) {
      setVGoldBalance(0);
      setTransactions([]);
      setLendPositions([]);
      setBorrowPositions([]);
    }
  }, [isConnected]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const handleTransaction = async (type: TransactionType, amount: number, note: string, details: Partial<Transaction> = {}) => {
    if (!address) throw new Error('Wallet not connected');

    const algoAmount = amount * vGoldPrice;
    const transaction: Transaction = {
      id: generateId(),
      type,
      amount,
      algoAmount,
      status: 'pending',
      timestamp: Date.now(),
      ...details,
    };

    setTransactions(prev => [transaction, ...prev]);

    try {
      const txHash = await sendTransaction(CONTRACT_ADDRESS, algoAmount.toString(), note);
      const updatedTransaction: Transaction = { ...transaction, status: 'completed', txHash };
      setTransactions(prev => prev.map(t => t.id === transaction.id ? updatedTransaction : t));
      return updatedTransaction;
    } catch (error: any) {
      const failedTransaction: Transaction = { ...transaction, status: 'failed' };
      setTransactions(prev => prev.map(t => t.id === transaction.id ? failedTransaction : t));
      toast({
        title: 'Transaction Failed',
        description: error.message || `Failed to ${type} vGold`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const buyGold = async (amount: number) => {
    const tx = await handleTransaction('buy', amount, `Buy ${amount} vGold`);
    setVGoldBalance(prev => prev + amount);
    toast({
      title: 'Purchased vGold',
      description: `Successfully bought ${amount} vGold`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    return tx;
  };

  const sellGold = async (amount: number) => {
    if (amount > vGoldBalance) throw new Error('Insufficient vGold balance');
    const tx = await handleTransaction('sell', amount, `Sell ${amount} vGold`);
    setVGoldBalance(prev => prev - amount);
    toast({
      title: 'Sold vGold',
      description: `Successfully sold ${amount} vGold for ${(amount * vGoldPrice).toFixed(4)} ALGO`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    return tx;
  };

  const lendGold = async (amount: number, days: number) => {
    if (amount > vGoldBalance) throw new Error('Insufficient vGold balance');
    const interestRate = days <= 30 ? 0.04 : days <= 90 ? 0.055 : 0.07;
    const tx = await handleTransaction('lend', amount, `Lend ${amount} vGold for ${days} days`, { duration: days, interest: interestRate });
    
    const lendPosition: LendPosition = {
      id: generateId(),
      amount,
      startDate: Date.now(),
      endDate: Date.now() + days * 24 * 60 * 60 * 1000,
      interest: interestRate,
      status: 'active',
    };
    
    setVGoldBalance(prev => prev - amount);
    setLendPositions(prev => [...prev, lendPosition]);
    toast({
      title: 'Lend Successful',
      description: `Successfully lent ${amount} vGold for ${days} days at ${(interestRate * 100).toFixed(2)}% APY`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    return tx;
  };

  const borrowGold = async (amount: number, days: number) => {
    const interestRate = days <= 30 ? 0.06 : days <= 90 ? 0.075 : 0.09;
    const collateralRatio = 1.5;
    const collateralAmount = amount * vGoldPrice * collateralRatio;
    const tx = await handleTransaction('borrow', amount, `Borrow ${amount} vGold for ${days} days`, { duration: days, interest: interestRate, collateral: collateralAmount });

    const borrowPosition: BorrowPosition = {
      id: generateId(),
      amount,
      collateral: collateralAmount,
      startDate: Date.now(),
      endDate: Date.now() + days * 24 * 60 * 60 * 1000,
      interest: interestRate,
      status: 'active',
    };

    setVGoldBalance(prev => prev + amount);
    setBorrowPositions(prev => [...prev, borrowPosition]);
    toast({
      title: 'Borrow Successful',
      description: `Successfully borrowed ${amount} vGold with ${collateralAmount.toFixed(2)} ALGO collateral`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    return tx;
  };

  const repayLoan = async (borrowId: string) => {
    const borrowPosition = borrowPositions.find(p => p.id === borrowId);
    if (!borrowPosition) throw new Error('Borrow position not found');
    if (borrowPosition.status !== 'active') throw new Error('Loan is not active');

    const loanDuration = (Date.now() - borrowPosition.startDate) / (24 * 60 * 60 * 1000);
    const interestFactor = 1 + (borrowPosition.interest * Math.min(loanDuration, (borrowPosition.endDate - borrowPosition.startDate) / (24 * 60 * 60 * 1000)) / 365);
    const repaymentAmount = borrowPosition.amount * interestFactor;

    if (vGoldBalance < repaymentAmount) throw new Error(`Insufficient vGold balance. Need ${repaymentAmount.toFixed(2)} vGold.`);

    const tx = await handleTransaction('repay', repaymentAmount, `Repay loan ${borrowId}`);
    
    setVGoldBalance(prev => prev - repaymentAmount);
    setBorrowPositions(prev => prev.map(p => p.id === borrowId ? { ...p, status: 'repaid' } : p));
    toast({
      title: 'Loan Repaid',
      description: `Successfully repaid ${repaymentAmount.toFixed(2)} vGold. Your collateral has been returned.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    return tx;
  };

  const claimLendReturns = async (lendId: string) => {
    const lendPosition = lendPositions.find(p => p.id === lendId);
    if (!lendPosition) throw new Error('Lending position not found');
    if (lendPosition.status !== 'active') throw new Error('Lending position already completed');
    if (Date.now() < lendPosition.endDate) throw new Error(`Lending period not yet finished. Available on ${new Date(lendPosition.endDate).toLocaleDateString()}`);

    const principal = lendPosition.amount;
    const interestAmount = principal * lendPosition.interest * ((lendPosition.endDate - lendPosition.startDate) / (365 * 24 * 60 * 60 * 1000));
    const totalReturns = principal + interestAmount;

    const tx = await handleTransaction('claim', totalReturns, `Claim returns for lend ${lendId}`);

    setVGoldBalance(prev => prev + totalReturns);
    setLendPositions(prev => prev.map(p => p.id === lendId ? { ...p, status: 'completed' } : p));
    toast({
      title: 'Returns Claimed',
      description: `Successfully claimed ${totalReturns.toFixed(2)} vGold (including ${interestAmount.toFixed(2)} interest)`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    return tx;
  };

  return (
    <GoldContext.Provider
      value={{
        vGoldBalance,
        vGoldPrice,
        transactions,
        lendPositions,
        borrowPositions,
        buyGold,
        sellGold,
        lendGold,
        borrowGold,
        repayLoan,
        claimLendReturns,
      }}
    >
      {children}
    </GoldContext.Provider>
  );
};