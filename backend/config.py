"""
Configuration file for ServeUp AI Scalar Market Terminal
"""

import os
from typing import Optional

# Load environment variables from .env file
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

# Hyperliquid Configuration
HL_API_KEY: Optional[str] = os.getenv("HL_API_KEY", "fake_api_key_12345")
HL_SECRET_KEY: Optional[str] = os.getenv("HL_SECRET_KEY", "fake_secret_key_67890")
HL_TESTNET: bool = os.getenv("HL_TESTNET", "true").lower() == "true"
TESTNET_API_URL = "https://api.hyperliquid-testnet.xyz"

# API Configuration
API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
API_PORT: int = int(os.getenv("API_PORT", "8001"))
API_DEBUG: bool = os.getenv("API_DEBUG", "false").lower() == "true"

# CORS Configuration
CORS_ORIGINS: list = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Market Configuration
DEFAULT_MARKET = {
    "id": "btc-dominance-eom",
    "title": "BTC Dominance % at End Of Month",
    "description": "Bitcoin dominance percentage at end of month",
    "range": {
        "min": 30.0,
        "max": 90.0,
        "tick_size": 0.1,
    },
    "default_expiry_days": 30,
    "oracle_price": 52.3,
}

# Risk Management
MAX_LEVERAGE: float = 3.0
MIN_LEVERAGE: float = 1.0
MIN_EXPIRY_HOURS: int = 24

# Logging Configuration
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Development Configuration
DEV_MODE: bool = os.getenv("DEV_MODE", "true").lower() == "true"
