import os
from hyperliquid.exchange import Exchange
from hyperliquid.info import Info
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()

PRIVATE_KEY = str(os.getenv("PRIVATE_KEY"))
BASE_URL = "https://api.hyperliquid-testnet.xyz"
account = Account.from_key(PRIVATE_KEY)

# Kết nối tới testnet
info = Info(base_url=BASE_URL, skip_ws=True)
address = account.address
user_state = info.user_state(address)
spot_user_state = info.spot_user_state(address)
margin_summary = user_state["marginSummary"]
if float(margin_summary["accountValue"]) == 0 and len(spot_user_state["balances"]) == 0:
    print("Not running the example because the provided account has no equity.")
    url = info.base_url.split(".", 1)[1]
    error_string = f"No accountValue:\nIf you think this is a mistake, make sure that {address} has a balance on {url}.\nIf address shown is your API wallet address, update the config to specify the address of your account, not the address of the API wallet."
    print(error_string)
exchange = Exchange(account, base_url=BASE_URL)

# For example: limit order LONG 0.01 ETH-PERP at price 2000 USDC
order = {
    "coin": "BTC",        # asset name, e.g.: ETH, BTC
    "is_buy": True,       
    "sz": "0.01",         
    "limit_px": "2000",   
    "order_type": {"limit": {"tif": "Gtc"}}, 
    "reduce_only": False, 
    "cloid": "my-test-order-001",  # Client Order ID (optionals)
}

resp = exchange.order("BTC", True, 0.2, 1100, {"limit": {"tif": "Gtc"}})
print("Order response:", resp)
