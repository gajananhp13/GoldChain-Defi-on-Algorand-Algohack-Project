"""
Price Oracle Contract - AlgoKit Implementation
Manages gold price updates and provides price data to other contracts.
"""

from algopy import ARC4Contract, UInt64, Account, Txn, Global, arc4
from algopy.arc4 import abimethod


class PriceOracle(ARC4Contract):
    """Price Oracle Contract - Manages gold price updates and validation"""
    
    def __init__(self) -> None:
        # Oracle configuration
        self.current_price = UInt64(50_000)  # 0.05 ALGO per vGold (in microALGO)
        self.price_update_time = Global.latest_timestamp
        self.oracle_address = Txn.sender
        self.manager = Txn.sender
        
        # Price bounds for validation
        self.min_price = UInt64(1_000)    # 0.001 ALGO
        self.max_price = UInt64(1_000_000) # 1 ALGO
        
        # Price history tracking
        self.price_history_count = UInt64(0)
        self.last_price = UInt64(50_000)
        
        # Price change tracking
        self.price_change_24h = UInt64(0)
        self.price_change_7d = UInt64(0)
        self.price_change_30d = UInt64(0)
    
    @abimethod
    def update_price(self, new_price: UInt64) -> None:
        """Update gold price (only oracle can call)"""
        assert Txn.sender == self.oracle_address, "Only oracle can update price"
        
        # Validate price is within bounds
        assert new_price >= self.min_price, "Price below minimum"
        assert new_price <= self.max_price, "Price above maximum"
        
        # Store old price
        self.last_price = self.current_price
        
        # Update current price
        self.current_price = new_price
        self.price_update_time = Global.latest_timestamp
        
        # Increment price history counter
        self.price_history_count += UInt64(1)
        
        # Calculate price change percentage
        self._calculate_price_change()
    
    @abimethod
    def get_current_price(self) -> UInt64:
        """Get current gold price in microALGO"""
        return self.current_price
    
    @abimethod
    def get_price_info(self) -> tuple[UInt64, UInt64, UInt64]:
        """Get comprehensive price information"""
        return (
            self.current_price,
            self.price_update_time,
            self.price_history_count
        )
    
    @abimethod
    def get_price_change(self) -> tuple[UInt64, UInt64, UInt64]:
        """Get price change percentages"""
        return (
            self.price_change_24h,
            self.price_change_7d,
            self.price_change_30d
        )
    
    @abimethod
    def validate_price(self, price: UInt64) -> bool:
        """Validate if price is within acceptable bounds"""
        return price >= self.min_price and price <= self.max_price
    
    @abimethod
    def set_price_bounds(self, min_price: UInt64, max_price: UInt64) -> None:
        """Set price bounds (only manager can call)"""
        assert Txn.sender == self.manager, "Only manager can set price bounds"
        assert min_price < max_price, "Invalid price bounds"
        assert min_price > UInt64(0), "Minimum price must be positive"
        
        self.min_price = min_price
        self.max_price = max_price
    
    @abimethod
    def set_oracle_address(self, new_oracle: Account) -> None:
        """Set new oracle address (only manager can call)"""
        assert Txn.sender == self.manager, "Only manager can set oracle address"
        self.oracle_address = new_oracle
    
    @abimethod
    def emergency_update(self, new_price: UInt64) -> None:
        """Emergency price update (only manager can call)"""
        assert Txn.sender == self.manager, "Only manager can emergency update"
        
        # Store old price
        self.last_price = self.current_price
        
        # Update current price
        self.current_price = new_price
        self.price_update_time = Global.latest_timestamp
        
        # Increment price history counter
        self.price_history_count += UInt64(1)
    
    @abimethod
    def get_price_history_count(self) -> UInt64:
        """Get number of price updates"""
        return self.price_history_count
    
    @abimethod
    def calculate_price_change_percentage(self, old_price: UInt64, new_price: UInt64) -> UInt64:
        """Calculate price change percentage in basis points"""
        if old_price == UInt64(0):
            return UInt64(0)
        
        price_diff = new_price - old_price
        change_percentage = (price_diff * UInt64(10000)) // old_price
        
        return change_percentage
    
    @abimethod
    def get_oracle_info(self) -> tuple[Account, Account, UInt64, UInt64]:
        """Get oracle configuration information"""
        return (
            self.oracle_address,
            self.manager,
            self.min_price,
            self.max_price
        )
    
    def _calculate_price_change(self) -> None:
        """Calculate price change percentages"""
        if self.last_price > UInt64(0):
            # Calculate percentage change in basis points
            price_diff = self.current_price - self.last_price
            change_percentage = (price_diff * UInt64(10000)) // self.last_price
            
            # Update price change tracking (simplified)
            self.price_change_24h = change_percentage
            self.price_change_7d = change_percentage
            self.price_change_30d = change_percentage
