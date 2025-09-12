# GoldChain Smart Contracts

This directory contains all the smart contracts for the GoldChain DeFi platform built on Algorand.

## Contract Overview

### 1. vGold Token Contract (`vgold_token.py`)
- **Purpose**: ERC-20 style fungible token representing virtual gold
- **Features**:
  - Token minting and burning
  - Transfer functionality
  - Balance tracking
  - 1 billion total supply with 6 decimals
- **State**: Global and local state management

### 2. Trading Contract (`trading_contract.py`)
- **Purpose**: Handles buy/sell operations for vGold tokens with ALGO
- **Features**:
  - Buy vGold with ALGO
  - Sell vGold for ALGO
  - Trading fee management (0.25% default)
  - Price oracle integration
  - Treasury management
- **Dependencies**: vGold Token Contract, Price Oracle

### 3. Lending Contract (`lending_contract.py`)
- **Purpose**: DeFi lending and borrowing with collateral management
- **Features**:
  - Lend vGold tokens with interest
  - Borrow vGold with ALGO collateral
  - Dynamic interest rates based on duration
  - Collateral ratio management (150% minimum)
  - Liquidation functionality
  - Position tracking
- **Dependencies**: vGold Token Contract

### 4. Price Oracle Contract (`price_oracle.py`)
- **Purpose**: Manages gold price updates and provides price data
- **Features**:
  - Price updates (oracle-only)
  - Price history tracking
  - Price validation and bounds checking
  - Emergency price updates
  - Price change calculations
- **Security**: Manager and oracle address controls

### 5. Contract Integration Service (`contract_service.py`)
- **Purpose**: Python backend service for contract interactions
- **Features**:
  - Unified interface for all contracts
  - Transaction building and submission
  - Balance and position queries
  - Error handling and validation

### 6. Frontend Contract Service (`../Goldchain/src/services/ContractService.ts`)
- **Purpose**: TypeScript service for frontend contract interactions
- **Features**:
  - React/TypeScript integration
  - Wallet integration
  - Transaction signing
  - Real-time balance updates

## Deployment

### Prerequisites
```bash
pip install -r requirements.txt
```

### Deploy Contracts
```bash
python deploy_contracts.py
```

This will:
1. Deploy all contracts in the correct order
2. Set up contract dependencies
3. Save configuration to `deployed/contracts.json`
4. Generate environment variables for frontend

### Configuration
After deployment, update your frontend `.env` file with the generated contract addresses:

```env
REACT_APP_VGOLD_APP_ID=<deployed_app_id>
REACT_APP_TRADING_APP_ID=<deployed_app_id>
REACT_APP_LENDING_APP_ID=<deployed_app_id>
REACT_APP_ORACLE_APP_ID=<deployed_app_id>
REACT_APP_VGOLD_ADDRESS=<contract_address>
REACT_APP_TRADING_ADDRESS=<contract_address>
REACT_APP_LENDING_ADDRESS=<contract_address>
REACT_APP_ORACLE_ADDRESS=<contract_address>
```

## Contract Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Price Oracle  │    │  Trading Contract│    │ Lending Contract│
│                 │    │                 │    │                 │
│ - Price updates │    │ - Buy/Sell vGold│    │ - Lend/Borrow   │
│ - Price history │    │ - Fee management│    │ - Collateral mgmt│
│ - Validation    │    │ - Treasury      │    │ - Interest calc │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  vGold Token    │
                    │                 │
                    │ - ERC-20 style  │
                    │ - Mint/Burn     │
                    │ - Transfers     │
                    │ - Balances      │
                    └─────────────────┘
```

## Security Features

- **Access Control**: Manager and oracle address restrictions
- **Input Validation**: All inputs are validated before processing
- **Collateral Management**: 150% minimum collateral ratio for borrowing
- **Liquidation**: Automatic liquidation for undercollateralized positions
- **Fee Management**: Configurable trading and lending fees
- **Emergency Controls**: Manager can update critical parameters

## Testing

### Local Testing
```bash
# Compile contracts
python vgold_token.py
python trading_contract.py
python lending_contract.py
python price_oracle.py
```

### Testnet Testing
1. Deploy contracts to testnet
2. Update frontend configuration
3. Test all functionality through the UI
4. Verify contract state changes

## Gas Optimization

- **Minimal State**: Only essential data stored on-chain
- **Efficient Operations**: Optimized transaction grouping
- **Batch Operations**: Multiple operations in single transaction
- **State Compression**: Efficient data structures

## Future Enhancements

- **Multi-token Support**: Support for multiple asset types
- **Advanced Oracles**: Integration with external price feeds
- **Governance**: DAO-based contract management
- **Cross-chain**: Bridge to other blockchains
- **Analytics**: Advanced analytics and reporting

## Support

For issues or questions:
1. Check the contract logs
2. Verify configuration
3. Test on testnet first
4. Review transaction details on Algorand Explorer
