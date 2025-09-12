"""
Contract Integration Service
Handles all smart contract interactions and provides a unified interface.
"""

import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.future import transaction
from algosdk.encoding import encode_address, decode_address
import base64

@dataclass
class ContractConfig:
    """Configuration for smart contracts"""
    vgold_app_id: int
    trading_app_id: int
    lending_app_id: int
    oracle_app_id: int
    manager_address: str
    treasury_address: str

@dataclass
class TransactionResult:
    """Result of a contract transaction"""
    success: bool
    tx_id: str
    error: Optional[str] = None
    app_id: Optional[int] = None

class ContractService:
    """Main service for interacting with GoldChain smart contracts"""
    
    def __init__(self, algod_client: algod.AlgodClient, config: ContractConfig):
        self.algod_client = algod_client
        self.config = config
        
    def get_account_info(self, address: str) -> Dict:
        """Get account information"""
        try:
            return self.algod_client.account_info(address)
        except Exception as e:
            raise Exception(f"Failed to get account info: {str(e)}")
    
    def get_vgold_balance(self, address: str) -> int:
        """Get vGold token balance for an address"""
        try:
            account_info = self.get_account_info(address)
            
            # Look for vGold token in the account's assets
            for asset in account_info.get('assets', []):
                if asset['asset-id'] == self.config.vgold_app_id:
                    return asset['amount']
            
            return 0
        except Exception as e:
            raise Exception(f"Failed to get vGold balance: {str(e)}")
    
    def get_current_price(self) -> int:
        """Get current vGold price from oracle"""
        try:
            # Call the price oracle contract
            app_args = [b"get_price"]
            
            txn = transaction.ApplicationCallTxn(
                sender=self.config.manager_address,
                sp=self.algod_client.suggested_params(),
                index=self.config.oracle_app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=app_args
            )
            
            # This would need to be properly signed and submitted
            # For now, return a default price
            return 50000  # 0.05 ALGO in microALGO
        except Exception as e:
            raise Exception(f"Failed to get current price: {str(e)}")
    
    def buy_vgold(self, buyer_address: str, algo_amount: int, private_key: str) -> TransactionResult:
        """Buy vGold tokens with ALGO"""
        try:
            # Get suggested parameters
            params = self.algod_client.suggested_params()
            
            # Create the transaction
            txn = transaction.ApplicationCallTxn(
                sender=buyer_address,
                sp=params,
                index=self.config.trading_app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"buy"],
                foreign_assets=[self.config.vgold_app_id]
            )
            
            # Add payment transaction
            payment_txn = transaction.PaymentTxn(
                sender=buyer_address,
                sp=params,
                receiver=self.config.treasury_address,
                amt=algo_amount
            )
            
            # Group transactions
            gid = transaction.calculate_group_id([payment_txn, txn])
            payment_txn.group = gid
            txn.group = gid
            
            # Sign transactions
            signed_payment = payment_txn.sign(private_key)
            signed_app = txn.sign(private_key)
            
            # Submit transactions
            tx_id = self.algod_client.send_transactions([signed_payment, signed_app])
            
            return TransactionResult(success=True, tx_id=tx_id, app_id=self.config.trading_app_id)
            
        except Exception as e:
            return TransactionResult(success=False, tx_id="", error=str(e))
    
    def sell_vgold(self, seller_address: str, vgold_amount: int, private_key: str) -> TransactionResult:
        """Sell vGold tokens for ALGO"""
        try:
            # Get suggested parameters
            params = self.algod_client.suggested_params()
            
            # Create the transaction
            txn = transaction.ApplicationCallTxn(
                sender=seller_address,
                sp=params,
                index=self.config.trading_app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"sell", vgold_amount.to_bytes(8, 'big')],
                foreign_assets=[self.config.vgold_app_id]
            )
            
            # Group with asset transfer
            asset_transfer = transaction.AssetTransferTxn(
                sender=seller_address,
                sp=params,
                receiver=self.config.treasury_address,
                amt=vgold_amount,
                index=self.config.vgold_app_id
            )
            
            # Group transactions
            gid = transaction.calculate_group_id([asset_transfer, txn])
            asset_transfer.group = gid
            txn.group = gid
            
            # Sign transactions
            signed_transfer = asset_transfer.sign(private_key)
            signed_app = txn.sign(private_key)
            
            # Submit transactions
            tx_id = self.algod_client.send_transactions([signed_transfer, signed_app])
            
            return TransactionResult(success=True, tx_id=tx_id, app_id=self.config.trading_app_id)
            
        except Exception as e:
            return TransactionResult(success=False, tx_id="", error=str(e))
    
    def lend_vgold(self, lender_address: str, amount: int, duration_days: int, private_key: str) -> TransactionResult:
        """Lend vGold tokens"""
        try:
            # Get suggested parameters
            params = self.algod_client.suggested_params()
            
            # Create the transaction
            txn = transaction.ApplicationCallTxn(
                sender=lender_address,
                sp=params,
                index=self.config.lending_app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"lend", amount.to_bytes(8, 'big'), duration_days.to_bytes(4, 'big')],
                foreign_assets=[self.config.vgold_app_id]
            )
            
            # Group with asset transfer
            asset_transfer = transaction.AssetTransferTxn(
                sender=lender_address,
                sp=params,
                receiver=self.config.treasury_address,
                amt=amount,
                index=self.config.vgold_app_id
            )
            
            # Group transactions
            gid = transaction.calculate_group_id([asset_transfer, txn])
            asset_transfer.group = gid
            txn.group = gid
            
            # Sign transactions
            signed_transfer = asset_transfer.sign(private_key)
            signed_app = txn.sign(private_key)
            
            # Submit transactions
            tx_id = self.algod_client.send_transactions([signed_transfer, signed_app])
            
            return TransactionResult(success=True, tx_id=tx_id, app_id=self.config.lending_app_id)
            
        except Exception as e:
            return TransactionResult(success=False, tx_id="", error=str(e))
    
    def borrow_vgold(self, borrower_address: str, amount: int, duration_days: int, collateral_algo: int, private_key: str) -> TransactionResult:
        """Borrow vGold with ALGO collateral"""
        try:
            # Get suggested parameters
            params = self.algod_client.suggested_params()
            
            # Create the transaction
            txn = transaction.ApplicationCallTxn(
                sender=borrower_address,
                sp=params,
                index=self.config.lending_app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"borrow", amount.to_bytes(8, 'big'), duration_days.to_bytes(4, 'big')],
                foreign_assets=[self.config.vgold_app_id]
            )
            
            # Add payment for collateral
            payment_txn = transaction.PaymentTxn(
                sender=borrower_address,
                sp=params,
                receiver=self.config.treasury_address,
                amt=collateral_algo
            )
            
            # Group transactions
            gid = transaction.calculate_group_id([payment_txn, txn])
            payment_txn.group = gid
            txn.group = gid
            
            # Sign transactions
            signed_payment = payment_txn.sign(private_key)
            signed_app = txn.sign(private_key)
            
            # Submit transactions
            tx_id = self.algod_client.send_transactions([signed_payment, signed_app])
            
            return TransactionResult(success=True, tx_id=tx_id, app_id=self.config.lending_app_id)
            
        except Exception as e:
            return TransactionResult(success=False, tx_id="", error=str(e))
    
    def repay_loan(self, borrower_address: str, private_key: str) -> TransactionResult:
        """Repay a loan and get collateral back"""
        try:
            # Get suggested parameters
            params = self.algod_client.suggested_params()
            
            # Create the transaction
            txn = transaction.ApplicationCallTxn(
                sender=borrower_address,
                sp=params,
                index=self.config.lending_app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"repay"],
                foreign_assets=[self.config.vgold_app_id]
            )
            
            # Sign and submit
            signed_txn = txn.sign(private_key)
            tx_id = self.algod_client.send_transaction(signed_txn)
            
            return TransactionResult(success=True, tx_id=tx_id, app_id=self.config.lending_app_id)
            
        except Exception as e:
            return TransactionResult(success=False, tx_id="", error=str(e))
    
    def claim_lending_returns(self, lender_address: str, private_key: str) -> TransactionResult:
        """Claim returns from lending"""
        try:
            # Get suggested parameters
            params = self.algod_client.suggested_params()
            
            # Create the transaction
            txn = transaction.ApplicationCallTxn(
                sender=lender_address,
                sp=params,
                index=self.config.lending_app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"claim"],
                foreign_assets=[self.config.vgold_app_id]
            )
            
            # Sign and submit
            signed_txn = txn.sign(private_key)
            tx_id = self.algod_client.send_transaction(signed_txn)
            
            return TransactionResult(success=True, tx_id=tx_id, app_id=self.config.lending_app_id)
            
        except Exception as e:
            return TransactionResult(success=False, tx_id="", error=str(e))
    
    def get_position(self, user_address: str, position_type: str) -> Dict:
        """Get user's lending or borrowing position"""
        try:
            # Get suggested parameters
            params = self.algod_client.suggested_params()
            
            # Create the transaction
            txn = transaction.ApplicationCallTxn(
                sender=user_address,
                sp=params,
                index=self.config.lending_app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"position", position_type.encode()]
            )
            
            # This would need to be properly executed and the result parsed
            # For now, return empty position
            return {
                "amount": 0,
                "start_time": 0,
                "duration": 0,
                "interest_rate": 0,
                "status": 0
            }
            
        except Exception as e:
            raise Exception(f"Failed to get position: {str(e)}")
    
    def update_price(self, new_price: int, private_key: str) -> TransactionResult:
        """Update vGold price (oracle only)"""
        try:
            # Get suggested parameters
            params = self.algod_client.suggested_params()
            
            # Create the transaction
            txn = transaction.ApplicationCallTxn(
                sender=self.config.manager_address,
                sp=params,
                index=self.config.oracle_app_id,
                on_complete=transaction.OnComplete.NoOpOC,
                app_args=[b"update", new_price.to_bytes(8, 'big')]
            )
            
            # Sign and submit
            signed_txn = txn.sign(private_key)
            tx_id = self.algod_client.send_transaction(signed_txn)
            
            return TransactionResult(success=True, tx_id=tx_id, app_id=self.config.oracle_app_id)
            
        except Exception as e:
            return TransactionResult(success=False, tx_id="", error=str(e))

# Factory function to create contract service
def create_contract_service(algod_client: algod.AlgodClient, config_dict: Dict) -> ContractService:
    """Create a ContractService instance from configuration dictionary"""
    config = ContractConfig(**config_dict)
    return ContractService(algod_client, config)

# Example usage and configuration
if __name__ == "__main__":
    # Example configuration
    config = {
        "vgold_app_id": 0,  # Will be set after deployment
        "trading_app_id": 0,  # Will be set after deployment
        "lending_app_id": 0,  # Will be set after deployment
        "oracle_app_id": 0,  # Will be set after deployment
        "manager_address": "YOUR_MANAGER_ADDRESS",
        "treasury_address": "YOUR_TREASURY_ADDRESS"
    }
    
    print("Contract Service created successfully!")
    print("Configuration:", json.dumps(config, indent=2))
