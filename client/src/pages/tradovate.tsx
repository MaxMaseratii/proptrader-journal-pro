import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Clock
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface TradovateTestResult {
  success: boolean;
  message: string;
  data?: {
    accountCount: number;
    accounts: any[];
  };
}

interface TradovatePosition {
  id: number;
  accountId: number;
  contractId: number;
  netPos: number;
  netPrice: number;
  bought: number;
  sold: number;
  timestamp: string;
  symbol?: string;
}

interface TradovateOrder {
  id: number;
  accountId: number;
  orderQty: number;
  orderType: string;
  price?: number;
  stopPrice?: number;
  ordStatus: string;
  side: string;
  symbol: string;
  timestamp: string;
}

export default function Tradovate() {
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  // Test connection query
  const { data: connectionTest, isLoading: testLoading, refetch: refetchTest } = useQuery<TradovateTestResult>({
    queryKey: ["/api/tradovate/test"],
    enabled: false, // Only run when explicitly called
  });

  // Tradovate accounts
  const { data: tradovateAccounts, isLoading: accountsLoading } = useQuery<any[]>({
    queryKey: ["/api/tradovate/accounts"],
    enabled: connectionTest?.success === true,
  });

  // Live positions
  const { data: positions, isLoading: positionsLoading, refetch: refetchPositions } = useQuery<TradovatePosition[]>({
    queryKey: ["/api/tradovate/positions"],
    enabled: connectionTest?.success === true,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Active orders
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery<TradovateOrder[]>({
    queryKey: ["/api/tradovate/orders"],
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
        queryClient.invalidateQueries({ queryKey: ["/api/tradovate/accounts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tradovate/positions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/tradovate/orders"] });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshData = () => {
    refetchPositions();
    refetchOrders();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Tradovate Integration</h1>
          <p className="text-gray-400 mt-2">Connect to Tradovate for live position tracking and trade sync</p>
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
                      {connectionTest.data.accountCount} account(s) found
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Click "Test Connection" to connect to Tradovate</p>
              <p className="text-sm text-gray-500 mt-2">
                Make sure you've set your TRADOVATE_USERNAME and TRADOVATE_PASSWORD
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {connectionTest?.success && (
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="positions">Live Positions</TabsTrigger>
            <TabsTrigger value="orders">Active Orders</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Positions</span>
                  <Badge variant="secondary" className="text-sm">
                    Live Data
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {positionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Loading positions...</span>
                  </div>
                ) : positions && positions.length > 0 ? (
                  <div className="space-y-3">
                    {positions.map((position) => (
                      <div 
                        key={position.id} 
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            position.netPos > 0 ? 'bg-green-600 bg-opacity-20' : 
                            position.netPos < 0 ? 'bg-red-600 bg-opacity-20' : 
                            'bg-gray-600 bg-opacity-20'
                          }`}>
                            {position.netPos > 0 ? (
                              <TrendingUp className="h-5 w-5 text-green-400" />
                            ) : position.netPos < 0 ? (
                              <TrendingDown className="h-5 w-5 text-red-400" />
                            ) : (
                              <Target className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {position.symbol || `Contract ${position.contractId}`}
                            </p>
                            <p className="text-sm text-gray-400">
                              Position: {position.netPos} @ {formatCurrency(position.netPrice)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {position.netPos > 0 ? "LONG" : position.netPos < 0 ? "SHORT" : "FLAT"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatDate(position.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No open positions</p>
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
                            order.side === 'Buy' ? 'bg-green-600 bg-opacity-20' : 'bg-red-600 bg-opacity-20'
                          }`}>
                            {order.side === 'Buy' ? (
                              <TrendingUp className="h-5 w-5 text-green-400" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{order.symbol}</p>
                            <p className="text-sm text-gray-400">
                              {order.orderType} • {order.orderQty} contracts
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {order.price ? formatCurrency(order.price) : 'Market'}
                          </p>
                          <Badge 
                            variant={order.ordStatus === 'Working' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {order.ordStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No active orders</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle>Tradovate Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-400">Loading accounts...</span>
                  </div>
                ) : tradovateAccounts && tradovateAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {tradovateAccounts.map((account, index) => (
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
                              ID: {account.id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {account.accountType || 'Trading'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No accounts found</p>
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