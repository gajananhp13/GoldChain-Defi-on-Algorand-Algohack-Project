"""
Comprehensive deployment script for all GoldChain smart contracts
Deploys all contracts in the correct order and saves configuration.
"""

import json
import os
from algokit_utils import get_localnet_default_account
from algopy import Account

# Import deployment functions
from smart_contracts.vgold_token.deploy_config import deploy_vgold_token
from smart_contracts.price_oracle.deploy_config import deploy_price_oracle
from smart_contracts.trading_contract.deploy_config import deploy_trading_contract
from smart_contracts.lending_contract.deploy_config import deploy_lending_contract


def deploy_all_contracts():
    """Deploy all GoldChain smart contracts in the correct order"""
    
    print("🚀 Starting GoldChain Smart Contract Deployment")
    print("=" * 60)
    
    # Get deployment account
    account = get_localnet_default_account()
    print(f"Deployer: {account.address}")
    print()
    
    deployed_contracts = {}
    
    try:
        # 1. Deploy vGold Token Contract
        print("1️⃣ Deploying vGold Token Contract...")
        vgold_client = deploy_vgold_token()
        deployed_contracts['vgold'] = {
            'app_id': vgold_client.app_id,
            'address': vgold_client.app_address,
            'client': vgold_client
        }
        print()
        
        # 2. Deploy Price Oracle Contract
        print("2️⃣ Deploying Price Oracle Contract...")
        oracle_client = deploy_price_oracle()
        deployed_contracts['oracle'] = {
            'app_id': oracle_client.app_id,
            'address': oracle_client.app_address,
            'client': oracle_client
        }
        print()
        
        # 3. Deploy Trading Contract
        print("3️⃣ Deploying Trading Contract...")
        trading_client = deploy_trading_contract(
            vgold_app_id=deployed_contracts['vgold']['app_id'],
            oracle_address=deployed_contracts['oracle']['address']
        )
        deployed_contracts['trading'] = {
            'app_id': trading_client.app_id,
            'address': trading_client.app_address,
            'client': trading_client
        }
        print()
        
        # 4. Deploy Lending Contract
        print("4️⃣ Deploying Lending Contract...")
        lending_client = deploy_lending_contract(
            vgold_app_id=deployed_contracts['vgold']['app_id']
        )
        deployed_contracts['lending'] = {
            'app_id': lending_client.app_id,
            'address': lending_client.app_address,
            'client': lending_client
        }
        print()
        
        # 5. Save configuration
        save_deployment_config(deployed_contracts, account.address)
        
        # 6. Print summary
        print_deployment_summary(deployed_contracts)
        
        print("\n🎉 All contracts deployed successfully!")
        print("You can now use Lora explorer to view and interact with the contracts.")
        
        return deployed_contracts
        
    except Exception as e:
        print(f"❌ Deployment failed: {str(e)}")
        raise


def save_deployment_config(contracts: dict, deployer_address: str):
    """Save deployment configuration to files"""
    
    # Create deployment directory
    os.makedirs('deployed', exist_ok=True)
    
    # Prepare configuration
    config = {
        "network": "localnet",
        "deployer_address": deployer_address,
        "contracts": {
            "vgold": {
                "app_id": contracts['vgold']['app_id'],
                "address": contracts['vgold']['address']
            },
            "trading": {
                "app_id": contracts['trading']['app_id'],
                "address": contracts['trading']['address']
            },
            "lending": {
                "app_id": contracts['lending']['app_id'],
                "address": contracts['lending']['address']
            },
            "oracle": {
                "app_id": contracts['oracle']['app_id'],
                "address": contracts['oracle']['address']
            }
        }
    }
    
    # Save JSON configuration
    with open('deployed/contracts.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    # Save environment variables for frontend
    env_content = f"""# GoldChain Smart Contract Addresses - LocalNet
REACT_APP_VGOLD_APP_ID={contracts['vgold']['app_id']}
REACT_APP_TRADING_APP_ID={contracts['trading']['app_id']}
REACT_APP_LENDING_APP_ID={contracts['lending']['app_id']}
REACT_APP_ORACLE_APP_ID={contracts['oracle']['app_id']}
REACT_APP_VGOLD_ADDRESS={contracts['vgold']['address']}
REACT_APP_TRADING_ADDRESS={contracts['trading']['address']}
REACT_APP_LENDING_ADDRESS={contracts['lending']['address']}
REACT_APP_ORACLE_ADDRESS={contracts['oracle']['address']}
"""
    
    with open('deployed/.env', 'w') as f:
        f.write(env_content)
    
    print("📁 Configuration saved to:")
    print("   - deployed/contracts.json")
    print("   - deployed/.env")


def print_deployment_summary(contracts: dict):
    """Print deployment summary"""
    
    print("\n" + "=" * 60)
    print("GOLDCHAIN SMART CONTRACT DEPLOYMENT SUMMARY")
    print("=" * 60)
    
    print(f"Network: LocalNet")
    print(f"Deployer: {get_localnet_default_account().address}")
    
    print("\n📋 Deployed Contracts:")
    print(f"  🪙 vGold Token    - App ID: {contracts['vgold']['app_id']}")
    print(f"  💱 Trading        - App ID: {contracts['trading']['app_id']}")
    print(f"  💰 Lending        - App ID: {contracts['lending']['app_id']}")
    print(f"  📊 Price Oracle   - App ID: {contracts['oracle']['app_id']}")
    
    print("\n📍 Contract Addresses:")
    print(f"  🪙 vGold Token    - {contracts['vgold']['address']}")
    print(f"  💱 Trading        - {contracts['trading']['address']}")
    print(f"  💰 Lending        - {contracts['lending']['address']}")
    print(f"  📊 Price Oracle   - {contracts['oracle']['address']}")
    
    print("\n🔗 Lora Explorer Links:")
    print(f"  🪙 vGold Token    - http://localhost:3000/application/{contracts['vgold']['app_id']}")
    print(f"  💱 Trading        - http://localhost:3000/application/{contracts['trading']['app_id']}")
    print(f"  💰 Lending        - http://localhost:3000/application/{contracts['lending']['app_id']}")
    print(f"  📊 Price Oracle   - http://localhost:3000/application/{contracts['oracle']['app_id']}")
    
    print("=" * 60)


def test_contracts(contracts: dict):
    """Test basic functionality of deployed contracts"""
    
    print("\n🧪 Testing Contract Functionality...")
    
    try:
        # Test vGold token
        print("Testing vGold Token...")
        vgold_client = contracts['vgold']['client']
        total_supply = vgold_client.call(vgold_client.app_spec.get_total_supply)
        print(f"   Total Supply: {total_supply}")
        
        # Test price oracle
        print("Testing Price Oracle...")
        oracle_client = contracts['oracle']['client']
        current_price = oracle_client.call(oracle_client.app_spec.get_current_price)
        print(f"   Current Price: {current_price} microALGO")
        
        # Test trading contract
        print("Testing Trading Contract...")
        trading_client = contracts['trading']['client']
        price = trading_client.call(trading_client.app_spec.get_current_price)
        print(f"   Trading Price: {price} microALGO")
        
        # Test lending contract
        print("Testing Lending Contract...")
        lending_client = contracts['lending']['client']
        stats = lending_client.call(lending_client.app_spec.get_pool_stats)
        print(f"   Pool Stats: {stats}")
        
        print("✅ All contract tests passed!")
        
    except Exception as e:
        print(f"❌ Contract testing failed: {str(e)}")


if __name__ == "__main__":
    # Deploy all contracts
    contracts = deploy_all_contracts()
    
    # Test contracts
    test_contracts(contracts)
    
    print("\n🎯 Next Steps:")
    print("1. Install Docker to run LocalNet")
    print("2. Run 'algokit localnet start' to start the local network")
    print("3. Run 'algokit explore' to open Lora explorer")
    print("4. Use the deployed contract addresses in your frontend")
    print("5. Test all features through the web interface")
