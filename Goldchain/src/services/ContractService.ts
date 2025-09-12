/**
 * Contract Service - Frontend Integration
 * Handles all smart contract interactions from the frontend
 */

import algosdk from 'algosdk';

export interface ContractConfig {
  vgoldAppId: number;
  tradingAppId: number;
  lendingAppId: number;
  oracleAppId: number;
  vgoldAddress: string;
  tradingAddress: string;
  lendingAddress: string;
  oracleAddress: string;
}

export interface TransactionResult {
  success: boolean;
  txId: string;
  error?: string;
  appId?: number;
}

export class ContractService {
  private algod: algosdk.Algodv2;
  private config: ContractConfig;

  constructor(algod: algosdk.Algodv2, config: ContractConfig) {
    this.algod = algod;
    this.config = config;
    
    // Validate contract addresses are properly configured
    this.validateContractConfig();
  }

  private validateContractConfig() {
    // Check if we're in development mode (using placeholder addresses)
    const isDevelopmentMode = this.config.vgoldAddress.startsWith('DEVELOPMENT_PLACEHOLDER_') ||
                             this.config.tradingAddress.startsWith('DEVELOPMENT_PLACEHOLDER_') ||
                             this.config.lendingAddress.startsWith('DEVELOPMENT_PLACEHOLDER_') ||
                             this.config.oracleAddress.startsWith('DEVELOPMENT_PLACEHOLDER_');

    if (isDevelopmentMode) {
      console.warn('⚠️  Running in development mode with placeholder contract addresses.');
      console.warn('   Smart contract operations will be disabled until real addresses are configured.');
      return; // Skip validation in development mode
    }

    const requiredAddresses = [
      { key: 'vgoldAddress', value: this.config.vgoldAddress, name: 'vGold Token' },
      { key: 'tradingAddress', value: this.config.tradingAddress, name: 'Trading Contract' },
      { key: 'lendingAddress', value: this.config.lendingAddress, name: 'Lending Contract' },
      { key: 'oracleAddress', value: this.config.oracleAddress, name: 'Price Oracle' },
    ];

    for (const { key, value, name } of requiredAddresses) {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        throw new Error(`${name} address is missing. Please set REACT_APP_${key.toUpperCase()} in your environment variables.`);
      }
      if (value.length !== 58) {
        throw new Error(`${name} address seems to be malformed: expected length 58, got ${value.length}. Please check REACT_APP_${key.toUpperCase()}.`);
      }
      if (!algosdk.isValidAddress(value)) {
        throw new Error(`${name} address is not a valid Algorand address. Please check REACT_APP_${key.toUpperCase()}.`);
      }
    }

    // Validate app IDs are positive numbers (only in production mode)
    const requiredAppIds = [
      { key: 'vgoldAppId', value: this.config.vgoldAppId, name: 'vGold Token' },
      { key: 'tradingAppId', value: this.config.tradingAppId, name: 'Trading Contract' },
      { key: 'lendingAppId', value: this.config.lendingAppId, name: 'Lending Contract' },
      { key: 'oracleAppId', value: this.config.oracleAppId, name: 'Price Oracle' },
    ];

    for (const { key, value, name } of requiredAppIds) {
      if (!value || value <= 0 || !Number.isInteger(value)) {
        throw new Error(`${name} app ID is invalid. Please set REACT_APP_${key.toUpperCase()} to a positive integer.`);
      }
    }
  }

  private ensureValidAddress(address: string, role: string) {
    if (!address || typeof address !== 'string') {
      throw new Error(`${role} address is missing`);
    }
    
    // Check if this is a development placeholder address
    if (address.startsWith('DEVELOPMENT_PLACEHOLDER_')) {
      throw new Error(`${role} address is not configured. Please set the contract addresses in your environment variables to use smart contract features.`);
    }
    
    if (address.length !== 58) {
      throw new Error(`${role} address seems to be malformed: expected length 58, got ${address.length}`);
    }
    if (!algosdk.isValidAddress(address)) {
      throw new Error(`${role} address is not a valid Algorand address`);
    }
  }

  /**
   * Get vGold token balance for an address
   */
  async getVGoldBalance(address: string): Promise<number> {
    try {
      const accountInfo = await this.algod.accountInformation(address).do();
      
      // Look for vGold token in the account's assets
      for (const asset of accountInfo.assets || []) {
        if (asset.assetId === BigInt(this.config.vgoldAppId)) {
          return Number(asset.amount);
        }
      }
      
      return 0;
    } catch (error) {
      console.error('Failed to get vGold balance:', error);
      return 0;
    }
  }

  /**
   * Get current vGold price from oracle
   */
  async getCurrentPrice(): Promise<number> {
    try {
      // For now, return a default price
      // In production, this would call the price oracle contract
      return 0.05; // 0.05 ALGO per vGold
    } catch (error) {
      console.error('Failed to get current price:', error);
      return 0.05;
    }
  }

  /**
   * Buy vGold tokens with ALGO
   */
  async buyVGold(
    buyerAddress: string, 
    algoAmount: number, 
    signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>
  ): Promise<TransactionResult> {
    try {
      this.ensureValidAddress(buyerAddress, 'Buyer');
      this.ensureValidAddress(this.config.tradingAddress, 'Trading (receiver)');
      const params = await this.algod.getTransactionParams().do();
      
      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: buyerAddress,
        appIndex: this.config.tradingAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new TextEncoder().encode('buy')],
        foreignAssets: [this.config.vgoldAppId],
        suggestedParams: params,
      });

      // Create payment transaction
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: buyerAddress,
        receiver: this.config.tradingAddress,
        amount: Math.round(algoAmount * 1e6), // Convert to microALGO
        suggestedParams: params,
      });

      // Group transactions
      const groupId = algosdk.computeGroupID([paymentTxn, appCallTxn]);
      paymentTxn.group = groupId;
      appCallTxn.group = groupId;

      // Sign transactions
      const signedPayment = await signTransaction(paymentTxn);
      const signedAppCall = await signTransaction(appCallTxn);

      // Submit transactions
      const txId = await this.algod.sendRawTransaction([signedPayment, signedAppCall]).do();
      
      return {
        success: true,
        txId: txId.txid,
        appId: this.config.tradingAppId
      };
    } catch (error: any) {
      return {
        success: false,
        txId: '',
        error: error.message || 'Failed to buy vGold'
      };
    }
  }

  /**
   * Sell vGold tokens for ALGO
   */
  async sellVGold(
    sellerAddress: string, 
    vgoldAmount: number, 
    signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>
  ): Promise<TransactionResult> {
    try {
      this.ensureValidAddress(sellerAddress, 'Seller');
      this.ensureValidAddress(this.config.tradingAddress, 'Trading (receiver)');
      const params = await this.algod.getTransactionParams().do();
      
      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: sellerAddress,
        appIndex: this.config.tradingAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode('sell'),
          algosdk.encodeUint64(Math.round(vgoldAmount * 1e6)) // Convert to micro units
        ],
        foreignAssets: [this.config.vgoldAppId],
        suggestedParams: params,
      });

      // Create asset transfer transaction
      const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: sellerAddress,
        receiver: this.config.tradingAddress,
        amount: Math.round(vgoldAmount * 1e6),
        assetIndex: this.config.vgoldAppId,
        suggestedParams: params,
      });

      // Group transactions
      const groupId = algosdk.computeGroupID([assetTransferTxn, appCallTxn]);
      assetTransferTxn.group = groupId;
      appCallTxn.group = groupId;

      // Sign transactions
      const signedTransfer = await signTransaction(assetTransferTxn);
      const signedAppCall = await signTransaction(appCallTxn);

      // Submit transactions
      const txId = await this.algod.sendRawTransaction([signedTransfer, signedAppCall]).do();
      
      return {
        success: true,
        txId: txId.txid,
        appId: this.config.tradingAppId
      };
    } catch (error: any) {
      return {
        success: false,
        txId: '',
        error: error.message || 'Failed to sell vGold'
      };
    }
  }

  /**
   * Lend vGold tokens
   */
  async lendVGold(
    lenderAddress: string, 
    amount: number, 
    durationDays: number, 
    signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>
  ): Promise<TransactionResult> {
    try {
      this.ensureValidAddress(lenderAddress, 'Lender');
      this.ensureValidAddress(this.config.lendingAddress, 'Lending (receiver)');
      const params = await this.algod.getTransactionParams().do();
      
      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: lenderAddress,
        appIndex: this.config.lendingAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode('lend'),
          algosdk.encodeUint64(Math.round(amount * 1e6)),
          algosdk.encodeUint64(durationDays)
        ],
        foreignAssets: [this.config.vgoldAppId],
        suggestedParams: params,
      });

      // Create asset transfer transaction
      const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: lenderAddress,
        receiver: this.config.lendingAddress,
        amount: Math.round(amount * 1e6),
        assetIndex: this.config.vgoldAppId,
        suggestedParams: params,
      });

      // Group transactions
      const groupId = algosdk.computeGroupID([assetTransferTxn, appCallTxn]);
      assetTransferTxn.group = groupId;
      appCallTxn.group = groupId;

      // Sign transactions
      const signedTransfer = await signTransaction(assetTransferTxn);
      const signedAppCall = await signTransaction(appCallTxn);

      // Submit transactions
      const txId = await this.algod.sendRawTransaction([signedTransfer, signedAppCall]).do();
      
      return {
        success: true,
        txId: txId.txid,
        appId: this.config.lendingAppId
      };
    } catch (error: any) {
      return {
        success: false,
        txId: '',
        error: error.message || 'Failed to lend vGold'
      };
    }
  }

  /**
   * Borrow vGold with ALGO collateral
   */
  async borrowVGold(
    borrowerAddress: string, 
    amount: number, 
    durationDays: number, 
    collateralAlgo: number,
    signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>
  ): Promise<TransactionResult> {
    try {
      this.ensureValidAddress(borrowerAddress, 'Borrower');
      this.ensureValidAddress(this.config.lendingAddress, 'Lending (receiver)');
      const params = await this.algod.getTransactionParams().do();
      
      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: borrowerAddress,
        appIndex: this.config.lendingAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode('borrow'),
          algosdk.encodeUint64(Math.round(amount * 1e6)),
          algosdk.encodeUint64(durationDays)
        ],
        foreignAssets: [this.config.vgoldAppId],
        suggestedParams: params,
      });

      // Create payment transaction for collateral
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: borrowerAddress,
        receiver: this.config.lendingAddress,
        amount: Math.round(collateralAlgo * 1e6),
        suggestedParams: params,
      });

      // Group transactions
      const groupId = algosdk.computeGroupID([paymentTxn, appCallTxn]);
      paymentTxn.group = groupId;
      appCallTxn.group = groupId;

      // Sign transactions
      const signedPayment = await signTransaction(paymentTxn);
      const signedAppCall = await signTransaction(appCallTxn);

      // Submit transactions
      const txId = await this.algod.sendRawTransaction([signedPayment, signedAppCall]).do();
      
      return {
        success: true,
        txId: txId.txid,
        appId: this.config.lendingAppId
      };
    } catch (error: any) {
      return {
        success: false,
        txId: '',
        error: error.message || 'Failed to borrow vGold'
      };
    }
  }

  /**
   * Repay a loan
   */
  async repayLoan(
    borrowerAddress: string, 
    signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>
  ): Promise<TransactionResult> {
    try {
      this.ensureValidAddress(borrowerAddress, 'Borrower');
      const params = await this.algod.getTransactionParams().do();
      
      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: borrowerAddress,
        appIndex: this.config.lendingAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new TextEncoder().encode('repay')],
        foreignAssets: [this.config.vgoldAppId],
        suggestedParams: params,
      });

      // Sign and submit
      const signedTxn = await signTransaction(appCallTxn);
      const txId = await this.algod.sendRawTransaction(signedTxn).do();
      
      return {
        success: true,
        txId: txId.txid,
        appId: this.config.lendingAppId
      };
    } catch (error: any) {
      return {
        success: false,
        txId: '',
        error: error.message || 'Failed to repay loan'
      };
    }
  }

  /**
   * Claim lending returns
   */
  async claimLendingReturns(
    lenderAddress: string, 
    signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>
  ): Promise<TransactionResult> {
    try {
      this.ensureValidAddress(lenderAddress, 'Lender');
      const params = await this.algod.getTransactionParams().do();
      
      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: lenderAddress,
        appIndex: this.config.lendingAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new TextEncoder().encode('claim')],
        foreignAssets: [this.config.vgoldAppId],
        suggestedParams: params,
      });

      // Sign and submit
      const signedTxn = await signTransaction(appCallTxn);
      const txId = await this.algod.sendRawTransaction(signedTxn).do();
      
      return {
        success: true,
        txId: txId.txid,
        appId: this.config.lendingAppId
      };
    } catch (error: any) {
      return {
        success: false,
        txId: '',
        error: error.message || 'Failed to claim lending returns'
      };
    }
  }
}

// Factory function to create contract service
export function createContractService(algod: algosdk.Algodv2): ContractService {
  // Helper function to safely parse environment variables
  const parseEnvInt = (envVar: string, defaultValue: number = 0): number => {
    const value = process.env[envVar];
    if (!value || value.trim() === '') return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Helper function to safely get environment variables with validation
  const getEnvString = (envVar: string, defaultValue: string = '', required: boolean = false): string => {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      if (required) {
        throw new Error(`Required environment variable ${envVar} is missing. Please set it in your .env file.`);
      }
      return defaultValue;
    }
    return value.trim();
  };

  // Check if we're in development mode (all addresses are empty)
  const isDevelopmentMode = !process.env.REACT_APP_VGOLD_ADDRESS && 
                           !process.env.REACT_APP_TRADING_ADDRESS && 
                           !process.env.REACT_APP_LENDING_ADDRESS && 
                           !process.env.REACT_APP_ORACLE_ADDRESS;

  if (isDevelopmentMode) {
    console.warn('⚠️  Contract addresses not configured. Using development mode with placeholder values.');
    console.warn('   To use real contracts, set the following environment variables in your .env file:');
    console.warn('   - REACT_APP_VGOLD_ADDRESS');
    console.warn('   - REACT_APP_TRADING_ADDRESS');
    console.warn('   - REACT_APP_LENDING_ADDRESS');
    console.warn('   - REACT_APP_ORACLE_ADDRESS');
    console.warn('   - REACT_APP_VGOLD_APP_ID');
    console.warn('   - REACT_APP_TRADING_APP_ID');
    console.warn('   - REACT_APP_LENDING_APP_ID');
    console.warn('   - REACT_APP_ORACLE_APP_ID');
  }

  const config: ContractConfig = {
    vgoldAppId: parseEnvInt('REACT_APP_VGOLD_APP_ID'),
    tradingAppId: parseEnvInt('REACT_APP_TRADING_APP_ID'),
    lendingAppId: parseEnvInt('REACT_APP_LENDING_APP_ID'),
    oracleAppId: parseEnvInt('REACT_APP_ORACLE_APP_ID'),
    vgoldAddress: getEnvString('REACT_APP_VGOLD_ADDRESS', 'DEVELOPMENT_PLACEHOLDER_VGOLD_ADDRESS'),
    tradingAddress: getEnvString('REACT_APP_TRADING_ADDRESS', 'DEVELOPMENT_PLACEHOLDER_TRADING_ADDRESS'),
    lendingAddress: getEnvString('REACT_APP_LENDING_ADDRESS', 'DEVELOPMENT_PLACEHOLDER_LENDING_ADDRESS'),
    oracleAddress: getEnvString('REACT_APP_ORACLE_ADDRESS', 'DEVELOPMENT_PLACEHOLDER_ORACLE_ADDRESS'),
  };

  return new ContractService(algod, config);
}
