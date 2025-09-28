"""
Lending Contract - AlgoKit Implementation
Handles lending and borrowing operations with collateral management.
"""

from algopy import ARC4Contract, UInt64, Account, Txn, Global, arc4
from algopy.arc4 import abimethod


class LendingContract(ARC4Contract):
    """Lending Contract - Handles vGold lending and borrowing with ALGO collateral"""
    
    def __init__(self) -> None:
        # Contract configuration
        self.vgold_app_id = UInt64(0)  # Will be set during deployment
        self.manager = Txn.sender
        self.treasury = Txn.sender
        self.min_collateral_ratio = UInt64(150)  # 150% collateral ratio
        self.liquidation_threshold = UInt64(120)  # 120% liquidation threshold
        
        # Lending pools
        self.total_lent = UInt64(0)
        self.total_borrowed = UInt64(0)
        self.total_collateral = UInt64(0)
        
        # Interest rates (in basis points)
        self.lend_rates = {
            UInt64(30): UInt64(400),   # 4% APY for 30 days
            UInt64(60): UInt64(550),  # 5.5% APY for 60 days
            UInt64(90): UInt64(700),  # 7% APY for 90 days
            UInt64(180): UInt64(1000) # 10% APY for 180 days
        }
        
        self.borrow_rates = {
            UInt64(30): UInt64(600),   # 6% APY for 30 days
            UInt64(60): UInt64(750),  # 7.5% APY for 60 days
            UInt64(90): UInt64(900),  # 9% APY for 90 days
            UInt64(180): UInt64(1200) # 12% APY for 180 days
        }
    
    @abimethod
    def initialize(self, vgold_app_id: UInt64) -> None:
        """Initialize contract with vGold app ID"""
        assert Txn.sender == self.manager, "Only manager can initialize"
        self.vgold_app_id = vgold_app_id
    
    @abimethod
    def lend_vgold(self, amount: UInt64, duration_days: UInt64) -> UInt64:
        """Lend vGold tokens and earn interest"""
        # Get interest rate for duration
        interest_rate = self._get_lend_rate(duration_days)
        
        # Calculate interest amount
        interest_amount = self._calculate_interest(amount, interest_rate, duration_days)
        total_returns = amount + interest_amount
        
        # Update lending pool
        self.total_lent += amount
        
        # Store lending position
        self.lend_position[Txn.sender] = {
            'amount': amount,
            'start_time': Global.latest_timestamp,
            'duration': duration_days * UInt64(86400),  # Convert days to seconds
            'interest_rate': interest_rate,
            'status': UInt64(1)  # Active
        }
        
        # In a real implementation, transfer vGold from lender to contract
        
        return total_returns
    
    @abimethod
    def borrow_vgold(self, amount: UInt64, duration_days: UInt64, collateral_algo: UInt64) -> UInt64:
        """Borrow vGold with ALGO collateral"""
        # Get interest rate for duration
        interest_rate = self._get_borrow_rate(duration_days)
        
        # Calculate required collateral (150% of borrowed amount value)
        required_collateral = (amount * self.min_collateral_ratio) // UInt64(100)
        
        # Check if provided collateral is sufficient
        assert collateral_algo >= required_collateral, "Insufficient collateral"
        
        # Calculate interest amount
        interest_amount = self._calculate_interest(amount, interest_rate, duration_days)
        total_repay = amount + interest_amount
        
        # Update borrowing pool
        self.total_borrowed += amount
        self.total_collateral += collateral_algo
        
        # Store borrowing position
        self.borrow_position[Txn.sender] = {
            'amount': amount,
            'collateral': collateral_algo,
            'start_time': Global.latest_timestamp,
            'duration': duration_days * UInt64(86400),
            'interest_rate': interest_rate,
            'status': UInt64(1)  # Active
        }
        
        # In a real implementation:
        # 1. Transfer ALGO collateral to contract
        # 2. Mint vGold tokens to borrower
        
        return total_repay
    
    @abimethod
    def repay_loan(self) -> UInt64:
        """Repay loan and get collateral back"""
        # Get borrowing position
        position = self.borrow_position[Txn.sender]
        assert position['status'] == UInt64(1), "No active loan"
        
        # Calculate repayment amount with interest
        time_elapsed = Global.latest_timestamp - position['start_time']
        max_duration = position['duration']
        actual_duration = min(time_elapsed, max_duration)
        
        interest_amount = self._calculate_interest(
            position['amount'], 
            position['interest_rate'], 
            actual_duration // UInt64(86400)  # Convert back to days
        )
        
        total_repay = position['amount'] + interest_amount
        
        # Update position status
        self.borrow_position[Txn.sender]['status'] = UInt64(0)  # Repaid
        
        # Update pools
        self.total_borrowed -= position['amount']
        self.total_collateral -= position['collateral']
        
        # In a real implementation:
        # 1. Burn vGold tokens from borrower
        # 2. Return ALGO collateral to borrower
        
        return position['collateral']  # Returned collateral amount
    
    @abimethod
    def claim_lending_returns(self) -> UInt64:
        """Claim lending returns after period ends"""
        # Get lending position
        position = self.lend_position[Txn.sender]
        assert position['status'] == UInt64(1), "No active lending position"
        
        # Check if lending period has ended
        time_elapsed = Global.latest_timestamp - position['start_time']
        assert time_elapsed >= position['duration'], "Lending period not ended"
        
        # Calculate total returns
        interest_amount = self._calculate_interest(
            position['amount'],
            position['interest_rate'],
            position['duration'] // UInt64(86400)
        )
        
        total_returns = position['amount'] + interest_amount
        
        # Update position status
        self.lend_position[Txn.sender]['status'] = UInt64(0)  # Completed
        
        # Update pools
        self.total_lent -= position['amount']
        
        # In a real implementation, transfer vGold back to lender
        
        return total_returns
    
    @abimethod
    def liquidate_position(self, borrower: Account) -> UInt64:
        """Liquidate undercollateralized position"""
        position = self.borrow_position[borrower]
        assert position['status'] == UInt64(1), "No active loan to liquidate"
        
        # Check if position is undercollateralized
        # This is simplified - in production, you'd check current price vs collateral
        liquidation_discount = UInt64(5000)  # 5% discount
        liquidator_amount = (position['collateral'] * (UInt64(10000) - liquidation_discount)) // UInt64(10000)
        
        # Update position status
        self.borrow_position[borrower]['status'] = UInt64(2)  # Liquidated
        
        # Update pools
        self.total_borrowed -= position['amount']
        self.total_collateral -= position['collateral']
        
        # In a real implementation, transfer collateral to liquidator
        
        return liquidator_amount
    
    @abimethod
    def get_position_info(self, account: Account, position_type: arc4.String) -> tuple[UInt64, UInt64, UInt64, UInt64, UInt64]:
        """Get position information"""
        if position_type == arc4.String("lend"):
            position = self.lend_position[account]
            return (
                position['amount'],
                position['start_time'],
                position['duration'],
                position['interest_rate'],
                position['status']
            )
        else:  # borrow
            position = self.borrow_position[account]
            return (
                position['amount'],
                position['collateral'],
                position['start_time'],
                position['duration'],
                position['status']
            )
    
    @abimethod
    def get_pool_stats(self) -> tuple[UInt64, UInt64, UInt64]:
        """Get lending pool statistics"""
        return (self.total_lent, self.total_borrowed, self.total_collateral)
    
    @abimethod
    def set_collateral_ratio(self, new_ratio: UInt64) -> None:
        """Set minimum collateral ratio (only manager can call)"""
        assert Txn.sender == self.manager, "Only manager can set collateral ratio"
        assert new_ratio >= UInt64(110), "Collateral ratio too low"  # Min 110%
        
        self.min_collateral_ratio = new_ratio
    
    def _get_lend_rate(self, duration_days: UInt64) -> UInt64:
        """Get lending interest rate for duration"""
        if duration_days <= UInt64(30):
            return self.lend_rates[UInt64(30)]
        elif duration_days <= UInt64(60):
            return self.lend_rates[UInt64(60)]
        elif duration_days <= UInt64(90):
            return self.lend_rates[UInt64(90)]
        else:
            return self.lend_rates[UInt64(180)]
    
    def _get_borrow_rate(self, duration_days: UInt64) -> UInt64:
        """Get borrowing interest rate for duration"""
        if duration_days <= UInt64(30):
            return self.borrow_rates[UInt64(30)]
        elif duration_days <= UInt64(60):
            return self.borrow_rates[UInt64(60)]
        elif duration_days <= UInt64(90):
            return self.borrow_rates[UInt64(90)]
        else:
            return self.borrow_rates[UInt64(180)]
    
    def _calculate_interest(self, principal: UInt64, rate: UInt64, days: UInt64) -> UInt64:
        """Calculate interest amount"""
        # Interest = principal * rate * days / (365 * 10000)
        return (principal * rate * days) // (UInt64(365) * UInt64(10000))
