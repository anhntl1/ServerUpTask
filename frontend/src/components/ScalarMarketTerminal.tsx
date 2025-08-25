import React, { useState, useEffect } from 'react';
import './ScalarMarketTerminal.css';

interface MarketData {
  id: string;
  title: string;
  description: string;
  range: {
    min: number;
    max: number;
    tick_size: number;
  };
  expiry: string;
  oracle_price: number;
  mark_price: number;
  currency: string;
}

interface TradeRequest {
  size: number;
  leverage: number;
  entry_price: number;
  scalar_value: number;
  direction: 'long' | 'short';
}

const ScalarMarketTerminal: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tradeForm, setTradeForm] = useState<TradeRequest>({
    size: 100,
    leverage: 1,
    entry_price: 0,
    scalar_value: 0,
    direction: 'long',
  });
  const [placingTrade, setPlacingTrade] = useState(false);
  const [tradeResult, setTradeResult] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    fetchMarketData();
  }, []);

  useEffect(() => {
    if (marketData?.expiry) {
      const timer = setInterval(() => {
        updateCountdown();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [marketData?.expiry]);

  // Auto-hide trade result after 10 seconds
  useEffect(() => {
    if (tradeResult) {
      const timer = setTimeout(() => {
        setTradeResult('');
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [tradeResult]);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/market');
      const data = await response.json();
      setMarketData(data);
      setTradeForm((prev) => ({
        ...prev,
        entry_price: data.mark_price,
        scalar_value: data.mark_price,
      }));
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacingTrade(true);
    setTradeResult('');

    try {
      const response = await fetch('/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeForm),
      });

      const result = await response.json();

      if (response.ok) {
        setTradeResult(
          `Trade executed successfully! Order ID: ${result.order_id}`
        );
        // Reset form
        setTradeForm((prev) => ({
          ...prev,
          size: 100,
          leverage: 1,
          entry_price: marketData?.mark_price || 0,
          scalar_value: marketData?.mark_price || 0,
        }));
      } else {
        setTradeResult(`Error: ${result.detail}`);
      }
    } catch (error) {
      setTradeResult('Error executing trade. Please try again.');
    } finally {
      setPlacingTrade(false);
    }
  };

  const updateCountdown = () => {
    if (!marketData?.expiry) return;

    const expiryDate = new Date(marketData.expiry);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      setTimeLeft('EXPIRED');
      return;
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (days > 0) {
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    } else if (hours > 0) {
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    } else if (minutes > 0) {
      setTimeLeft(`${minutes}m ${seconds}s`);
    } else {
      setTimeLeft(`${seconds}s`);
    }
  };

  const getExpiryClass = () => {
    if (!marketData?.expiry) return '';

    const expiryDate = new Date(marketData.expiry);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();

    if (diffMs <= 0) return 'danger';
    if (diffMs <= 24 * 60 * 60 * 1000) return 'danger'; // Less than 24 hours
    if (diffMs <= 7 * 24 * 60 * 60 * 1000) return 'warning'; // Less than 7 days
    return '';
  };

  if (loading) {
    return <div className="loading">Initializing ServeUp AI Terminal...</div>;
  }

  if (!marketData) {
    return (
      <div className="error">Failed to connect to ServeUp AI services</div>
    );
  }

  return (
    <div className="terminal">
      <div className="market-info">
        <h2>{marketData.title}</h2>
        <p className="description">{marketData.description}</p>

        <div className="price-display">
          <div className="price-item">
            <label>Market Price</label>
            <span className="price mark-price">
              ${marketData.mark_price.toFixed(2)}
            </span>
          </div>
          <div className="price-item">
            <label>Oracle Price</label>
            <span className="price oracle-price">
              ${marketData.oracle_price.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="market-details">
          <div className="detail-item">
            <label>Range</label>
            <span>
              {marketData.range.min}% - {marketData.range.max}%
            </span>
          </div>
          <div className="detail-item">
            <label>Expiry</label>
            <span className={`expiry-countdown ${getExpiryClass()}`}>
              {timeLeft || '-'}
            </span>
          </div>
          <div className="detail-item">
            <label>Tick Size</label>
            <span>{marketData.range.tick_size}</span>
          </div>
        </div>

        <div className="scalar-chart">
          <div className="chart-line">
            <div className="min-value">{marketData.range.min}%</div>
            <div className="chart-bar">
              <div
                className="mark-indicator"
                style={{
                  left: `${
                    ((marketData.mark_price - marketData.range.min) /
                      (marketData.range.max - marketData.range.min)) *
                    100
                  }%`,
                }}
              >
                <div className="mark-label">
                  Market: {marketData.mark_price}%
                </div>
              </div>
              <div
                className="oracle-indicator"
                style={{
                  left: `${
                    ((marketData.oracle_price - marketData.range.min) /
                      (marketData.range.max - marketData.range.min)) *
                    100
                  }%`,
                }}
              >
                <div className="oracle-label">
                  Oracle: {marketData.oracle_price}%
                </div>
              </div>
            </div>
            <div className="max-value">{marketData.range.max}%</div>
          </div>
        </div>
      </div>

      <div className="trade-form">
        <h3>Execute Trade</h3>
        <form onSubmit={handleTradeSubmit}>
          <div className="form-group">
            <label>Position</label>
            <div className="direction-buttons">
              <button
                type="button"
                className={`direction-btn ${
                  tradeForm.direction === 'long' ? 'active' : ''
                }`}
                onClick={() =>
                  setTradeForm((prev) => ({ ...prev, direction: 'long' }))
                }
              >
                Long
              </button>
              <button
                type="button"
                className={`direction-btn ${
                  tradeForm.direction === 'short' ? 'active' : ''
                }`}
                onClick={() =>
                  setTradeForm((prev) => ({ ...prev, direction: 'short' }))
                }
              >
                Short
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Investment Amount (USD)</label>
            <input
              type="number"
              value={tradeForm.size}
              onChange={(e) =>
                setTradeForm((prev) => ({
                  ...prev,
                  size: parseFloat(e.target.value) || 0,
                }))
              }
              min="1"
              step="1"
            />
          </div>

          <div className="form-group">
            <label>Leverage: {tradeForm.leverage}x</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={tradeForm.leverage}
              onChange={(e) =>
                setTradeForm((prev) => ({
                  ...prev,
                  leverage: parseFloat(e.target.value),
                }))
              }
              className="leverage-slider"
            />
          </div>

          <div className="form-group">
            <label>Entry Price</label>
            <input
              type="number"
              value={tradeForm.entry_price}
              onChange={(e) =>
                setTradeForm((prev) => ({
                  ...prev,
                  entry_price: parseFloat(e.target.value) || 0,
                }))
              }
              min={marketData.range.min}
              max={marketData.range.max}
              step={marketData.range.tick_size}
            />
          </div>

          <div className="form-group">
            <label>Target Value</label>
            <input
              type="number"
              value={tradeForm.scalar_value}
              onChange={(e) =>
                setTradeForm((prev) => ({
                  ...prev,
                  scalar_value: parseFloat(e.target.value) || 0,
                }))
              }
              min={marketData.range.min}
              max={marketData.range.max}
              step={marketData.range.tick_size}
            />
          </div>

          <button
            type="submit"
            className="place-trade-btn"
            disabled={placingTrade}
          >
            {placingTrade ? 'Executing...' : 'Execute Trade'}
          </button>
        </form>

        {tradeResult && (
          <div
            className={`trade-result ${
              tradeResult.includes('Error') ? 'error' : 'success'
            }`}
          >
            {tradeResult}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScalarMarketTerminal;
