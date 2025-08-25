import logging
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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
    "id": "btc-dominance-eom",
    "title": "BTC Dominance % at End Of Month",
    "description": "Bitcoin dominance percentage at end of month",
    "range": {
        "min": 30.0,
        "max": 90.0,
        "tick_size": 0.1,
    },
    "expiry": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "oracle_price": 52.3,
    "mark_price": 48.1,  # market price
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

    # Basic risk controls
    if trade.leverage > 3.0:
        raise HTTPException(status_code=400, detail="Leverage cannot exceed 3x")

    if trade.leverage < 1.0:
        raise HTTPException(status_code=400, detail="Leverage must be at least 1x")

    # Check if expiry is less than 24 hours
    expiry_time = datetime.fromisoformat(MOCK_MARKET["expiry"])
    print(expiry_time)
    print(datetime.now(timezone.utc))
    if (expiry_time - datetime.now(timezone.utc)).total_seconds() < 24 * 3600:
        raise HTTPException(
            status_code=400,
            detail="Cannot trade on markets expiring in less than 24 hours",
        )

    # Validate scalar value range
    if (
        trade.scalar_value < MOCK_MARKET["range"]["min"]
        or trade.scalar_value > MOCK_MARKET["range"]["max"]
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Scalar value must be between {MOCK_MARKET['range']['min']} and {MOCK_MARKET['range']['max']}",
        )

    # Log trade parameters
    trade_params = {
        "size": trade.size,
        "leverage": trade.leverage,
        "entry_price": trade.entry_price,
        "scalar_value": trade.scalar_value,
        "direction": trade.direction,
        "timestamp": datetime.now().isoformat(),
    }

    logger.info(f"Trade placed: {trade_params}")

    # Mock order placement (in real implementation, this would use Hyperliquid SDK)
    order_id = f"order_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    # order = hyperliquid_order.place_order(order_id, trade_params)

    return TradeResponse(
        order_id=order_id,
        status="success",
        message="Trade placed successfully",
        trade_params=trade_params,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
