"""
Deployment configuration for vGold Token Contract
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
from vgold_token import VGoldToken


def deploy_vgold_token() -> ApplicationClient:
    """Deploy vGold Token Contract"""
    
    # Get the default account for deployment
    account = get_localnet_default_account()
    
    # Get Algod client
    algod_client = get_algod_client()
    
    # Create application client
    app_client = ApplicationClient(
        algod_client=algod_client,
        app_spec=VGoldToken(),
        signer=account,
    )
    
    # Deploy the contract
    app_client.deploy(
        create_args=[],
        allow_update=True,
        allow_delete=True,
    )
    
    print(f"✅ vGold Token deployed successfully!")
    print(f"   App ID: {app_client.app_id}")
    print(f"   Address: {app_client.app_address}")
    print(f"   Creator: {account.address}")
    
    return app_client


if __name__ == "__main__":
    deploy_vgold_token()
