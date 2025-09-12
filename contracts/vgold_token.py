"""
vGold Token Contract - Algorand Smart Contract
A fungible token representing virtual gold with standard token operations.
"""

from pyteal import *

def vgold_token():
    """Main vGold token contract logic"""
    
    # Global state keys
    TOTAL_SUPPLY = Bytes("total_supply")
    DECIMALS = Bytes("decimals")
    NAME = Bytes("name")
    SYMBOL = Bytes("symbol")
    CREATOR = Bytes("creator")
    FREEZE = Bytes("freeze")
    CLAWBACK = Bytes("clawback")
    MANAGER = Bytes("manager")
    RESERVE = Bytes("reserve")
    
    # Local state keys for user balances
    BALANCE = Bytes("balance")
    
    # Application creation
    def on_creation():
        return Seq([
            # Set global state
            App.globalPut(TOTAL_SUPPLY, Int(1000000000)),  # 1B vGold tokens
            App.globalPut(DECIMALS, Int(6)),  # 6 decimals
            App.globalPut(NAME, Bytes("Virtual Gold")),
            App.globalPut(SYMBOL, Bytes("vGOLD")),
            App.globalPut(CREATOR, Txn.sender()),
            App.globalPut(FREEZE, Global.zero_address()),
            App.globalPut(CLAWBACK, Global.zero_address()),
            App.globalPut(MANAGER, Txn.sender()),
            App.globalPut(RESERVE, Txn.sender()),
            
            # Initialize creator balance
            App.localPut(Int(0), BALANCE, Int(1000000000)),
            
            Approve()
        ])
    
    # Transfer tokens between accounts
    def transfer():
        return Seq([
            # Check if sender has sufficient balance
            Assert(App.localGet(Int(0), BALANCE) >= Btoi(Txn.application_args[1])),
            
            # Deduct from sender
            App.localPut(Int(0), BALANCE, 
                        App.localGet(Int(0), BALANCE) - Btoi(Txn.application_args[1])),
            
            # Add to receiver
            App.localPut(Int(1), BALANCE, 
                        App.localGet(Int(1), BALANCE) + Btoi(Txn.application_args[1])),
            
            Approve()
        ])
    
    # Mint new tokens (only by manager)
    def mint():
        return Seq([
            # Check if caller is manager
            Assert(Txn.sender() == App.globalGet(MANAGER)),
            
            # Update total supply
            App.globalPut(TOTAL_SUPPLY, 
                         App.globalGet(TOTAL_SUPPLY) + Btoi(Txn.application_args[1])),
            
            # Add to recipient
            App.localPut(Int(1), BALANCE, 
                        App.localGet(Int(1), BALANCE) + Btoi(Txn.application_args[1])),
            
            Approve()
        ])
    
    # Burn tokens
    def burn():
        return Seq([
            # Check if sender has sufficient balance
            Assert(App.localGet(Int(0), BALANCE) >= Btoi(Txn.application_args[1])),
            
            # Deduct from sender
            App.localPut(Int(0), BALANCE, 
                        App.localGet(Int(0), BALANCE) - Btoi(Txn.application_args[1])),
            
            # Update total supply
            App.globalPut(TOTAL_SUPPLY, 
                         App.globalGet(TOTAL_SUPPLY) - Btoi(Txn.application_args[1])),
            
            Approve()
        ])
    
    # Get balance of an account
    def get_balance():
        return Seq([
            App.localPut(Int(0), BALANCE, App.localGet(Int(1), BALANCE)),
            Approve()
        ])
    
    # Main router
    def main():
        return Cond(
            [Txn.application_id() == Int(0), on_creation()],
            [Txn.on_completion() == OnComplete.NoOp, 
             Cond(
                [Txn.application_args[0] == Bytes("transfer"), transfer()],
                [Txn.application_args[0] == Bytes("mint"), mint()],
                [Txn.application_args[0] == Bytes("burn"), burn()],
                [Txn.application_args[0] == Bytes("balance"), get_balance()],
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
    compiled = compileTeal(vgold_token(), Mode.Application, version=6)
    print(compiled)
