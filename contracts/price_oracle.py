"""
Price Oracle Contract - Algorand Smart Contract
Manages gold price updates and provides price data to other contracts.
"""

from pyteal import *

def price_oracle():
    """Main price oracle contract logic"""
    
    # Global state keys
    CURRENT_PRICE = Bytes("current_price")
    PRICE_UPDATE_TIME = Bytes("price_update_time")
    ORACLE_ADDRESS = Bytes("oracle_address")
    MANAGER = Bytes("manager")
    PRICE_HISTORY = Bytes("price_history")
    
    # Application creation
    def on_creation():
        return Seq([
            # Set global state
            App.globalPut(CURRENT_PRICE, Int(50000)),  # 0.05 ALGO per vGold (in microALGO)
            App.globalPut(PRICE_UPDATE_TIME, Global.latest_timestamp()),
            App.globalPut(ORACLE_ADDRESS, Txn.sender()),
            App.globalPut(MANAGER, Txn.sender()),
            App.globalPut(PRICE_HISTORY, Int(0)),  # Counter for price history
            
            Approve()
        ])
    
    # Update price (only by oracle address)
    def update_price():
        return Seq([
            # Check if caller is authorized oracle
            Assert(Txn.sender() == App.globalGet(ORACLE_ADDRESS)),
            
            # Get new price from application args
            new_price = Btoi(Txn.application_args[1]),
            
            # Validate price is reasonable (between 0.001 and 1 ALGO per vGold)
            Assert(new_price >= Int(1000)),  # 0.001 ALGO
            Assert(new_price <= Int(1000000)),  # 1 ALGO
            
            # Store old price in history
            old_price = App.globalGet(CURRENT_PRICE),
            App.localPut(Int(0), Bytes("old_price"), old_price),
            
            # Update current price
            App.globalPut(CURRENT_PRICE, new_price),
            App.globalPut(PRICE_UPDATE_TIME, Global.latest_timestamp()),
            
            # Increment price history counter
            App.globalPut(PRICE_HISTORY, App.globalGet(PRICE_HISTORY) + Int(1)),
            
            Approve()
        ])
    
    # Get current price
    def get_price():
        return Seq([
            # Return current price
            App.localPut(Int(0), Bytes("price"), App.globalGet(CURRENT_PRICE)),
            App.localPut(Int(0), Bytes("timestamp"), App.globalGet(PRICE_UPDATE_TIME)),
            Approve()
        ])
    
    # Get price history
    def get_price_history():
        return Seq([
            # Return price history count
            App.localPut(Int(0), Bytes("history_count"), App.globalGet(PRICE_HISTORY)),
            Approve()
        ])
    
    # Update oracle address (manager only)
    def update_oracle():
        return Seq([
            # Check if caller is manager
            Assert(Txn.sender() == App.globalGet(MANAGER)),
            
            # Update oracle address
            App.globalPut(ORACLE_ADDRESS, Txn.application_args[1]),
            
            Approve()
        ])
    
    # Emergency price update (manager only)
    def emergency_update():
        return Seq([
            # Check if caller is manager
            Assert(Txn.sender() == App.globalGet(MANAGER)),
            
            # Get new price from application args
            new_price = Btoi(Txn.application_args[1]),
            
            # Update current price
            App.globalPut(CURRENT_PRICE, new_price),
            App.globalPut(PRICE_UPDATE_TIME, Global.latest_timestamp()),
            
            Approve()
        ])
    
    # Calculate price change percentage
    def get_price_change():
        return Seq([
            # Get current and previous prices
            current_price = App.globalGet(CURRENT_PRICE),
            old_price = App.localGet(Int(0), Bytes("old_price")),
            
            # Calculate percentage change
            price_diff = current_price - old_price,
            change_percentage = price_diff * Int(10000) / old_price,  # In basis points
            
            App.localPut(Int(0), Bytes("change_percentage"), change_percentage),
            Approve()
        ])
    
    # Set price bounds (manager only)
    def set_price_bounds():
        return Seq([
            # Check if caller is manager
            Assert(Txn.sender() == App.globalGet(MANAGER)),
            
            # Store price bounds
            min_price = Btoi(Txn.application_args[1]),
            max_price = Btoi(Txn.application_args[2]),
            
            App.globalPut(Bytes("min_price"), min_price),
            App.globalPut(Bytes("max_price"), max_price),
            
            Approve()
        ])
    
    # Validate price within bounds
    def validate_price():
        return Seq([
            # Get price and bounds
            price = Btoi(Txn.application_args[1]),
            min_price = App.globalGet(Bytes("min_price")),
            max_price = App.globalGet(Bytes("max_price")),
            
            # Check if price is within bounds
            is_valid = And(price >= min_price, price <= max_price),
            
            App.localPut(Int(0), Bytes("is_valid"), If(is_valid, Int(1), Int(0))),
            Approve()
        ])
    
    # Main router
    def main():
        return Cond(
            [Txn.application_id() == Int(0), on_creation()],
            [Txn.on_completion() == OnComplete.NoOp, 
             Cond(
                [Txn.application_args[0] == Bytes("update"), update_price()],
                [Txn.application_args[0] == Bytes("get_price"), get_price()],
                [Txn.application_args[0] == Bytes("history"), get_price_history()],
                [Txn.application_args[0] == Bytes("update_oracle"), update_oracle()],
                [Txn.application_args[0] == Bytes("emergency"), emergency_update()],
                [Txn.application_args[0] == Bytes("change"), get_price_change()],
                [Txn.application_args[0] == Bytes("set_bounds"), set_price_bounds()],
                [Txn.application_args[0] == Bytes("validate"), validate_price()],
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
    compiled = compileTeal(price_oracle(), Mode.Application, version=6)
    print(compiled)
