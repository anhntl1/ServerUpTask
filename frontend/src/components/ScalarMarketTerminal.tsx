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
  invested_amount: number;
  size: number;
  leverage: number;
  direction: 'long' | 'short';
  limit_px: number;
}

const ScalarMarketTerminal: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [tradeForm, setTradeForm] = useState<TradeRequest>({
    invested_amount: 100,
    size: 100,
    leverage: 1,
    direction: 'long',
    limit_px: 0,
  });

  // Automatically update size when invested_amount, leverage, or limit_px changes
  useEffect(() => {
    if (tradeForm.invested_amount > 0) {
      const newSize =
        (tradeForm.invested_amount * tradeForm.leverage) / tradeForm.limit_px;
      setTradeForm((prev) => ({
        ...prev,
        size: Number.isFinite(newSize) ? parseFloat(newSize.toFixed(2)) : 0,
      }));
    }
  }, [tradeForm.invested_amount, tradeForm.leverage, tradeForm.limit_px]);

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
        limit_px: parseFloat(
          (prev.direction === 'long'
            ? data.mark_price - data.range.tick_size
            : data.mark_price + data.range.tick_size
          ).toFixed(1)
        ),
      }));
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId) {
      // Cancel order logic here
      try {
        const response = await fetch(`/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (response.ok) {
          setTradeResult(`Order cancelled.`);
          // Reset form
          setTradeForm((prev) => ({
            ...prev,
            size: 100,
            leverage: 1,
            limit_px: marketData?.mark_price || 0,
          }));
        } else {
          setTradeResult(`Error: ${result.detail}`);
          // Reset form
          setTradeForm((prev) => ({
            ...prev,
            size: 100,
            leverage: 1,
            limit_px: marketData?.mark_price || 0,
          }));
        }
      } catch (error) {
        setTradeResult('Error occurred. Please try again.');
        // Reset form
        setTradeForm((prev) => ({
          ...prev,
          size: 100,
          leverage: 1,
          limit_px: marketData?.mark_price || 0,
        }));
      } finally {
        setOrderId(null);
        setTradeResult('Order cancelled.');
      }
    } else {
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
          if (result.status === 'success') {
            setOrderId(result.order_id);
            setTradeResult(
              `Trade executed successfully! Order ID: ${result.order_id}`
            );
          } else {
            setTradeResult(`Error: ${result.error}`);
          }
        } else {
          setTradeResult(`Error: ${result.detail}`);
        }
      } catch (error) {
        setTradeResult('Error executing trade. Please try again.');
      } finally {
        setPlacingTrade(false);
      }
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
              ${marketData.range.min} - ${marketData.range.max}
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
            <label>Investment (USD)</label>
            <input
              type="number"
              value={tradeForm.invested_amount}
              onChange={(e) =>
                setTradeForm((prev) => ({
                  ...prev,
                  invested_amount: parseFloat(e.target.value),
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
            <label>Position Size (Contracts)</label>
            <input type="number" value={tradeForm.size} readOnly={true} />
          </div>

          <div className="form-group">
            <label>Limit Price (USD)</label>
            <input
              type="number"
              value={tradeForm.limit_px}
              onChange={(e) =>
                setTradeForm((prev) => ({
                  ...prev,
                  limit_px: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>

          <button
            type="submit"
            className="place-trade-btn"
            disabled={placingTrade}
          >
            {placingTrade
              ? 'Submitting...'
              : orderId
              ? 'Cancel Order'
              : 'Submit Order'}
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
