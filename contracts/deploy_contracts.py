"""
Deployment Script for GoldChain Smart Contracts
Deploys all contracts and sets up the complete system.
"""

import json
import os
from typing import Dict, List, Tuple
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk import transaction
from algosdk.encoding import encode_address
import base64

# Import compiled contracts
from vgold_token import vgold_token
from trading_contract import trading_contract
from lending_contract import lending_contract
from price_oracle import price_oracle

class ContractDeployer:
    """Handles deployment of all GoldChain smart contracts"""
    
    def __init__(self, algod_client: algod.AlgodClient, manager_mnemonic: str):
        self.algod_client = algod_client
        self.manager_private_key = mnemonic.to_private_key(manager_mnemonic)
        self.manager_address = account.address_from_private_key(self.manager_private_key)
        
        # Contract addresses will be set after deployment
        self.contract_addresses = {}
        
    def compile_contract(self, contract_teal: str) -> bytes:
        """Compile TEAL contract to bytes"""
        try:
            compiled = self.algod_client.compile(contract_teal)
            return base64.b64decode(compiled['result'])
        except Exception as e:
            raise Exception(f"Failed to compile contract: {str(e)}")
    
    def deploy_contract(self, contract_teal: str, app_args: List[bytes] = None) -> Tuple[int, str]:
        """Deploy a smart contract and return app ID and address"""
        try:
            # Compile contract
            compiled_program = self.compile_contract(contract_teal)
            
            # Get suggested parameters
            params = self.algod_client.suggested_params()
            
            # Create application creation transaction
            txn = transaction.ApplicationCreateTxn(
                sender=self.manager_address,
                sp=params,
                on_complete=transaction.OnComplete.NoOpOC,
                approval_program=compiled_program,
                clear_program=compiled_program,  # Using same program for both
                global_schema=transaction.StateSchema(num_uints=10, num_byte_slices=10),
                local_schema=transaction.StateSchema(num_uints=10, num_byte_slices=10),
                app_args=app_args or []
            )
            
            # Sign and submit transaction
            signed_txn = txn.sign(self.manager_private_key)
            tx_id = self.algod_client.send_transaction(signed_txn)
            
            # Wait for confirmation
            transaction.wait_for_confirmation(self.algod_client, tx_id, 4)
            
            # Get application info
            app_info = self.algod_client.pending_transaction_info(tx_id)
            app_id = app_info['application-index']
            app_address = transaction.get_application_address(app_id)
            
            return app_id, app_address
            
        except Exception as e:
            raise Exception(f"Failed to deploy contract: {str(e)}")
    
    def deploy_vgold_token(self) -> Tuple[int, str]:
        """Deploy vGold token contract"""
        print("Deploying vGold Token Contract...")
        
        # Compile the contract
        from pyteal import compileTeal, Mode
        contract_teal = compileTeal(vgold_token(), Mode.Application, version=6)
        
        # Deploy contract
        app_id, app_address = self.deploy_contract(contract_teal)
        
        print(f"vGold Token deployed - App ID: {app_id}, Address: {app_address}")
        return app_id, app_address
    
    def deploy_price_oracle(self) -> Tuple[int, str]:
        """Deploy price oracle contract"""
        print("Deploying Price Oracle Contract...")
        
        # Compile the contract
        from pyteal import compileTeal, Mode
        contract_teal = compileTeal(price_oracle(), Mode.Application, version=6)
        
        # Deploy contract
        app_id, app_address = self.deploy_contract(contract_teal)
        
        print(f"Price Oracle deployed - App ID: {app_id}, Address: {app_address}")
        return app_id, app_address
    
    def deploy_trading_contract(self, vgold_app_id: int, oracle_app_id: int) -> Tuple[int, str]:
        """Deploy trading contract"""
        print("Deploying Trading Contract...")
        
        # Compile the contract
        from pyteal import compileTeal, Mode
        contract_teal = compileTeal(trading_contract(), Mode.Application, version=6)
        
        # Deploy with vGold app ID and oracle address as arguments
        app_args = [
            vgold_app_id.to_bytes(8, 'big'),
            encode_address(self.contract_addresses['oracle'])
        ]
        
        app_id, app_address = self.deploy_contract(contract_teal, app_args)
        
        print(f"Trading Contract deployed - App ID: {app_id}, Address: {app_address}")
        return app_id, app_address
    
    def deploy_lending_contract(self, vgold_app_id: int) -> Tuple[int, str]:
        """Deploy lending contract"""
        print("Deploying Lending Contract...")
        
        # Compile the contract
        from pyteal import compileTeal, Mode
        contract_teal = compileTeal(lending_contract(), Mode.Application, version=6)
        
        # Deploy with vGold app ID as argument
        app_args = [vgold_app_id.to_bytes(8, 'big')]
        
        app_id, app_address = self.deploy_contract(contract_teal, app_args)
        
        print(f"Lending Contract deployed - App ID: {app_id}, Address: {app_address}")
        return app_id, app_address
    
    def setup_contracts(self):
        """Deploy all contracts in the correct order"""
        print("Starting GoldChain Smart Contract Deployment...")
        print(f"Manager Address: {self.manager_address}")
        
        try:
            # 1. Deploy vGold Token Contract
            vgold_app_id, vgold_address = self.deploy_vgold_token()
            self.contract_addresses['vgold'] = vgold_address
            self.contract_addresses['vgold_app_id'] = vgold_app_id
            
            # 2. Deploy Price Oracle Contract
            oracle_app_id, oracle_address = self.deploy_price_oracle()
            self.contract_addresses['oracle'] = oracle_address
            self.contract_addresses['oracle_app_id'] = oracle_app_id
            
            # 3. Deploy Trading Contract
            trading_app_id, trading_address = self.deploy_trading_contract(vgold_app_id, oracle_app_id)
            self.contract_addresses['trading'] = trading_address
            self.contract_addresses['trading_app_id'] = trading_app_id
            
            # 4. Deploy Lending Contract
            lending_app_id, lending_address = self.deploy_lending_contract(vgold_app_id)
            self.contract_addresses['lending'] = lending_address
            self.contract_addresses['lending_app_id'] = lending_app_id
            
            # 5. Save configuration
            self.save_configuration()
            
            print("\n✅ All contracts deployed successfully!")
            self.print_deployment_summary()
            
        except Exception as e:
            print(f"❌ Deployment failed: {str(e)}")
            raise
    
    def save_configuration(self):
        """Save contract configuration to file"""
        config = {
            "network": "testnet",
            "manager_address": self.manager_address,
            "contracts": {
                "vgold": {
                    "app_id": self.contract_addresses['vgold_app_id'],
                    "address": self.contract_addresses['vgold']
                },
                "trading": {
                    "app_id": self.contract_addresses['trading_app_id'],
                    "address": self.contract_addresses['trading']
                },
                "lending": {
                    "app_id": self.contract_addresses['lending_app_id'],
                    "address": self.contract_addresses['lending']
                },
                "oracle": {
                    "app_id": self.contract_addresses['oracle_app_id'],
                    "address": self.contract_addresses['oracle']
                }
            }
        }
        
        # Save to contracts directory
        os.makedirs('deployed', exist_ok=True)
        with open('deployed/contracts.json', 'w') as f:
            json.dump(config, f, indent=2)
        
        # Also save environment variables format
        env_content = f"""# GoldChain Smart Contract Addresses
REACT_APP_VGOLD_APP_ID={self.contract_addresses['vgold_app_id']}
REACT_APP_TRADING_APP_ID={self.contract_addresses['trading_app_id']}
REACT_APP_LENDING_APP_ID={self.contract_addresses['lending_app_id']}
REACT_APP_ORACLE_APP_ID={self.contract_addresses['oracle_app_id']}
REACT_APP_VGOLD_ADDRESS={self.contract_addresses['vgold']}
REACT_APP_TRADING_ADDRESS={self.contract_addresses['trading']}
REACT_APP_LENDING_ADDRESS={self.contract_addresses['lending']}
REACT_APP_ORACLE_ADDRESS={self.contract_addresses['oracle']}
"""
        
        with open('deployed/.env', 'w') as f:
            f.write(env_content)
        
        print("Configuration saved to deployed/contracts.json and deployed/.env")
    
    def print_deployment_summary(self):
        """Print deployment summary"""
        print("\n" + "="*60)
        print("GOLDCHAIN SMART CONTRACT DEPLOYMENT SUMMARY")
        print("="*60)
        print(f"Manager Address: {self.manager_address}")
        print(f"Network: TestNet")
        print("\nDeployed Contracts:")
        print(f"  vGold Token    - App ID: {self.contract_addresses['vgold_app_id']}")
        print(f"  Trading        - App ID: {self.contract_addresses['trading_app_id']}")
        print(f"  Lending        - App ID: {self.contract_addresses['lending_app_id']}")
        print(f"  Price Oracle   - App ID: {self.contract_addresses['oracle_app_id']}")
        print("\nContract Addresses:")
        print(f"  vGold Token    - {self.contract_addresses['vgold']}")
        print(f"  Trading        - {self.contract_addresses['trading']}")
        print(f"  Lending        - {self.contract_addresses['lending']}")
        print(f"  Price Oracle   - {self.contract_addresses['oracle']}")
        print("="*60)

def main():
    """Main deployment function"""
    # Configuration
    ALGOD_URL = os.getenv("ALGOD_URL", "https://testnet-api.algonode.cloud")
    ALGOD_TOKEN = os.getenv("ALGOD_TOKEN", "")
    
    # Manager mnemonic (read securely from environment)
    MANAGER_MNEMONIC = os.getenv("DEPLOYER_MNEMONIC", "").strip()
    if not MANAGER_MNEMONIC:
        print("DEPLOYER_MNEMONIC is not set. Please set a funded TestNet 25-word mnemonic in environment.")
        return 1
    
    try:
        # Initialize Algod client
        algod_client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_URL)
        
        # Create deployer
        deployer = ContractDeployer(algod_client, MANAGER_MNEMONIC)
        
        # Deploy all contracts
        deployer.setup_contracts()
        
    except Exception as e:
        print(f"Deployment failed: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
