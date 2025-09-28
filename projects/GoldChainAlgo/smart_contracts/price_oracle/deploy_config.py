"""
Deployment configuration for Price Oracle Contract
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
from .contract import PriceOracle


def deploy_price_oracle() -> ApplicationClient:
    """Deploy Price Oracle Contract"""
    
    # Get the default account for deployment
    account = get_localnet_default_account()
    
    # Get Algod client
    algod_client = get_algod_client()
    
    # Create application client
    app_client = ApplicationClient(
        algod_client=algod_client,
        app_spec=PriceOracle(),
        signer=account,
    )
    
    # Deploy the contract
    app_client.deploy(
        create_args=[],
        allow_update=True,
        allow_delete=True,
    )
    
    print(f"✅ Price Oracle deployed successfully!")
    print(f"   App ID: {app_client.app_id}")
    print(f"   Address: {app_client.app_address}")
    print(f"   Creator: {account.address}")
    print(f"   Oracle Address: {account.address}")
    
    return app_client


if __name__ == "__main__":
    deploy_price_oracle()
