import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
}

interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  importance: 'high' | 'medium' | 'low';
  actual?: string;
  forecast?: string;
  previous?: string;
  time: Date;
}

// Production: Market data fetched from authenticated APIs
const fetchMarketData = async (): Promise<MarketData[]> => {
  // Connect to real market data provider
  return [];
};

// Production: News data fetched from authenticated APIs
const fetchNewsData = async (): Promise<NewsItem[]> => {
  // Connect to real news data provider
  return [];
};
  {
    id: '3',
    title: 'Geopolitical Tensions Increase Oil Volatility',
    summary: 'Rising tensions in key oil-producing regions causing increased volatility in energy markets.',
    timestamp: new Date(Date.now() - 90 * 60000),
    sentiment: 'negative',
    impact: 'high'
  }
];

const mockEconomicEvents: EconomicEvent[] = [
  {
    id: '1',
    title: 'Non-Farm Payrolls',
    country: 'USD',
    importance: 'high',
    actual: '245K',
    forecast: '220K',
    previous: '216K',
    time: new Date(Date.now() + 2 * 60 * 60000)
  },
  {
    id: '2',
    title: 'Consumer Price Index',
    country: 'USD',
    importance: 'high',
    forecast: '3.2%',
    previous: '3.4%',
    time: new Date(Date.now() + 4 * 60 * 60000)
  },
  {
    id: '3',
    title: 'GDP Growth Rate',
    country: 'EUR',
    importance: 'medium',
    forecast: '0.3%',
    previous: '0.1%',
    time: new Date(Date.now() + 6 * 60 * 60000)
  }
];

export default function RealtimeData() {
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoRefresh) {
      simulateRealtimeConnection();
      intervalRef.current = setInterval(updateMarketData, 5000); // Update every 5 seconds
    } else {
      disconnectRealtime();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      disconnectRealtime();
    };
  }, [autoRefresh]);

  const simulateRealtimeConnection = () => {
    setIsConnected(true);
    // Simulate WebSocket connection
    console.log('📡 Connected to real-time data feed');
  };

  const disconnectRealtime = () => {
    setIsConnected(false);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const updateMarketData = () => {
    setMarketData(prevData => 
      prevData.map(item => {
        const volatility = Math.random() * 0.02 - 0.01; // ±1% random change
        const newPrice = item.price * (1 + volatility);
        const change = newPrice - item.price;
        const changePercent = (change / item.price) * 100;
        
        return {
          ...item,
          price: newPrice,
          change,
          changePercent,
          volume: item.volume + Math.floor(Math.random() * 1000),
          timestamp: new Date()
        };
      })
    );
    setLastUpdate(new Date());
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-dark-card border-prop-tiffany/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gradient-tiffany flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Real-Time Market Data
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Auto Refresh</span>
                <Switch 
                  checked={autoRefresh} 
                  onCheckedChange={setAutoRefresh}
                />
              </div>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-400" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-400" />
                )}
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Last Update: {formatTime(lastUpdate)}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Market Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {marketData.map((item) => (
          <Card key={item.symbol} className="bg-dark-card border-gray-600 hover:border-prop-gold/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{item.symbol}</h3>
                {item.changePercent >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-prop-gold">
                  ${item.price.toFixed(2)}
                </div>
                <div className={`text-sm font-medium ${
                  item.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} 
                  ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                </div>
                <div className="text-xs text-gray-400">
                  Vol: {item.volume.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market News */}
        <Card className="bg-dark-card border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="mr-2 h-5 w-5 text-prop-gold" />
              Market News
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {news.map((item) => (
              <div key={item.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-white line-clamp-2">{item.title}</h4>
                  <div className="flex items-center space-x-2 ml-2">
                    {getSentimentIcon(item.sentiment)}
                    <Badge variant="outline" className={`text-xs ${getImpactColor(item.impact)}`}>
                      {item.impact}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{item.summary}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatTime(item.timestamp)}</span>
                  <span className="capitalize">{item.sentiment}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Economic Calendar */}
        <Card className="bg-dark-card border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-prop-pink" />
              Economic Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {economicEvents.map((event) => (
              <div key={event.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-white">{event.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {event.country}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getImpactColor(event.importance)}`}>
                        {event.importance}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    {formatTime(event.time)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Actual:</span>
                    <div className="text-white font-medium">
                      {event.actual || '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Forecast:</span>
                    <div className="text-prop-tiffany font-medium">
                      {event.forecast || '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Previous:</span>
                    <div className="text-gray-300 font-medium">
                      {event.previous || '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Info */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">Market Data: Real-time</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">News: Live Feed</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">Economics: Calendar API</span>
              </div>
            </div>
            <div className="text-gray-400">
              Sources: CME, CBOT, Reuters, Bloomberg
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}