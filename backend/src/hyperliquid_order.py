from http.client import HTTPException
import logging
import os
from hyperliquid.exchange import Exchange
from hyperliquid.info import Info
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PRIVATE_KEY = str(os.getenv("PRIVATE_KEY"))
BASE_URL = "https://api.hyperliquid-testnet.xyz"


class HyperliquidIntegrationService:
    def __init__(self):
        account = Account.from_key(PRIVATE_KEY)
        self.info = Info(base_url=BASE_URL, skip_ws=True)
        self.address = account.address
        self.exchange = Exchange(account, base_url=BASE_URL)

    def create_order(
        self,
        coin: str,
        is_buy: bool,
        sz: float,
        limit_px: float,
        order_type: dict,
    ):
        order_result = self.exchange.order(coin, is_buy, sz, limit_px, order_type)
        logging.info(f"Order result: {order_result}")
        try:
            if order_result["status"] == "ok":
                status = order_result["response"]["data"]["statuses"][0]
                if "resting" in status:
                    order_status = self.info.query_order_by_oid(
                        self.address, status["resting"]["oid"]
                    )
                    return {
                        "oid": status["resting"]["oid"],
                        "status": order_status,
                        "success": True,
                    }
                else:
                    return {"error": status.get("error"), "success": False}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def cancel_order(self, coin, oid):
        return self.exchange.cancel(coin, oid)


hyperliquid_service = HyperliquidIntegrationService()
