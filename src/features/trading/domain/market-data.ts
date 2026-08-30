export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  status: string;
}

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
