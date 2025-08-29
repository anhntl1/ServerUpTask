import logging
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from hyperliquid_order import hyperliquid_service

from schema import TradeRequest, TradeResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Scalar Market Terminal API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock scalar market data
MOCK_MARKET = {
    "id": "ETH",
    "title": "ETH/USDC",
    "range": {
        "min": 1000.0,
        "max": 2000.0,
        "tick_size": 1.0,
    },
    "expiry": "2025-09-02T00:00:00Z",
    "oracle_price": 1850.1,
    "mark_price": 1848.04,  # market price
}


@app.get("/")
async def root():
    return {"message": "Scalar Market Terminal API"}


@app.get("/market")
async def get_market():
    """Get current market data"""
    return MOCK_MARKET


@app.post("/orders/place", response_model=TradeResponse)
async def place_trade(trade: TradeRequest):
    """Place a leveraged trade on the scalar market"""

    # Check if expiry is less than 24 hours
    expiry_time = datetime.fromisoformat(MOCK_MARKET["expiry"])
    print(expiry_time)
    print(datetime.now(timezone.utc))
    if (expiry_time - datetime.now(timezone.utc)).total_seconds() < 24 * 3600:
        raise HTTPException(
            status_code=400,
            detail="Cannot trade on markets expiring in less than 24 hours",
        )

    # Log trade parameters
    log_data = trade.model_dump()
    log_data["coin"] = "ETH"
    logger.info(f"Trade placed: {log_data}")

    try:
        hyper = hyperliquid_service.create_order(
            coin="ETH",
            is_buy=(trade.direction == "long"),
            sz=trade.size,
            limit_px=trade.limit_px,
            order_type={"limit": {"tif": "Gtc"}},
        )
        if hyper.get("success") is not True:
            return TradeResponse(
                order_id=None,
                status="error",
                error=hyper.get("error"),
            )

        return TradeResponse(
            order_id=hyper["oid"],
            status="success",
        )
    except Exception as e:
        raise e


@app.post("/orders/{oid}/cancel")
async def cancel_order(oid: int):
    hyperliquid_service.cancel_order("ETH", oid)
    return {"status": "cancelled"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
