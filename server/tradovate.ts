import fetch from 'node-fetch';

interface TradovateConfig {
  username: string;
  password: string;
  deviceId: string;
  baseUrl: string;
}

interface TradovateAuth {
  accessToken: string;
  expirationTime: string;
  userId: number;
}

interface TradovatePosition {
  id: number;
  accountId: number;
  contractId: number;
  timestamp: string;
  tradeDate: string;
  netPos: number;
  netPrice: number;
  bought: number;
  boughtValue: number;
  sold: number;
  soldValue: number;
  prevPos: number;
  prevPrice: number;
}

interface TradovateOrder {
  id: number;
  accountId: number;
  clOrdId: string;
  contractId: number;
  timestamp: string;
  orderQty: number;
  orderType: string;
  price?: number;
  stopPrice?: number;
  timeInForce: string;
  ordStatus: string;
  rejectReason?: string;
  text?: string;
  execInst?: string;
  side: string;
  symbol: string;
}

interface TradovateExecution {
  id: number;
  orderId: number;
  accountId: number;
  contractId: number;
  timestamp: string;
  tradeDate: string;
  execQty: number;
  execPrice: number;
  execType: string;
  side: string;
  symbol: string;
  commission: number;
}

export class TradovateService {
  private config: TradovateConfig;
  private auth: TradovateAuth | null = null;
  private wsConnection: WebSocket | null = null;

  constructor() {
    this.config = {
      username: process.env.TRADOVATE_USERNAME || '',
      password: process.env.TRADOVATE_PASSWORD || '',
      deviceId: process.env.TRADOVATE_DEVICE_ID || 'proptracker-001',
      baseUrl: 'https://demo.tradovateapi.com/v1' // Use demo first
    };
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/auth/accesstokenrequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: this.config.username,
          password: this.config.password,
          appId: 'PropTracker',
          appVersion: '1.0.0',
          deviceId: this.config.deviceId,
          cid: Math.floor(Math.random() * 1000000)
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (data.errorText) {
        throw new Error(`Tradovate error: ${data.errorText}`);
      }

      this.auth = {
        accessToken: data.accessToken,
        expirationTime: data.expirationTime,
        userId: data.userId
      };

      return true;
    } catch (error) {
      console.error('Tradovate authentication error:', error);
      return false;
    }
  }

  async getAccounts(): Promise<any[]> {
    if (!this.auth) {
      const authenticated = await this.authenticate();
      if (!authenticated) return [];
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/account/list`, {
        headers: {
          'Authorization': `Bearer ${this.auth!.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get accounts: ${response.status}`);
      }

      return await response.json() as any[];
    } catch (error) {
      console.error('Error getting Tradovate accounts:', error);
      return [];
    }
  }

  async getPositions(accountId?: number): Promise<TradovatePosition[]> {
    if (!this.auth) {
      const authenticated = await this.authenticate();
      if (!authenticated) return [];
    }

    try {
      const url = accountId 
        ? `${this.config.baseUrl}/position/deps?masterid=${accountId}`
        : `${this.config.baseUrl}/position/list`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.auth!.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get positions: ${response.status}`);
      }

      const data = await response.json() as any;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting Tradovate positions:', error);
      return [];
    }
  }

  async getOrders(accountId?: number): Promise<TradovateOrder[]> {
    if (!this.auth) {
      const authenticated = await this.authenticate();
      if (!authenticated) return [];
    }

    try {
      const url = accountId 
        ? `${this.config.baseUrl}/order/deps?masterid=${accountId}`
        : `${this.config.baseUrl}/order/list`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.auth!.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get orders: ${response.status}`);
      }

      const data = await response.json() as any;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting Tradovate orders:', error);
      return [];
    }
  }

  async getExecutions(accountId?: number): Promise<TradovateExecution[]> {
    if (!this.auth) {
      const authenticated = await this.authenticate();
      if (!authenticated) return [];
    }

    try {
      const url = accountId 
        ? `${this.config.baseUrl}/fill/deps?masterid=${accountId}`
        : `${this.config.baseUrl}/fill/list`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.auth!.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get executions: ${response.status}`);
      }

      const data = await response.json() as any;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting Tradovate executions:', error);
      return [];
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        return { success: false, message: 'Authentication failed' };
      }

      const accounts = await this.getAccounts();
      return { 
        success: true, 
        message: 'Connected successfully', 
        data: { accountCount: accounts.length, accounts } 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  isConfigured(): boolean {
    return !!(this.config.username && this.config.password);
  }
}

export const tradovateService = new TradovateService();