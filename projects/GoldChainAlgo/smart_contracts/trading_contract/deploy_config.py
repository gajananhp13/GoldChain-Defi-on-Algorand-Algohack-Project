"""
Deployment configuration for Trading Contract
"""

from algokit_utils import (
    ApplicationClient,
    ApplicationSpecification,
    get_account,
    get_algod_client,
    get_indexer_client,
    deploy,
    get_localnet_default_account,
)
from algopy import Account
from trading_contract import TradingContract


def deploy_trading_contract(vgold_app_id: int, oracle_address: str) -> ApplicationClient:
    """Deploy Trading Contract"""
    
    # Get the default account for deployment
    account = get_localnet_default_account()
    
    # Get Algod client
    algod_client = get_algod_client()
    
    # Create application client
    app_client = ApplicationClient(
        algod_client=algod_client,
        app_spec=TradingContract(),
        signer=account,
    )
    
    # Deploy the contract
    app_client.deploy(
        create_args=[],
        allow_update=True,
        allow_delete=True,
    )
    
    # Initialize the contract with vGold app ID and oracle address
    app_client.call(
        TradingContract.initialize,
        vgold_app_id=vgold_app_id,
        oracle_address=Account(oracle_address),
    )
    
    print(f"✅ Trading Contract deployed successfully!")
    print(f"   App ID: {app_client.app_id}")
    print(f"   Address: {app_client.app_address}")
    print(f"   Creator: {account.address}")
    print(f"   vGold App ID: {vgold_app_id}")
    print(f"   Oracle Address: {oracle_address}")
    
    return app_client


if __name__ == "__main__":
    # This would be called with actual values after vGold and Oracle are deployed
    print("Trading Contract deployment script")
    print("Call deploy_trading_contract(vgold_app_id, oracle_address) with actual values")
