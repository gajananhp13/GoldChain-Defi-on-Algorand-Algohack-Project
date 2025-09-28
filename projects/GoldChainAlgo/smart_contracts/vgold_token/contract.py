"""
vGold Token Contract - AlgoKit Implementation
A fungible token representing virtual gold with standard token operations.
"""

from algopy import ARC4Contract, UInt64, String, Asset, Account, Txn, Global, arc4
from algopy.arc4 import abimethod


class VGoldToken(ARC4Contract):
    """vGold Token Contract - Represents virtual gold backed by physical gold"""
    
    # Global state keys
    TOTAL_SUPPLY = arc4.UInt64(1_000_000_000_000_000)  # 1B vGold tokens (6 decimals)
    DECIMALS = arc4.UInt64(6)
    NAME = arc4.String("Virtual Gold")
    SYMBOL = arc4.String("vGOLD")
    
    def __init__(self) -> None:
        # Initialize token metadata
        self.total_supply = self.TOTAL_SUPPLY
        self.decimals = self.DECIMALS
        self.name = self.NAME
        self.symbol = self.SYMBOL
        self.creator = Txn.sender
        self.manager = Txn.sender
        self.freeze = Global.zero_address
        self.clawback = Global.zero_address
        self.reserve = Txn.sender
        
        # Initialize creator balance
        self.balance[Txn.sender] = self.total_supply
    
    @abimethod
    def mint(self, amount: UInt64, to: Account) -> None:
        """Mint new vGold tokens to specified account"""
        # Only manager can mint
        assert Txn.sender == self.manager, "Only manager can mint tokens"
        
        # Check total supply limit
        assert self.total_supply + amount <= self.TOTAL_SUPPLY, "Exceeds total supply"
        
        # Update balances
        self.balance[to] += amount
        self.total_supply += amount
    
    @abimethod
    def burn(self, amount: UInt64) -> None:
        """Burn vGold tokens from sender's balance"""
        # Check sufficient balance
        assert self.balance[Txn.sender] >= amount, "Insufficient balance"
        
        # Update balances
        self.balance[Txn.sender] -= amount
        self.total_supply -= amount
    
    @abimethod
    def transfer(self, amount: UInt64, to: Account) -> None:
        """Transfer vGold tokens to another account"""
        # Check sufficient balance
        assert self.balance[Txn.sender] >= amount, "Insufficient balance"
        
        # Update balances
        self.balance[Txn.sender] -= amount
        self.balance[to] += amount
    
    @abimethod
    def get_balance(self, account: Account) -> UInt64:
        """Get vGold balance for an account"""
        return self.balance[account]
    
    @abimethod
    def get_total_supply(self) -> UInt64:
        """Get total supply of vGold tokens"""
        return self.total_supply
    
    @abimethod
    def get_metadata(self) -> tuple[String, String, UInt64, UInt64]:
        """Get token metadata"""
        return (self.name, self.symbol, self.decimals, self.total_supply)
    
    @abimethod
    def set_manager(self, new_manager: Account) -> None:
        """Set new manager (only current manager can call)"""
        assert Txn.sender == self.manager, "Only manager can set new manager"
        self.manager = new_manager
    
    @abimethod
    def set_freeze(self, freeze_address: Account) -> None:
        """Set freeze address (only manager can call)"""
        assert Txn.sender == self.manager, "Only manager can set freeze address"
        self.freeze = freeze_address
    
    @abimethod
    def set_clawback(self, clawback_address: Account) -> None:
        """Set clawback address (only manager can call)"""
        assert Txn.sender == self.manager, "Only manager can set clawback address"
        self.clawback = clawback_address
