'use client';

import { useEffect, useState } from 'react';
import { fetchMarketData, fetchHistory } from '@/services/trading-api';
import { MarketData } from '@/features/trading/domain/market-data';

export default function TradingDashboard() {
  const [quote, setQuote] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Fetch initial data
    Promise.all([
      fetchMarketData('AAPL'),
      fetchHistory('AAPL', '1d')
    ]).then(([latest, hist]) => {
      setQuote(latest);
      setHistory(hist);
      setLoading(false);
    }).catch(console.error);

    // Setup WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/market/AAPL');
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setQuote(data);
    };

    return () => ws.close();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trading Dashboard</h1>
      <div className="bg-yellow-100 p-2 mb-4 text-sm text-yellow-800">
        NOTE: This is MOCK DATA for demonstration purposes only.
      </div>
      <div>Connection Status: {connected ? 'Connected' : 'Disconnected'}</div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 border p-4">
        <div><strong>Symbol:</strong> {quote?.symbol}</div>
        <div><strong>Price:</strong> ${quote?.price}</div>
      </div>
      
      <h2 className="text-xl font-bold mt-6 mb-2">Historical Candles</h2>
      <div className="border p-4">
        {history.map((c, i) => (
          <div key={i}>
            {c.timestamp}: O:{c.open} H:{c.high} L:{c.low} C:{c.close} V:{c.volume}
          </div>
        ))}
      </div>
    </div>
  );
}
