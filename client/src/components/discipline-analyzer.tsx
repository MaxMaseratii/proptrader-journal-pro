import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Brain,
  Clock,
  Award,
  Eye,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Calculator,
  Calendar,
  Upload,
  FileText,
  Zap,
  RefreshCw,
  TrendingDown,
  DollarSign,
  Users,
  Database
} from "lucide-react";

interface DisciplineMetrics {
  totalTrades: number;
  totalOrders: number;
  filledOrders: number;
  cancelledOrders: number;
  cancellationRate: number;
  stopLossHits: number;
  stopLossMoved: number;
  stopLossMovedAgainst: number;
  stopLossMovedInFavor: number;
  takeProfitHits: number;
  overRisked: number;
  emotionalTrades: number;
  consecutiveLosses: number;
  maxDrawdown: number;
  disciplineScore: number;
  averageTradeTime: number;
  scalping: number;
  dayTrading: number;
  swingTrading: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: any;
  worstTrade: any;
  orderModificationRate: number;
  revengeTrading: number;
  fomoTrades: number;
  timeOfDayAnalysis: any;
  assetPerformance: any;
}

interface TradeData {
  orderId: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  timestamp: string;
  status: string;
  type: string;
  limitPrice?: number;
  stopPrice?: number;
  account: string;
}

interface CompleteTrade {
  symbol: string;
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  side: string;
  pnl: number;
  duration: number;
  hadModifications: boolean;
  cancelledOrders: number;
  behaviorType: string;
  riskReward: number;
}

export default function DisciplineAnalyzer() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [disciplineData, setDisciplineData] = useState<DisciplineMetrics | null>(null);
  const [tradeDetails, setTradeDetails] = useState<CompleteTrade[]>([]);
  const [rawOrders, setRawOrders] = useState<TradeData[]>([]);
  const { toast } = useToast();

  // Enhanced CSV parsing with better error handling
  const parseCSV = useCallback((csvText: string) => {
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const orders: TradeData[] = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        return {
          orderId: row.orderId || row['Order ID'] || '',
          symbol: row.Product || row.Symbol || '',
          side: row['B/S'] ? row['B/S'].trim() : '',
          quantity: Math.abs(parseFloat(row.filledQty) || parseFloat(row['Filled Qty']) || parseFloat(row.Quantity) || 0),
          price: parseFloat(row.avgPrice) || parseFloat(row['Avg Fill Price']) || 0,
          timestamp: row['Fill Time'] || row.Timestamp || '',
          status: row.Status ? row.Status.trim() : '',
          type: row.Type ? row.Type.trim() : '',
          limitPrice: parseFloat(row['Limit Price']) || undefined,
          stopPrice: parseFloat(row['Stop Price']) || undefined,
          account: row.Account || ''
        };
      }).filter(order => order.orderId && order.symbol);
      
      return orders;
    } catch (error: any) {
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  }, []);

  // Group orders into complete trades for behavior analysis
  const groupOrdersIntoTrades = useCallback((orders: TradeData[]) => {
    const trades: CompleteTrade[] = [];
    const processedOrders = new Set();
    
    const filledOrders = orders.filter(o => o.status === 'Filled')
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    filledOrders.forEach((order, index) => {
      if (processedOrders.has(index)) return;
      
      const symbol = order.symbol;
      const side = order.side.toLowerCase();
      const quantity = order.quantity;
      const price = order.price;
      const timestamp = new Date(order.timestamp);
      
      // Look for opposing trade within 48 hours
      const timeWindow = 48 * 60 * 60 * 1000;
      
      const matchingExit = filledOrders.find((exitOrder, exitIndex) => {
        if (processedOrders.has(exitIndex) || exitIndex === index) return false;
        if (exitOrder.symbol !== symbol) return false;
        
        const exitSide = exitOrder.side.toLowerCase();
        const exitTime = new Date(exitOrder.timestamp);
        const exitQty = exitOrder.quantity;
        
        const isOpposingTrade = (side.includes('buy') && exitSide.includes('sell')) || 
                               (side.includes('sell') && exitSide.includes('buy'));
        const isWithinTimeWindow = Math.abs(exitTime.getTime() - timestamp.getTime()) <= timeWindow;
        const isSameQuantity = Math.abs(quantity - exitQty) < 0.01;
        
        return isOpposingTrade && isWithinTimeWindow && isSameQuantity;
      });

      if (matchingExit) {
        const entryPrice = price;
        const exitPrice = matchingExit.price;
        const multiplier = side.includes('buy') ? 1 : -1;
        const duration = (new Date(matchingExit.timestamp).getTime() - timestamp.getTime()) / (1000 * 60); // minutes
        
        // Calculate P&L (using ES point value of $50 as default)
        const pointValue = symbol === 'ES' ? 50 : symbol === 'NQ' ? 20 : symbol === 'MES' ? 5 : 50;
        const pnl = (exitPrice - entryPrice) * quantity * multiplier * pointValue;
        
        // Check for cancelled orders between entry and exit
        const entryTime = timestamp;
        const exitTime = new Date(matchingExit.timestamp);
        const cancelledBetween = orders.filter(o => 
          o.status === 'Canceled' &&
          o.symbol === symbol &&
          new Date(o.timestamp) >= entryTime &&
          new Date(o.timestamp) <= exitTime
        );
        
        // Determine behavior type
        let behaviorType = 'Disciplined';
        if (cancelledBetween.length > 0) {
          behaviorType = 'Modified SL/TP';
          if (Math.abs(exitPrice - entryPrice) / entryPrice < 0.002) {
            behaviorType = 'Moved to Breakeven';
          }
        }
        
        // Calculate risk-reward
        const riskReward = pnl > 0 ? Math.abs(pnl) / (Math.abs(entryPrice - (order.stopPrice || entryPrice * 0.99)) * quantity * pointValue) : 0;
        
        trades.push({
          symbol,
          entryTime: order.timestamp,
          exitTime: matchingExit.timestamp,
          entryPrice,
          exitPrice,
          quantity,
          side: side.includes('buy') ? 'Long' : 'Short',
          pnl,
          duration,
          hadModifications: cancelledBetween.length > 0,
          cancelledOrders: cancelledBetween.length,
          behaviorType,
          riskReward
        });
        
        processedOrders.add(index);
        processedOrders.add(filledOrders.indexOf(matchingExit));
      }
    });
    
    return trades;
  }, []);

  // Advanced discipline analysis
  const analyzeDiscipline = useCallback((orders: TradeData[], trades: CompleteTrade[]): DisciplineMetrics => {
    const filledOrders = orders.filter(o => o.status === 'Filled');
    const cancelledOrders = orders.filter(o => o.status === 'Canceled');
    
    // Basic metrics
    const totalOrders = orders.length;
    const cancellationRate = (cancelledOrders.length / totalOrders) * 100;
    
    // Trade-specific metrics
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
    
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;
    
    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
    
    // Duration analysis
    const durations = trades.map(t => t.duration);
    const avgTradeTime = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
    
    const scalping = trades.filter(t => t.duration <= 5).length;
    const dayTrading = trades.filter(t => t.duration > 5 && t.duration <= 360).length;
    const swingTrading = trades.filter(t => t.duration > 360).length;
    
    // Discipline-specific metrics
    const stopLossMoved = trades.filter(t => t.hadModifications).length;
    const disciplinedTrades = trades.filter(t => !t.hadModifications).length;
    const stopLossHits = trades.filter(t => t.pnl < 0 && !t.hadModifications).length;
    
    // Emotional trading indicators
    const consecutiveLosses = calculateConsecutiveLosses(trades);
    const revengeTrading = consecutiveLosses > 3 ? 1 : 0;
    const fomoTrades = trades.filter(t => t.duration < 2).length; // Very quick trades
    const emotionalTrades = trades.filter(t => t.hadModifications && t.pnl < 0).length;
    
    // Time of day analysis
    const timeOfDayAnalysis = analyzeTimeOfDay(trades);
    
    // Asset performance
    const assetPerformance = analyzeAssetPerformance(trades);
    
    // Calculate discipline score
    const stopLossRespect = trades.length > 0 ? (stopLossHits / trades.length) * 25 : 0;
    const orderDiscipline = ((totalOrders - cancelledOrders.length) / totalOrders) * 25;
    const emotionalControl = trades.length > 0 ? ((trades.length - emotionalTrades) / trades.length) * 25 : 25;
    const consistencyBonus = consecutiveLosses < 5 ? 25 : Math.max(0, 25 - consecutiveLosses * 2);
    
    const disciplineScore = Math.round(stopLossRespect + orderDiscipline + emotionalControl + consistencyBonus);
    
    return {
      totalTrades: trades.length,
      totalOrders,
      filledOrders: filledOrders.length,
      cancelledOrders: cancelledOrders.length,
      cancellationRate,
      stopLossHits,
      stopLossMoved,
      stopLossMovedAgainst: stopLossMoved, // Simplified
      stopLossMovedInFavor: 0,
      takeProfitHits: winningTrades.filter(t => !t.hadModifications).length,
      overRisked: trades.filter(t => t.quantity > 5).length, // Assuming 5+ contracts is over-risking
      emotionalTrades,
      consecutiveLosses,
      maxDrawdown: calculateMaxDrawdown(trades),
      disciplineScore,
      averageTradeTime: avgTradeTime / 60, // Convert to hours
      scalping,
      dayTrading,
      swingTrading,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      bestTrade: trades.reduce((best, trade) => trade.pnl > best.pnl ? trade : best, trades[0]),
      worstTrade: trades.reduce((worst, trade) => trade.pnl < worst.pnl ? trade : worst, trades[0]),
      orderModificationRate: cancellationRate,
      revengeTrading,
      fomoTrades,
      timeOfDayAnalysis,
      assetPerformance
    };
  }, []);

  // Helper functions
  const calculateConsecutiveLosses = (trades: CompleteTrade[]): number => {
    let maxConsecutive = 0;
    let current = 0;
    
    trades.sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
    
    for (const trade of trades) {
      if (trade.pnl < 0) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 0;
      }
    }
    
    return maxConsecutive;
  };

  const calculateMaxDrawdown = (trades: CompleteTrade[]): number => {
    let peak = 0;
    let drawdown = 0;
    let runningPnl = 0;
    
    trades.sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
    
    for (const trade of trades) {
      runningPnl += trade.pnl;
      peak = Math.max(peak, runningPnl);
      drawdown = Math.max(drawdown, peak - runningPnl);
    }
    
    return drawdown;
  };

  const analyzeTimeOfDay = (trades: CompleteTrade[]) => {
    const timeSlots = {
      morning: 0,    // 6-12
      afternoon: 0,  // 12-18
      evening: 0,    // 18-24
      night: 0       // 0-6
    };
    
    trades.forEach(trade => {
      const hour = new Date(trade.entryTime).getHours();
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else if (hour >= 18 && hour < 24) timeSlots.evening++;
      else timeSlots.night++;
    });
    
    return timeSlots;
  };

  const analyzeAssetPerformance = (trades: CompleteTrade[]) => {
    const assetStats: Record<string, any> = {};
    
    trades.forEach(trade => {
      if (!assetStats[trade.symbol]) {
        assetStats[trade.symbol] = {
          trades: 0,
          totalPnL: 0,
          wins: 0,
          losses: 0
        };
      }
      
      assetStats[trade.symbol].trades++;
      assetStats[trade.symbol].totalPnL += trade.pnl;
      if (trade.pnl > 0) assetStats[trade.symbol].wins++;
      else assetStats[trade.symbol].losses++;
    });
    
    return assetStats;
  };

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    setIsProcessing(true);
    setProcessingStage("Reading CSV file...");

    try {
      const content = await file.text();
      
      setProcessingStage("Parsing orders...");
      const orders = parseCSV(content);
      setRawOrders(orders);
      
      setProcessingStage("Analyzing trade patterns...");
      const trades = groupOrdersIntoTrades(orders);
      setTradeDetails(trades);
      
      setProcessingStage("Calculating discipline metrics...");
      const metrics = analyzeDiscipline(orders, trades);
      setDisciplineData(metrics);
      
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${orders.length} orders and ${trades.length} complete trades.`,
      });
      
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Trading Discipline Analyzer
          </h2>
          <p className="text-gray-400 mt-2">Deep analysis of your trading psychology and behavioral patterns from CSV data</p>
        </div>
      </div>

      {/* File Upload Section */}
      {!disciplineData && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Upload className="mr-2 h-5 w-5 text-blue-400" />
              Upload Trading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-300 mb-2">
                    {csvFile ? csvFile.name : "Click to upload your trading CSV file"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports Tradovate, MT4/5, and other broker formats
                  </p>
                </label>
              </div>
              
              {isProcessing && (
                <div className="flex items-center space-x-4 p-4 bg-blue-900/20 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
                  <span className="text-blue-300">{processingStage}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {disciplineData && (
        <>
          {/* Discipline Score Overview */}
          <Card className="bg-gray-800 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-yellow-400" />
                <span className="text-white">Overall Discipline Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-400 mb-2">
                    {disciplineData.disciplineScore}
                  </div>
                  <Badge className={`text-lg px-4 py-2 ${
                    disciplineData.disciplineScore >= 80 ? 'bg-green-600 text-white' :
                    disciplineData.disciplineScore >= 60 ? 'bg-yellow-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {disciplineData.disciplineScore >= 80 ? 'Excellent Discipline' :
                     disciplineData.disciplineScore >= 60 ? 'Good Discipline' : 
                     'Needs Improvement'}
                  </Badge>
                </div>
                
                <div className="flex-1 ml-8">
                  <Progress 
                    value={disciplineData.disciplineScore} 
                    className="h-4 mb-6"
                  />
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-400">Order Discipline</div>
                      <div className="font-bold text-white text-lg">
                        {(100 - disciplineData.cancellationRate).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Risk Control</div>
                      <div className="font-bold text-white text-lg">
                        {disciplineData.totalTrades > 0 ? 
                          (((disciplineData.totalTrades - disciplineData.overRisked) / disciplineData.totalTrades) * 100).toFixed(0) : 0}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Emotional Control</div>
                      <div className="font-bold text-white text-lg">
                        {disciplineData.totalTrades > 0 ? 
                          (((disciplineData.totalTrades - disciplineData.emotionalTrades) / disciplineData.totalTrades) * 100).toFixed(0) : 0}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Consistency</div>
                      <div className="font-bold text-white text-lg">
                        {disciplineData.consecutiveLosses < 5 ? 100 : Math.max(0, 100 - disciplineData.consecutiveLosses * 5)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Order Cancellation Rate</p>
                    <p className="text-3xl font-bold text-red-400">
                      {disciplineData.cancellationRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {disciplineData.cancelledOrders}/{disciplineData.totalOrders} orders
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Win Rate</p>
                    <p className="text-3xl font-bold text-green-400">
                      {disciplineData.winRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {disciplineData.totalTrades} total trades
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Profit Factor</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {disciplineData.profitFactor.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Risk-reward ratio
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Max Consecutive Losses</p>
                    <p className="text-3xl font-bold text-orange-400">
                      {disciplineData.consecutiveLosses}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Emotional control indicator
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center">
            <Button 
              onClick={() => {
                setDisciplineData(null);
                setCsvFile(null);
                setTradeDetails([]);
                setRawOrders([]);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Analyze Another File
            </Button>
          </div>
        </>
      )}
    </div>
  );
}