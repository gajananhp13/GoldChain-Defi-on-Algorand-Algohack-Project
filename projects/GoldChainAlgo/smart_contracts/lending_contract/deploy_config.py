"""
Deployment configuration for Lending Contract
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
from .contract import LendingContract


def deploy_lending_contract(vgold_app_id: int) -> ApplicationClient:
    """Deploy Lending Contract"""
    
    # Get the default account for deployment
    account = get_localnet_default_account()
    
    # Get Algod client
    algod_client = get_algod_client()
    
    # Create application client
    app_client = ApplicationClient(
        algod_client=algod_client,
        app_spec=LendingContract(),
        signer=account,
    )
    
    # Deploy the contract
    app_client.deploy(
        create_args=[],
        allow_update=True,
        allow_delete=True,
    )
    
    # Initialize the contract with vGold app ID
    app_client.call(
        LendingContract.initialize,
        vgold_app_id=vgold_app_id,
    )
    
    print(f"✅ Lending Contract deployed successfully!")
    print(f"   App ID: {app_client.app_id}")
    print(f"   Address: {app_client.app_address}")
    print(f"   Creator: {account.address}")
    print(f"   vGold App ID: {vgold_app_id}")
    
    return app_client


if __name__ == "__main__":
    # This would be called with actual values after vGold is deployed
    print("Lending Contract deployment script")
    print("Call deploy_lending_contract(vgold_app_id) with actual values")
