from algosdk import account, mnemonic
sk, addr = account.generate_account()
phrase = mnemonic.from_private_key(sk)
open('contracts/.env','w').write(f'DEPLOYER_MNEMONIC="{phrase}"\n')
print(addr)
