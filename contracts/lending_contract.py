"""
Lending Contract - Algorand Smart Contract
Handles lending and borrowing operations with collateral management.
"""

from pyteal import *

def lending_contract():
    """Main lending contract logic"""
    
    # Global state keys
    VGOLD_APP_ID = Bytes("vgold_app_id")
    MANAGER = Bytes("manager")
    TREASURY = Bytes("treasury")
    MIN_COLLATERAL_RATIO = Bytes("min_collateral_ratio")
    LIQUIDATION_THRESHOLD = Bytes("liquidation_threshold")
    
    # Local state keys for positions
    LEND_AMOUNT = Bytes("lend_amount")
    LEND_START = Bytes("lend_start")
    LEND_DURATION = Bytes("lend_duration")
    LEND_INTEREST = Bytes("lend_interest")
    LEND_STATUS = Bytes("lend_status")
    
    BORROW_AMOUNT = Bytes("borrow_amount")
    BORROW_COLLATERAL = Bytes("borrow_collateral")
    BORROW_START = Bytes("borrow_start")
    BORROW_DURATION = Bytes("borrow_duration")
    BORROW_INTEREST = Bytes("borrow_interest")
    BORROW_STATUS = Bytes("borrow_status")
    
    # Application creation
    def on_creation():
        return Seq([
            # Set global state
            App.globalPut(VGOLD_APP_ID, Btoi(Txn.application_args[0])),
            App.globalPut(MANAGER, Txn.sender()),
            App.globalPut(TREASURY, Txn.sender()),
            App.globalPut(MIN_COLLATERAL_RATIO, Int(150)),  # 150% collateral ratio
            App.globalPut(LIQUIDATION_THRESHOLD, Int(120)),  # 120% liquidation threshold
            
            Approve()
        ])
    
    # Lend vGold tokens
    def lend_vgold():
        return Seq([
            # Get lending parameters
            amount = Btoi(Txn.application_args[1]),
            duration_days = Btoi(Txn.application_args[2]),
            
            # Calculate interest rate based on duration
            interest_rate = If(
                duration_days <= Int(30), Int(400),  # 4% APY
                If(
                    duration_days <= Int(90), Int(550),  # 5.5% APY
                    Int(700)  # 7% APY
                )
            ),
            
            # Transfer vGold from lender to contract
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.ApplicationCall,
                TxnField.application_id: App.globalGet(VGOLD_APP_ID),
                TxnField.application_args: [Bytes("transfer"), Itob(amount)],
                TxnField.sender: Txn.sender(),
                TxnField.accounts: [Global.current_application_address()],
            }),
            InnerTxnBuilder.Submit(),
            
            # Store lending position
            App.localPut(Int(0), LEND_AMOUNT, amount),
            App.localPut(Int(0), LEND_START, Global.latest_timestamp()),
            App.localPut(Int(0), LEND_DURATION, duration_days * Int(86400)),  # Convert days to seconds
            App.localPut(Int(0), LEND_INTEREST, interest_rate),
            App.localPut(Int(0), LEND_STATUS, Int(1)),  # Active
            
            Approve()
        ])
    
    # Borrow vGold with ALGO collateral
    def borrow_vgold():
        return Seq([
            # Get borrowing parameters
            amount = Btoi(Txn.application_args[1]),
            duration_days = Btoi(Txn.application_args[2]),
            
            # Calculate interest rate based on duration
            interest_rate = If(
                duration_days <= Int(30), Int(600),  # 6% APY
                If(
                    duration_days <= Int(90), Int(750),  # 7.5% APY
                    Int(900)  # 9% APY
                )
            ),
            
            # Calculate required collateral (150% of borrowed amount)
            collateral_ratio = App.globalGet(MIN_COLLATERAL_RATIO),
            required_collateral = amount * collateral_ratio / Int(100),
            
            # Check if provided collateral is sufficient
            Assert(Txn.amount() >= required_collateral),
            
            # Transfer ALGO collateral to contract
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: Global.current_application_address(),
                TxnField.amount: Txn.amount(),
                TxnField.sender: Txn.sender(),
            }),
            InnerTxnBuilder.Submit(),
            
            # Mint vGold tokens to borrower
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.ApplicationCall,
                TxnField.application_id: App.globalGet(VGOLD_APP_ID),
                TxnField.application_args: [Bytes("mint"), Itob(amount)],
                TxnField.sender: Global.current_application_address(),
                TxnField.accounts: [Txn.sender()],
            }),
            InnerTxnBuilder.Submit(),
            
            # Store borrowing position
            App.localPut(Int(0), BORROW_AMOUNT, amount),
            App.localPut(Int(0), BORROW_COLLATERAL, Txn.amount()),
            App.localPut(Int(0), BORROW_START, Global.latest_timestamp()),
            App.localPut(Int(0), BORROW_DURATION, duration_days * Int(86400)),
            App.localPut(Int(0), BORROW_INTEREST, interest_rate),
            App.localPut(Int(0), BORROW_STATUS, Int(1)),  # Active
            
            Approve()
        ])
    
    # Repay loan and get collateral back
    def repay_loan():
        return Seq([
            # Get position details
            borrow_amount = App.localGet(Int(0), BORROW_AMOUNT),
            borrow_start = App.localGet(Int(0), BORROW_START),
            borrow_duration = App.localGet(Int(0), BORROW_DURATION),
            interest_rate = App.localGet(Int(0), BORROW_INTEREST),
            collateral = App.localGet(Int(0), BORROW_COLLATERAL),
            
            # Calculate interest
            time_elapsed = Global.latest_timestamp() - borrow_start,
            max_duration = borrow_duration,
            actual_duration = If(time_elapsed > max_duration, max_duration, time_elapsed),
            
            # Calculate interest amount (annual rate)
            interest_amount = borrow_amount * interest_rate * actual_duration / (Int(365) * Int(86400) * Int(10000)),
            total_repay = borrow_amount + interest_amount,
            
            # Check if borrower has sufficient vGold
            # This would need to check the vGold balance from the token contract
            
            # Burn vGold tokens from borrower
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.ApplicationCall,
                TxnField.application_id: App.globalGet(VGOLD_APP_ID),
                TxnField.application_args: [Bytes("burn"), Itob(total_repay)],
                TxnField.sender: Txn.sender(),
            }),
            InnerTxnBuilder.Submit(),
            
            # Return collateral to borrower
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: Txn.sender(),
                TxnField.amount: collateral,
                TxnField.sender: Global.current_application_address(),
            }),
            InnerTxnBuilder.Submit(),
            
            # Update position status
            App.localPut(Int(0), BORROW_STATUS, Int(0)),  # Repaid
            
            Approve()
        ])
    
    # Claim lending returns
    def claim_returns():
        return Seq([
            # Get position details
            lend_amount = App.localGet(Int(0), LEND_AMOUNT),
            lend_start = App.localGet(Int(0), LEND_START),
            lend_duration = App.localGet(Int(0), LEND_DURATION),
            interest_rate = App.localGet(Int(0), LEND_INTEREST),
            
            # Check if lending period has ended
            time_elapsed = Global.latest_timestamp() - lend_start,
            Assert(time_elapsed >= lend_duration),
            
            # Calculate interest
            interest_amount = lend_amount * interest_rate * lend_duration / (Int(365) * Int(86400) * Int(10000)),
            total_returns = lend_amount + interest_amount,
            
            # Transfer vGold back to lender
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.ApplicationCall,
                TxnField.application_id: App.globalGet(VGOLD_APP_ID),
                TxnField.application_args: [Bytes("transfer"), Itob(total_returns)],
                TxnField.sender: Global.current_application_address(),
                TxnField.accounts: [Txn.sender()],
            }),
            InnerTxnBuilder.Submit(),
            
            # Update position status
            App.localPut(Int(0), LEND_STATUS, Int(0)),  # Completed
            
            Approve()
        ])
    
    # Liquidate undercollateralized position
    def liquidate():
        return Seq([
            # Check if caller is authorized (manager or anyone if undercollateralized)
            # This is a simplified version - in production, you'd check collateral ratio
            
            # Get position details
            borrow_amount = App.localGet(Int(0), BORROW_AMOUNT),
            collateral = App.localGet(Int(0), BORROW_COLLATERAL),
            
            # Transfer collateral to liquidator (with discount)
            liquidation_discount = Int(5000),  # 5% discount
            liquidator_amount = collateral * (Int(10000) - liquidation_discount) / Int(10000),
            
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: Txn.sender(),
                TxnField.amount: liquidator_amount,
                TxnField.sender: Global.current_application_address(),
            }),
            InnerTxnBuilder.Submit(),
            
            # Update position status
            App.localPut(Int(0), BORROW_STATUS, Int(2)),  # Liquidated
            
            Approve()
        ])
    
    # Get position details
    def get_position():
        return Seq([
            # Return position details based on type
            position_type = Txn.application_args[1],
            
            If(position_type == Bytes("lend"),
                Seq([
                    App.localPut(Int(0), Bytes("amount"), App.localGet(Int(0), LEND_AMOUNT)),
                    App.localPut(Int(0), Bytes("start"), App.localGet(Int(0), LEND_START)),
                    App.localPut(Int(0), Bytes("duration"), App.localGet(Int(0), LEND_DURATION)),
                    App.localPut(Int(0), Bytes("interest"), App.localGet(Int(0), LEND_INTEREST)),
                    App.localPut(Int(0), Bytes("status"), App.localGet(Int(0), LEND_STATUS)),
                ]),
                Seq([
                    App.localPut(Int(0), Bytes("amount"), App.localGet(Int(0), BORROW_AMOUNT)),
                    App.localPut(Int(0), Bytes("collateral"), App.localGet(Int(0), BORROW_COLLATERAL)),
                    App.localPut(Int(0), Bytes("start"), App.localGet(Int(0), BORROW_START)),
                    App.localPut(Int(0), Bytes("duration"), App.localGet(Int(0), BORROW_DURATION)),
                    App.localPut(Int(0), Bytes("interest"), App.localGet(Int(0), BORROW_INTEREST)),
                    App.localPut(Int(0), Bytes("status"), App.localGet(Int(0), BORROW_STATUS)),
                ])
            ),
            
            Approve()
        ])
    
    # Main router
    def main():
        return Cond(
            [Txn.application_id() == Int(0), on_creation()],
            [Txn.on_completion() == OnComplete.NoOp, 
             Cond(
                [Txn.application_args[0] == Bytes("lend"), lend_vgold()],
                [Txn.application_args[0] == Bytes("borrow"), borrow_vgold()],
                [Txn.application_args[0] == Bytes("repay"), repay_loan()],
                [Txn.application_args[0] == Bytes("claim"), claim_returns()],
                [Txn.application_args[0] == Bytes("liquidate"), liquidate()],
                [Txn.application_args[0] == Bytes("position"), get_position()],
                [Int(1), Reject()]
             )],
            [Txn.on_completion() == OnComplete.OptIn, Approve()],
            [Txn.on_completion() == OnComplete.CloseOut, Approve()],
            [Txn.on_completion() == OnComplete.UpdateApplication, 
             Assert(Txn.sender() == App.globalGet(MANAGER)), Approve()],
            [Txn.on_completion() == OnComplete.DeleteApplication, 
             Assert(Txn.sender() == App.globalGet(MANAGER)), Approve()],
            [Int(1), Reject()]
        )
    
    return main()

if __name__ == "__main__":
    # Compile the contract
    compiled = compileTeal(lending_contract(), Mode.Application, version=6)
    print(compiled)
