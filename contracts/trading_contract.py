"""
Trading Contract - Algorand Smart Contract
Handles buy/sell operations for vGold tokens with ALGO.
"""

from pyteal import *

def trading_contract():
    """Main trading contract logic"""
    
    # Global state keys
    VGOLD_APP_ID = Bytes("vgold_app_id")
    PRICE_ORACLE = Bytes("price_oracle")
    TRADING_FEE = Bytes("trading_fee")
    MANAGER = Bytes("manager")
    TREASURY = Bytes("treasury")
    
    # Local state keys
    ALGO_BALANCE = Bytes("algo_balance")
    VGOLD_BALANCE = Bytes("vgold_balance")
    
    # Application creation
    def on_creation():
        return Seq([
            # Set global state
            App.globalPut(VGOLD_APP_ID, Btoi(Txn.application_args[0])),
            App.globalPut(PRICE_ORACLE, Txn.application_args[1]),
            App.globalPut(TRADING_FEE, Int(25)),  # 0.25% fee (25 basis points)
            App.globalPut(MANAGER, Txn.sender()),
            App.globalPut(TREASURY, Txn.sender()),
            
            Approve()
        ])
    
    # Buy vGold with ALGO
    def buy_vgold():
        return Seq([
            # Get current price from oracle
            # For now, use a fixed price (0.05 ALGO per vGold)
            # In production, this would call the price oracle contract
            price_per_vgold = Int(50000),  # 0.05 ALGO in microALGO
            
            # Calculate vGold amount to receive
            algo_amount = Txn.amount(),
            vgold_amount = algo_amount * Int(1000000) / price_per_vgold,  # Convert to vGold (6 decimals)
            
            # Calculate trading fee
            fee_amount = vgold_amount * App.globalGet(TRADING_FEE) / Int(10000),
            net_vgold = vgold_amount - fee_amount,
            
            # Transfer ALGO to contract
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: Global.current_application_address(),
                TxnField.amount: algo_amount,
                TxnField.sender: Txn.sender(),
            }),
            InnerTxnBuilder.Submit(),
            
            # Mint vGold tokens to buyer
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.ApplicationCall,
                TxnField.application_id: App.globalGet(VGOLD_APP_ID),
                TxnField.application_args: [Bytes("mint"), Itob(net_vgold)],
                TxnField.sender: Global.current_application_address(),
                TxnField.accounts: [Txn.sender()],
            }),
            InnerTxnBuilder.Submit(),
            
            # Update local state
            App.localPut(Int(0), ALGO_BALANCE, 
                        App.localGet(Int(0), ALGO_BALANCE) + algo_amount),
            
            Approve()
        ])
    
    # Sell vGold for ALGO
    def sell_vgold():
        return Seq([
            # Get current price from oracle
            price_per_vgold = Int(50000),  # 0.05 ALGO in microALGO
            
            # Calculate ALGO amount to receive
            vgold_amount = Btoi(Txn.application_args[1]),
            algo_amount = vgold_amount * price_per_vgold / Int(1000000),  # Convert to microALGO
            
            # Calculate trading fee
            fee_amount = algo_amount * App.globalGet(TRADING_FEE) / Int(10000),
            net_algo = algo_amount - fee_amount,
            
            # Check if contract has sufficient ALGO
            Assert(Balance(Global.current_application_address()) >= net_algo),
            
            # Burn vGold tokens from seller
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.ApplicationCall,
                TxnField.application_id: App.globalGet(VGOLD_APP_ID),
                TxnField.application_args: [Bytes("burn"), Itob(vgold_amount)],
                TxnField.sender: Txn.sender(),
            }),
            InnerTxnBuilder.Submit(),
            
            # Transfer ALGO to seller
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: Txn.sender(),
                TxnField.amount: net_algo,
                TxnField.sender: Global.current_application_address(),
            }),
            InnerTxnBuilder.Submit(),
            
            # Update local state
            App.localPut(Int(0), ALGO_BALANCE, 
                        App.localGet(Int(0), ALGO_BALANCE) - net_algo),
            
            Approve()
        ])
    
    # Update price oracle
    def update_oracle():
        return Seq([
            # Check if caller is manager
            Assert(Txn.sender() == App.globalGet(MANAGER)),
            
            # Update oracle address
            App.globalPut(PRICE_ORACLE, Txn.application_args[1]),
            
            Approve()
        ])
    
    # Update trading fee
    def update_fee():
        return Seq([
            # Check if caller is manager
            Assert(Txn.sender() == App.globalGet(MANAGER)),
            
            # Update trading fee (in basis points)
            App.globalPut(TRADING_FEE, Btoi(Txn.application_args[1])),
            
            Approve()
        ])
    
    # Withdraw ALGO from contract (manager only)
    def withdraw_algo():
        return Seq([
            # Check if caller is manager
            Assert(Txn.sender() == App.globalGet(MANAGER)),
            
            # Transfer ALGO to treasury
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.Payment,
                TxnField.receiver: App.globalGet(TREASURY),
                TxnField.amount: Txn.amount(),
                TxnField.sender: Global.current_application_address(),
            }),
            InnerTxnBuilder.Submit(),
            
            Approve()
        ])
    
    # Get current price
    def get_price():
        return Seq([
            # Return current price (in microALGO per vGold)
            App.localPut(Int(0), Bytes("price"), Int(50000)),
            Approve()
        ])
    
    # Main router
    def main():
        return Cond(
            [Txn.application_id() == Int(0), on_creation()],
            [Txn.on_completion() == OnComplete.NoOp, 
             Cond(
                [Txn.application_args[0] == Bytes("buy"), buy_vgold()],
                [Txn.application_args[0] == Bytes("sell"), sell_vgold()],
                [Txn.application_args[0] == Bytes("update_oracle"), update_oracle()],
                [Txn.application_args[0] == Bytes("update_fee"), update_fee()],
                [Txn.application_args[0] == Bytes("withdraw"), withdraw_algo()],
                [Txn.application_args[0] == Bytes("price"), get_price()],
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
    compiled = compileTeal(trading_contract(), Mode.Application, version=6)
    print(compiled)
