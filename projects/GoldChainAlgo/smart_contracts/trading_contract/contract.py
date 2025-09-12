"""
Trading Contract - AlgoKit Implementation
Handles buy/sell operations for vGold tokens with ALGO.
"""

from algopy import ARC4Contract, UInt64, Account, Txn, Global, arc4, Asset
from algopy.arc4 import abimethod


class TradingContract(ARC4Contract):
    """Trading Contract - Handles vGold/ALGO trading with fees"""
    
    def __init__(self) -> None:
        # Contract configuration
        self.vgold_app_id = UInt64(0)  # Will be set during deployment
        self.price_oracle = Account(Global.zero_address)  # Will be set during deployment
        self.trading_fee = UInt64(25)  # 0.25% fee (25 basis points)
        self.manager = Txn.sender
        self.treasury = Txn.sender
        
        # Current price (0.05 ALGO per vGold in microALGO)
        self.current_price = UInt64(50_000)  # 0.05 ALGO = 50,000 microALGO
        
        # Trading statistics
        self.total_volume_algo = UInt64(0)
        self.total_volume_vgold = UInt64(0)
        self.total_fees_collected = UInt64(0)
    
    @abimethod
    def initialize(self, vgold_app_id: UInt64, oracle_address: Account) -> None:
        """Initialize contract with vGold app ID and oracle address"""
        assert Txn.sender == self.manager, "Only manager can initialize"
        self.vgold_app_id = vgold_app_id
        self.price_oracle = oracle_address
    
    @abimethod
    def buy_vgold(self, algo_amount: UInt64) -> UInt64:
        """Buy vGold tokens with ALGO"""
        # Calculate vGold amount to receive
        vgold_amount = (algo_amount * UInt64(1_000_000)) // self.current_price
        
        # Calculate trading fee
        fee_amount = (vgold_amount * self.trading_fee) // UInt64(10_000)
        net_vgold = vgold_amount - fee_amount
        
        # Update statistics
        self.total_volume_algo += algo_amount
        self.total_volume_vgold += vgold_amount
        self.total_fees_collected += fee_amount
        
        # In a real implementation, you would:
        # 1. Transfer ALGO from buyer to contract
        # 2. Mint vGold tokens to buyer
        # 3. Handle the fee distribution
        
        return net_vgold
    
    @abimethod
    def sell_vgold(self, vgold_amount: UInt64) -> UInt64:
        """Sell vGold tokens for ALGO"""
        # Calculate ALGO amount to receive
        algo_amount = (vgold_amount * self.current_price) // UInt64(1_000_000)
        
        # Calculate trading fee
        fee_amount = (algo_amount * self.trading_fee) // UInt64(10_000)
        net_algo = algo_amount - fee_amount
        
        # Update statistics
        self.total_volume_algo += algo_amount
        self.total_volume_vgold += vgold_amount
        self.total_fees_collected += fee_amount
        
        # In a real implementation, you would:
        # 1. Burn vGold tokens from seller
        # 2. Transfer ALGO to seller
        # 3. Handle the fee distribution
        
        return net_algo
    
    @abimethod
    def update_price(self, new_price: UInt64) -> None:
        """Update vGold price (only oracle can call)"""
        assert Txn.sender == self.price_oracle, "Only oracle can update price"
        
        # Validate price is reasonable (between 0.001 and 1 ALGO per vGold)
        assert new_price >= UInt64(1_000), "Price too low"  # 0.001 ALGO
        assert new_price <= UInt64(1_000_000), "Price too high"  # 1 ALGO
        
        self.current_price = new_price
    
    @abimethod
    def get_current_price(self) -> UInt64:
        """Get current vGold price in microALGO"""
        return self.current_price
    
    @abimethod
    def get_trading_stats(self) -> tuple[UInt64, UInt64, UInt64]:
        """Get trading statistics"""
        return (self.total_volume_algo, self.total_volume_vgold, self.total_fees_collected)
    
    @abimethod
    def set_trading_fee(self, new_fee: UInt64) -> None:
        """Set trading fee (only manager can call)"""
        assert Txn.sender == self.manager, "Only manager can set trading fee"
        assert new_fee <= UInt64(1_000), "Fee too high"  # Max 10%
        
        self.trading_fee = new_fee
    
    @abimethod
    def withdraw_fees(self, amount: UInt64) -> None:
        """Withdraw collected fees to treasury (only manager can call)"""
        assert Txn.sender == self.manager, "Only manager can withdraw fees"
        assert amount <= self.total_fees_collected, "Insufficient fees collected"
        
        # In a real implementation, transfer ALGO to treasury
        self.total_fees_collected -= amount
    
    @abimethod
    def set_oracle(self, new_oracle: Account) -> None:
        """Set new oracle address (only manager can call)"""
        assert Txn.sender == self.manager, "Only manager can set oracle"
        self.price_oracle = new_oracle
    
    @abimethod
    def emergency_withdraw(self, amount: UInt64) -> None:
        """Emergency withdrawal (only manager can call)"""
        assert Txn.sender == self.manager, "Only manager can emergency withdraw"
        
        # In a real implementation, transfer ALGO to treasury
        pass
