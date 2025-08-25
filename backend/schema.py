from pydantic import BaseModel


class TradeRequest(BaseModel):
    size: float
    leverage: float
    entry_price: float
    scalar_value: float
    direction: str  # "long" or "short"


class TradeResponse(BaseModel):
    order_id: str
    status: str
    message: str
    trade_params: dict
