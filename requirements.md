# Demo Technical Capability on HIP-3 Scalar Market Flow
## Task Overview
Build a simple web terminal that connects to Hyperliquid using their Python SDK, displays a scalar prediction market (mock or seeded), and allows a user to place a leveraged trade via a backend gateway.

## What to Build
### Front-End UI (Terminal View):
- Display a single scalar prediction market (e.g., “BTC dominance % at EOM” or “Messi Goals Over/Under”).
- Show:
  	• Mark price vs Oracle price.
  	• Expiry countdown.
 	 • Simple chart or number line.
 	 • Leverage slider (1x–3x).
 	 • Entry size input.
 	 • “Place Trade” button.

### Backend Gateway (Python FastAPI):
- Accept trade requests (POST /orders/place).
- Simulate placing an order on Hyperliquid using the SDK (mock data acceptable).
- Print/log order parameters: size, leverage, entry, scalar value.
- Optional: add one risk control (e.g. reject if leverage > 3x or expiry < 24h).

## Stack Requirements
- Frontend: React(TypeScript).
- Backend: Python (FastAPI preferred).
- Integrate: Hyperliquid Python SDK.
- No need for DB or persistent state — just pass through.

## Input
You may hardcode or mock:
- One scalar market config (range, title, expiry, tick size).
- Oracle price.
- HL credentials (testnet or dummy key).

## Deliverables
- GitHub repo with frontend + backend folders.
- Clear README with run instructions.


## Success Criteria
- Frontend loads and renders scalar market.
- User can choose leverage and place a trade.
- Backend receives and logs trade params.
- Basic leverage limit enforced.
- Design fits early version of BetYa Terminal.

## Bonus (Optional)

- Connect to real HL testnet market.
- Visual payout bar or liq band preview.
- Agent selector (mocked).

## References
https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api
https://github.com/hyperliquid-dex/hyperliquid-python-sdk
