import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import algosdk from 'algosdk';
import { PeraWalletConnect } from '@perawallet/connect';
import MyAlgoConnect from '@randlabs/myalgo-connect';

type WalletType = 'pera' | 'myalgo';

interface WalletContextType {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  walletType: WalletType | null;
  connectWallet: (walletType: WalletType) => Promise<string>;
  disconnectWallet: () => void;
  sendTransaction: (to: string, amountAlgo: string, note?: string) => Promise<string>;
  networkName: string;
  account: string | null;
  algod: algosdk.Algodv2 | null;
  error: string | null;
  clearError: () => void;
  retryConnection: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: '0',
  isConnected: false,
  isConnecting: false,
  walletType: null,
  connectWallet: async () => '',
  disconnectWallet: () => {},
  sendTransaction: async () => '',
  networkName: process.env.REACT_APP_NETWORK || 'TestNet',
  account: null,
  algod: null,
  error: null,
  clearError: () => {},
  retryConnection: async () => {},
});

export const useWallet = () => useContext(WalletContext);

const pera = new PeraWalletConnect();
const myAlgo = new MyAlgoConnect();

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const toast = useToast();

  const algod = useMemo(() => {
    const token = process.env.REACT_APP_ALGOD_TOKEN || '';
    const base = process.env.REACT_APP_ALGOD_BASE || 'https://testnet-api.algonode.cloud';
    const port = process.env.REACT_APP_ALGOD_PORT || '';
    return new algosdk.Algodv2(token, base, port);
  }, []);

  const handleConnection = useCallback((addr: string, wallet: WalletType) => {
    setAddress(addr);
    setIsConnected(true);
    setWalletType(wallet);
    setError(null);
    setRetryCount(0);
    localStorage.setItem('walletType', wallet);
    refreshBalance(addr);
    toast({
      title: 'Wallet Connected',
      description: `Connected to ${addr.slice(0, 6)}...${addr.slice(-4)}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'bottom-right',
    });
  }, [toast]);

  const handleDisconnection = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setWalletType(null);
    setBalance('0');
    setError(null);
    setRetryCount(0);
    localStorage.removeItem('walletType');
  }, []);

  useEffect(() => {
    const sessionWalletType = localStorage.getItem('walletType');
    if (sessionWalletType) {
      setWalletType(sessionWalletType as WalletType);
      if (sessionWalletType === 'pera') {
        pera.reconnectSession().then((accounts) => {
          if (accounts.length) {
            handleConnection(accounts[0], 'pera');
          }
        });
      }
    }

    pera.connector?.on('disconnect', handleDisconnection);

    return () => {
      pera.connector?.off('disconnect');
    };
  }, [handleConnection, handleDisconnection]);

  

  const refreshBalance = async (addr: string, retries = 3) => {
    try {
      const accountInfo = await algod.accountInformation(addr).do();
      const microAlgos = Number(accountInfo.amount);
      setBalance((microAlgos / 1e6).toFixed(6));
      setError(null);
    } catch (e: any) {
      console.error('Failed to refresh balance:', e);
      if (retries > 0) {
        setTimeout(() => refreshBalance(addr, retries - 1), 1000);
      } else {
        setError('Failed to fetch balance. Please try again.');
        toast({
          title: 'Balance Update Failed',
          description: 'Unable to fetch latest balance. Please refresh the page.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
    }
  };

  const connectWallet = async (wallet: WalletType) => {
    try {
      setIsConnecting(true);
      setError(null);
      let addr: string;
      
      if (wallet === 'pera') {
        const accounts = await pera.connect();
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please ensure your Pera wallet is unlocked.');
        }
        addr = accounts[0];
      } else {
        const accounts = await myAlgo.connect();
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please ensure your MyAlgo wallet is unlocked.');
        }
        addr = accounts[0].address;
      }
      
      handleConnection(addr, wallet);
      return addr;
    } catch (e: any) {
      const errorMessage = e?.message || 'Could not connect wallet';
      setError(errorMessage);
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      throw e;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (walletType === 'pera') {
      pera.disconnect();
    }
    handleDisconnection();
  };

  const sendTransaction = async (to: string, amountAlgo: string, note?: string) => {
    if (!address) throw new Error('Wallet not connected');

    try {
      const params = await algod.getTransactionParams().do();
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: address,
        receiver: to,
        amount: Math.round(parseFloat(amountAlgo) * 1e6),
        note: note ? new TextEncoder().encode(note) : undefined,
        suggestedParams: params,
      });

      let signedTxn: Uint8Array | Uint8Array[];
      if (walletType === 'pera') {
        const txnsToSign = [{ txn, signers: [address] }];
        const signed = await pera.signTransaction([txnsToSign as any]);
        signedTxn = signed[0];
      } else if (walletType === 'myalgo') {
        const signed = await myAlgo.signTransaction(txn.toByte());
        signedTxn = signed.blob;
      } else {
        throw new Error('No wallet connected');
      }

      const result = await algod.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(algod, result.txid, 4);
      await refreshBalance(address);
      
      toast({
        title: 'Transaction Successful',
        description: `Transaction confirmed: ${result.txid.slice(0, 8)}...`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      
      return result.txid;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      const errorMessage = error.message || 'Transaction failed';
      setError(errorMessage);
      toast({
        title: 'Transaction Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      throw new Error(errorMessage);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryConnection = useCallback(async () => {
    if (!walletType) return;
    
    setRetryCount(prev => prev + 1);
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }
    
    try {
      await connectWallet(walletType);
    } catch (error) {
      // Error handling is done in connectWallet
    }
  }, [walletType, retryCount, connectWallet]);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected,
        isConnecting,
        walletType,
        connectWallet,
        disconnectWallet,
        sendTransaction,
        networkName: process.env.REACT_APP_NETWORK || 'TestNet',
        account: address,
        algod,
        error,
        clearError,
        retryConnection,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};