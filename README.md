# Scalar Market Terminal - HIP-3 Scalar Market Flow Demo

A simple web terminal that demonstrates scalar prediction market trading capabilities, built with FastAPI backend and React frontend.

## Features

- **Scalar Market Display**: Shows BTC dominance prediction market with mark price vs oracle price
- **Visual Chart**: Simple number line visualization of market range with price indicators
- **Trade Interface**: Leverage slider (1x-3x), size input, and direction selection
- **Risk Controls**: Basic leverage limits and expiry validation
- **Mock Trading**: Simulated order placement with logging

## Project Structure

```
Demo/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main API server
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # App entry point
│   ├── package.json        # Node dependencies
│   └── tsconfig.json       # TypeScript config
└── README.md               # This file
```

## Prerequisites

- Python 3.11+
- Node.js 16+
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   python main.py
   ```
   or run with uvicorn
   ```bash
   uvicorn main:app --port 8001
   ```

The backend will start on `http://localhost:8001`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

## API Endpoints

### GET `/market`
Returns current market data including:
- Market title and description
- Min/max values and tick size
- Mark price and oracle price
- Expiry information

### POST `/orders/place`
Accepts trade requests with:
- `size`: Trade size in USD
- `leverage`: Leverage multiplier (1x-3x)
- `entry_price`: Entry price for the trade
- `scalar_value`: Scalar value being traded
- `direction`: "long" or "short"

Returns order confirmation with order ID and trade parameters.

## Mock Market Data

The demo uses a hardcoded BTC dominance prediction market:
- **Range**: 30% - 70%
- **Tick Size**: 0.1
- **Expiry**: 2025-08-31T23:59:59Z
- **Oracle Price**: $52.3
- **Mark Price**: $48.1

## Risk Controls

- Maximum leverage: 3x
- Minimum leverage: 1x
- Cannot trade on markets expiring in less than 24 hours
- Scalar value must be within market range

## Development Notes

- **Hyperliquid SDK**: Currently mocked - real integration would require proper API keys and testnet setup
- **Database**: No persistent storage - all data is in-memory
- **Authentication**: No user authentication implemented
- **Real-time Updates**: Market data is static - no real-time price feeds
- **Hyperliquid using**: backend/hyperliquid_order.py

### Backend Issues
- Ensure Python virtual environment is activated
- Check if port 8001 is available
- Verify all dependencies are installed

### Frontend Issues
- Clear browser cache and restart dev server
- Check if port 3000 is available
- Ensure backend is running before starting frontend

### CORS Issues
- Backend is configured to allow requests from `http://localhost:3000`
- If using different ports, update CORS settings in `backend/main.py`

## License

This is a demo project for educational purposes. 

### Demo UI
UI
![UI](/demo/image.png)

Backend log

![Backendlog](/demo/log.png)

Hyperliquid Integration (pls waiting to load GIF)
![Integration](/demo/vokoscreenNG-2025-08-29_16-55-35.gif)