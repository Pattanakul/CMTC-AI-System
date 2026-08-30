import { MarketData, Candle } from "@/features/trading/domain/market-data";

export async function fetchMarketData(symbol: string): Promise<MarketData> {
  const response = await fetch(`http://localhost:8000/market-data/${symbol}`);
  if (!response.ok) {
    throw new Error('Failed to fetch market data');
  }
  return response.json();
}

export async function fetchHistory(symbol: string, timeframe: string): Promise<Candle[]> {
  const response = await fetch(`http://localhost:8000/market-data/${symbol}/history?timeframe=${timeframe}`);
  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }
  return response.json();
}
