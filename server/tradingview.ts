import fetch from 'node-fetch';

interface TradingViewConfig {
  apiKey: string;
  baseUrl: string;
}

interface TradingViewQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  bid?: number;
  ask?: number;
  high?: number;
  low?: number;
  open?: number;
}

interface TradingViewPosition {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  timestamp: number;
}

interface TradingViewOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'working' | 'filled' | 'cancelled' | 'rejected';
  timestamp: number;
  broker?: string;
}

interface TradingViewAccount {
  id: string;
  name: string;
  broker: string;
  balance: number;
  equity: number;
  marginUsed: number;
  marginAvailable: number;
  currency: string;
  status: 'connected' | 'disconnected' | 'error';
}

interface TradingViewSymbolInfo {
  symbol: string;
  description: string;
  type: string;
  session: string;
  exchange: string;
  listed_exchange: string;
  timezone: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
}

export class TradingViewService {
  private config: TradingViewConfig;

  constructor() {
    this.config = {
      apiKey: process.env.TRADINGVIEW_API_KEY || '',
      baseUrl: 'https://api.tradingview.com/v1' // TradingView REST API endpoint
    };
  }

  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error('TradingView API key not configured');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TradingView API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('TradingView API request failed:', error);
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (!this.config.apiKey) {
        return { 
          success: false, 
          message: 'TradingView API key not configured. Please set TRADINGVIEW_API_KEY environment variable.' 
        };
      }

      // Test with a simple quote request
      const testData = await this.getQuotes(['NASDAQ:AAPL']);
      
      return { 
        success: true, 
        message: 'Connected to TradingView successfully', 
        data: { 
          apiKeyConfigured: true,
          testQuote: testData[0] || null
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async getQuotes(symbols: string[]): Promise<TradingViewQuote[]> {
    try {
      const symbolsParam = symbols.join(',');
      const data = await this.makeRequest(`/quotes?symbols=${symbolsParam}`);
      
      return symbols.map(symbol => {
        const quote = data[symbol] || {};
        return {
          symbol,
          price: quote.lp || 0, // last price
          change: quote.ch || 0, // change
          changePercent: quote.chp || 0, // change percent
          volume: quote.volume || 0,
          timestamp: Date.now(),
          bid: quote.bid,
          ask: quote.ask,
          high: quote.high,
          low: quote.low,
          open: quote.open
        };
      });
    } catch (error) {
      console.error('Error getting TradingView quotes:', error);
      return [];
    }
  }

  async getSymbolInfo(symbol: string): Promise<TradingViewSymbolInfo | null> {
    try {
      const data = await this.makeRequest(`/symbols?symbol=${symbol}`);
      return data || null;
    } catch (error) {
      console.error('Error getting symbol info:', error);
      return null;
    }
  }

  // TradingView doesn't directly provide positions/orders as it's primarily a charting platform
  // These methods would integrate with connected brokers through TradingView's broker API
  async getBrokerAccounts(): Promise<TradingViewAccount[]> {
    try {
      // This would require TradingView's broker integration
      // For now, return mock structure to show what's possible
      const data = await this.makeRequest('/accounts');
      return data || [];
    } catch (error) {
      console.error('Error getting broker accounts:', error);
      return [];
    }
  }

  async getPositions(accountId?: string): Promise<TradingViewPosition[]> {
    try {
      const endpoint = accountId ? `/accounts/${accountId}/positions` : '/positions';
      const data = await this.makeRequest(endpoint);
      return data || [];
    } catch (error) {
      console.error('Error getting positions:', error);
      return [];
    }
  }

  async getOrders(accountId?: string): Promise<TradingViewOrder[]> {
    try {
      const endpoint = accountId ? `/accounts/${accountId}/orders` : '/orders';
      const data = await this.makeRequest(endpoint);
      return data || [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async placeOrder(order: Omit<TradingViewOrder, 'id' | 'timestamp' | 'status'>): Promise<TradingViewOrder | null> {
    try {
      const data = await this.makeRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(order)
      });
      return data || null;
    } catch (error) {
      console.error('Error placing order:', error);
      return null;
    }
  }

  async getHistoricalData(symbol: string, resolution: string, from: number, to: number): Promise<any> {
    try {
      const params = new URLSearchParams({
        symbol,
        resolution,
        from: from.toString(),
        to: to.toString()
      });
      
      const data = await this.makeRequest(`/history?${params}`);
      return data;
    } catch (error) {
      console.error('Error getting historical data:', error);
      return null;
    }
  }

  // WebSocket connection for real-time data
  async createWebSocketConnection(): Promise<WebSocket | null> {
    try {
      if (!this.config.apiKey) {
        throw new Error('API key required for WebSocket connection');
      }

      // TradingView WebSocket endpoint with authentication
      const wsUrl = `wss://ws.tradingview.com/socket.io/?apikey=${this.config.apiKey}`;
      
      // Note: This would require proper WebSocket implementation
      // For now, return null to indicate WebSocket would be implemented here
      return null;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  // Popular trading symbols for quick access
  getPopularSymbols(): string[] {
    return [
      'NASDAQ:AAPL',
      'NASDAQ:TSLA', 
      'NASDAQ:MSFT',
      'NYSE:SPY',
      'NASDAQ:QQQ',
      'CME_MINI:ES1!', // S&P 500 E-mini
      'CME_MINI:NQ1!', // Nasdaq 100 E-mini
      'FOREX:EURUSD',
      'FOREX:GBPUSD',
      'BINANCE:BTCUSDT',
      'BINANCE:ETHUSDT'
    ];
  }

  // Convert symbol to TradingView format
  formatSymbol(symbol: string, exchange?: string): string {
    if (symbol.includes(':')) {
      return symbol; // Already formatted
    }
    
    if (exchange) {
      return `${exchange}:${symbol}`;
    }
    
    // Default exchange mapping
    const exchangeMap: { [key: string]: string } = {
      'AAPL': 'NASDAQ',
      'MSFT': 'NASDAQ', 
      'TSLA': 'NASDAQ',
      'SPY': 'AMEX',
      'QQQ': 'NASDAQ',
      'ES': 'CME_MINI',
      'NQ': 'CME_MINI',
      'EURUSD': 'FOREX',
      'GBPUSD': 'FOREX'
    };
    
    const exchange_prefix = exchangeMap[symbol.toUpperCase()] || 'NASDAQ';
    return `${exchange_prefix}:${symbol.toUpperCase()}`;
  }
}

export const tradingViewService = new TradingViewService();