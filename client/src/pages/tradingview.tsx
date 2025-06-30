import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Target,
  Clock,
  BarChart3,
  Plus,
  Search
} from "lucide-react";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils";

interface TradingViewTestResult {
  success: boolean;
  message: string;
  data?: {
    apiKeyConfigured: boolean;
    testQuote: any;
  };
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

export default function TradingView() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [customSymbols, setCustomSymbols] = useState("");
  const queryClient = useQueryClient();

  // Test connection query
  const { data: connectionTest, isLoading: testLoading, refetch: refetchTest } = useQuery<TradingViewTestResult>({
    queryKey: ["/api/tradingview/test"],
    enabled: false, // Only run when explicitly called
  });

  // Market quotes
  const { data: quotes, isLoading: quotesLoading, refetch: refetchQuotes } = useQuery<TradingViewQuote[]>({
    queryKey: ["/api/tradingview/quotes"],
    enabled: connectionTest?.success === true,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Broker accounts (if connected)
  const { data: brokerAccounts, isLoading: accountsLoading } = useQuery<any[]>({
    queryKey: ["/api/tradingview/accounts"],
    enabled: connectionTest?.success === true,
  });

  // Live positions (if broker connected)
  const { data: positions, isLoading: positionsLoading, refetch: refetchPositions } = useQuery<TradingViewPosition[]>({
    queryKey: ["/api/tradingview/positions"],
    enabled: connectionTest?.success === true,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Active orders (if broker connected)
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery<TradingViewOrder[]>({
    queryKey: ["/api/tradingview/orders"],
    enabled: connectionTest?.success === true,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Test connection function
  const testConnection = async () => {
    setIsConnecting(true);
    try {
      await refetchTest();
      if (connectionTest?.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: ["/api/tradingview/quotes"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tradingview/accounts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tradingview/positions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tradingview/orders"] });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshData = () => {
    refetchQuotes();
    refetchPositions();
    refetchOrders();
  };

  const getQuoteColor = (changePercent: number) => {
    if (changePercent > 0) return "text-green-400";
    if (changePercent < 0) return "text-red-400";
    return "text-gray-400";
  };

  const getQuoteBadgeColor = (changePercent: number) => {
    if (changePercent > 0) return "bg-green-600 bg-opacity-20 text-green-400";
    if (changePercent < 0) return "bg-red-600 bg-opacity-20 text-red-400";
    return "bg-gray-600 bg-opacity-20 text-gray-400";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">TradingView Integration</h1>
          <p className="text-gray-400 mt-2">Connect to TradingView for real-time market data and trading</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={refreshData} 
            variant="outline" 
            size="sm"
            disabled={!connectionTest?.success}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="bg-dark-card border-dark-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Connection Status</span>
            <Button 
              onClick={testConnection} 
              disabled={isConnecting || testLoading}
              variant={connectionTest?.success ? "outline" : "default"}
            >
              {isConnecting || testLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : connectionTest?.success ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
              )}
              {isConnecting || testLoading ? "Connecting..." : "Test Connection"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectionTest ? (
            <Alert className={connectionTest.success ? "border-green-500" : "border-red-500"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{connectionTest.message}</span>
                  {connectionTest.success && connectionTest.data && (
                    <Badge variant="secondary">
                      API Connected
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Click "Test Connection" to connect to TradingView</p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure you've set your TRADINGVIEW_API_KEY environment variable
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {connectionTest?.success && (
        <Tabs defaultValue="quotes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quotes">Market Data</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="space-y-4">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Real-Time Market Data</span>
                  <Badge variant="secondary" className="text-sm">
                    Live • Updates every 10s
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quotesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Loading market data...</span>
                  </div>
                ) : quotes && quotes.length > 0 ? (
                  <div className="space-y-3">
                    {quotes.map((quote) => (
                      <div 
                        key={quote.symbol} 
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            quote.changePercent > 0 ? 'bg-green-600 bg-opacity-20' : 
                            quote.changePercent < 0 ? 'bg-red-600 bg-opacity-20' : 
                            'bg-gray-600 bg-opacity-20'
                          }`}>
                            {quote.changePercent > 0 ? (
                              <TrendingUp className="h-5 w-5 text-green-400" />
                            ) : quote.changePercent < 0 ? (
                              <TrendingDown className="h-5 w-5 text-red-400" />
                            ) : (
                              <Target className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{quote.symbol}</p>
                            <p className="text-sm text-gray-400">
                              Vol: {quote.volume.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatCurrency(quote.price)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${getQuoteColor(quote.changePercent)}`}>
                              {quote.change >= 0 ? '+' : ''}{formatCurrency(quote.change)}
                            </span>
                            <Badge className={`text-xs ${getQuoteBadgeColor(quote.changePercent)}`}>
                              {quote.changePercent >= 0 ? '+' : ''}{formatPercentage(quote.changePercent)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No market data available</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Check your TradingView API permissions and data subscriptions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle>Current Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {positionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Loading positions...</span>
                  </div>
                ) : positions && positions.length > 0 ? (
                  <div className="space-y-3">
                    {positions.map((position, index) => (
                      <div 
                        key={`${position.symbol}-${index}`} 
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            position.side === 'long' ? 'bg-green-600 bg-opacity-20' : 'bg-red-600 bg-opacity-20'
                          }`}>
                            {position.side === 'long' ? (
                              <TrendingUp className="h-5 w-5 text-green-400" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{position.symbol}</p>
                            <p className="text-sm text-gray-400">
                              {position.side.toUpperCase()} • {position.size} shares @ {formatCurrency(position.entryPrice)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatCurrency(position.currentPrice)}
                          </p>
                          <p className={`text-sm ${position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPnl)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No open positions</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Connect your broker account through TradingView to see positions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle>Active Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Loading orders...</span>
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            order.side === 'buy' ? 'bg-green-600 bg-opacity-20' : 'bg-red-600 bg-opacity-20'
                          }`}>
                            {order.side === 'buy' ? (
                              <TrendingUp className="h-5 w-5 text-green-400" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{order.symbol}</p>
                            <p className="text-sm text-gray-400">
                              {order.type.toUpperCase()} • {order.quantity} shares
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {order.price ? formatCurrency(order.price) : 'Market'}
                          </p>
                          <Badge 
                            variant={order.status === 'working' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No active orders</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Connect your broker account through TradingView to see orders
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle>Connected Broker Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Loading accounts...</span>
                  </div>
                ) : brokerAccounts && brokerAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {brokerAccounts.map((account, index) => (
                      <div 
                        key={account.id || index} 
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-600 bg-opacity-20 p-2 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {account.name || `Account ${account.id}`}
                            </p>
                            <p className="text-sm text-gray-400">
                              {account.broker || 'Broker'} • {account.currency || 'USD'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatCurrency(account.balance || 0)}
                          </p>
                          <Badge 
                            variant={account.status === 'connected' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {account.status || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No broker accounts connected</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Connect your broker account in TradingView to see account details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}