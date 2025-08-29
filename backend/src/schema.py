from pydantic import BaseModel


class TradeRequest(BaseModel):
    size: float
    direction: str  # "long" or "short"
    limit_px: float


class TradeResponse(BaseModel):
    order_id: int | None = None
    status: str
    error: str | None = None
