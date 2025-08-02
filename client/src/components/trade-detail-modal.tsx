import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// Note: Using regular textarea since Textarea component is not available
import { X, ExternalLink, Save, Plus, TrendingUp, TrendingDown, Clock, DollarSign, Target, BarChart3 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Trade } from '@shared/schema';

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

const TradeDetailModal = ({ trade, isOpen, onClose }: TradeDetailModalProps) => {
  const [notes, setNotes] = useState("");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [chartLoaded, setChartLoaded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize component state with trade data
  useEffect(() => {
    if (trade) {
      setNotes(trade.notes || "");
      setTags([]); // Trade tags are not in the current schema, start with empty array
      setChartLoaded(false);
    }
  }, [trade]);

  // Simple chart loading management
  useEffect(() => {
    if (isOpen && trade) {
      setChartLoaded(false);
      const timer = setTimeout(() => {
        setChartLoaded(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, trade]);

  const updateTradeMutation = useMutation({
    mutationFn: async ({ id, notes, tags }: { id: number; notes: string; tags: string[] }) => {
      return await apiRequest(`/api/trades/${id}`, 'PUT', { notes, tags });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      toast({
        title: "Trade Updated",
        description: "Trade analysis saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update trade",
        variant: "destructive",
      });
    }
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatTime = (timestamp: Date | string | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const calculateDuration = () => {
    if (!trade?.fillTime || !trade?.exitTime) return "N/A";
    const entry = new Date(trade.fillTime);
    const exit = new Date(trade.exitTime);
    const durationMs = exit.getTime() - entry.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const calculateRiskReward = () => {
    if (!trade?.initialStopLoss || !trade?.initialTakeProfit) return "N/A";
    const risk = Math.abs(trade.entryPrice - trade.initialStopLoss);
    const reward = Math.abs(trade.initialTakeProfit - trade.entryPrice);
    return (reward / risk).toFixed(2);
  };

  const saveTradeAnalysis = () => {
    if (!trade) return;
    updateTradeMutation.mutate({
      id: trade.id,
      notes: notes,
      tags: tags
    });
  };

  // Map trading symbols to TradingView compatible symbols
  const mapToTradingViewSymbol = (symbol: string) => {
    const symbolMap: { [key: string]: string } = {
      'ESU': 'CME:ES1!',        // E-mini S&P 500 Futures
      'ES': 'CME:ES1!',         // E-mini S&P 500 Futures
      'MES': 'CME:MES1!',       // Micro E-mini S&P 500 Futures
      'NQ': 'CME:NQ1!',         // E-mini NASDAQ 100 Futures
      'YM': 'CME:YM1!',         // E-mini Dow Jones Futures
      'CL': 'NYMEX:CL1!',       // Crude Oil Futures
      'GC': 'COMEX:GC1!',       // Gold Futures
      'SI': 'COMEX:SI1!',       // Silver Futures
      'EUR/USD': 'FX:EURUSD',   // EUR/USD Forex
      'GBP/USD': 'FX:GBPUSD',   // GBP/USD Forex
      'USD/JPY': 'FX:USDJPY',   // USD/JPY Forex
      'BTC': 'BINANCE:BTCUSDT', // Bitcoin
      'ETH': 'BINANCE:ETHUSDT', // Ethereum
    };
    
    return symbolMap[symbol.toUpperCase()] || `CME:${symbol.toUpperCase()}1!`;
  };

  const getTradingViewSymbol = () => {
    if (!trade) return 'CME:ES1!';
    return mapToTradingViewSymbol(trade.symbol);
  };

  if (!trade) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
                {trade.side === 'buy' ? 
                  <TrendingUp className="w-5 h-5 text-white" /> : 
                  <TrendingDown className="w-5 h-5 text-white" />
                }
              </div>
              <div>
                <div className="text-2xl font-bold">{trade.symbol}</div>
                <div className="text-sm text-purple-300">{trade.side.toUpperCase()} • {trade.quantity} Contracts</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-black ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl)}
              </div>
              <Badge className={`${trade.pnl >= 0 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                {trade.pnl >= 0 ? 'PROFIT' : 'LOSS'}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Detailed trade analysis with TradingView chart integration
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">Entry</span>
              </div>
              <div className="text-xl font-bold text-white">${trade.entryPrice}</div>
              <div className="text-xs text-blue-300 mt-1">{formatTime(trade.fillTime)}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">Exit</span>
              </div>
              <div className="text-xl font-bold text-white">${trade.exitPrice || 'Open'}</div>
              <div className="text-xs text-purple-300 mt-1">{formatTime(trade.exitTime)}</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm font-medium">Stop Loss</span>
              </div>
              <div className="text-xl font-bold text-white">${trade.initialStopLoss || 'N/A'}</div>
              <div className="text-xs text-red-300 mt-1">Initial: ${trade.initialStopLoss || 'N/A'}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm font-medium">Take Profit</span>
              </div>
              <div className="text-xl font-bold text-white">${trade.initialTakeProfit || 'N/A'}</div>
              <div className="text-xs text-green-300 mt-1">Target Level</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 text-sm font-medium">Duration</span>
              </div>
              <div className="text-xl font-bold text-white">{calculateDuration()}</div>
              <div className="text-xs text-yellow-300 mt-1">Hold Time</div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span className="text-indigo-300 text-sm font-medium">R:R Ratio</span>
              </div>
              <div className="text-xl font-bold text-white">1:{calculateRiskReward()}</div>
              <div className="text-xs text-indigo-300 mt-1">Risk:Reward</div>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - TradingView Chart (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      📈 Live TradingView Chart with Trade Markers
                    </h3>
                    {trade.tradingViewLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(trade.tradingViewLink || '', '_blank')}
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open Full Chart
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  {/* TradingView Chart */}
                  <div className="bg-black rounded-lg h-[500px] relative overflow-hidden">
                    <iframe
                      src={`https://www.tradingview.com/embed-widget/advanced-chart/?symbol=${encodeURIComponent(getTradingViewSymbol())}&interval=5&timezone=America%2FNew_York&theme=dark&style=1&locale=en&backgroundColor=rgb(0%2C0%2C0)&gridLineColor=rgb(26%2C26%2C26)&fontColor=rgb(255%2C255%2C255)&underLineColor=rgb(55%2C65%2C81)&trendLineColor=rgb(147%2C51%2C234)&isTransparent=false&autosize=true&studies=%5B%22Volume%40tv-basicstudies%22%2C%22VWAP%40tv-basicstudies%22%2C%22BB%40tv-basicstudies%22%2C%22MAExp%40tv-basicstudies%22%2C%22RSI%40tv-basicstudies%22%5D&show_popup_button=true&popup_width=1000&popup_height=650&utm_source=max-maserati&utm_medium=widget&utm_campaign=chart&utm_term=${encodeURIComponent(getTradingViewSymbol())}`}
                      className="w-full h-full rounded-lg border-0"
                      frameBorder="0"
                      scrolling="no"
                      allow="encrypted-media"
                      title={`${trade.symbol} TradingView Chart`}
                      onLoad={() => setChartLoaded(true)}
                    />
                    
                    {/* Loading overlay */}
                    {!chartLoaded && (
                      <div className="absolute inset-0 bg-black/90 flex items-center justify-center text-white z-10">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                          <p>Loading {trade.symbol} Chart...</p>
                          <p className="text-sm text-gray-400 mt-2">5-minute • Volume • VWAP • BB • EMA • RSI</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Trade Markers Overlay */}
                    {chartLoaded && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Entry Marker */}
                        <div className="absolute top-4 left-4 bg-blue-500/90 backdrop-blur border border-blue-400 rounded-lg px-3 py-2 text-xs text-white font-semibold shadow-lg">
                          📍 ENTRY: ${trade.entryPrice} • {trade.side.toUpperCase()}
                        </div>
                        
                        {/* Exit Marker */}
                        {trade.exitPrice && (
                          <div className={`absolute top-4 right-4 backdrop-blur border rounded-lg px-3 py-2 text-xs font-semibold shadow-lg ${
                            trade.pnl >= 0 ? 
                            'bg-green-500/90 border-green-400 text-white' : 
                            'bg-red-500/90 border-red-400 text-white'
                          }`}>
                            🎯 EXIT: ${trade.exitPrice} • P&L: {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                          </div>
                        )}
                        
                        {/* Stop Loss Marker */}
                        {trade.initialStopLoss && (
                          <div className="absolute bottom-20 left-4 bg-red-500/90 backdrop-blur border border-red-400 rounded-lg px-3 py-2 text-xs text-white font-semibold shadow-lg">
                            🛑 STOP: ${trade.initialStopLoss}
                          </div>
                        )}
                        
                        {/* Take Profit Marker */}
                        {trade.initialTakeProfit && (
                          <div className="absolute bottom-20 right-4 bg-green-500/90 backdrop-blur border border-green-400 rounded-lg px-3 py-2 text-xs text-white font-semibold shadow-lg">
                            💰 TARGET: ${trade.initialTakeProfit}
                          </div>
                        )}
                        
                        {/* Duration & Time Info */}
                        {trade.fillTime && trade.exitTime && (
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-500/90 backdrop-blur border border-purple-400 rounded-lg px-4 py-2 text-xs text-white font-semibold shadow-lg">
                            ⏱️ {calculateDuration()} • {formatTime(trade.fillTime)} - {formatTime(trade.exitTime)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Trade Levels Legend */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-300">Entry: ${trade.entryPrice}</span>
                    </div>
                    {trade.exitPrice && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-purple-300">Exit: ${trade.exitPrice}</span>
                      </div>
                    )}
                    {trade.initialStopLoss && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-red-300">Stop: ${trade.initialStopLoss}</span>
                      </div>
                    )}
                    {trade.initialTakeProfit && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-300">Target: ${trade.initialTakeProfit}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Trade Details & Analysis (1/3 width) */}
            <div className="space-y-6">
              {/* Trade Summary */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📊 Trade Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Direction</span>
                    <span className={`font-mono font-semibold ${trade.side === 'sell' ? 'text-red-400' : 'text-green-400'}`}>
                      {trade.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantity</span>
                    <span className="text-white font-mono">{trade.quantity} contracts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points</span>
                    <span className="text-white font-mono">{((trade.exitPrice || trade.entryPrice) - trade.entryPrice).toFixed(2)}</span>
                  </div>
                  {trade.initialStopLoss && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk (per contract)</span>
                      <span className="text-red-400 font-mono">${Math.abs(trade.entryPrice - trade.initialStopLoss).toFixed(2)}</span>
                    </div>
                  )}
                  {trade.initialTakeProfit && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reward (target)</span>
                      <span className="text-green-400 font-mono">${Math.abs(trade.initialTakeProfit - trade.entryPrice).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white">📝 Trade Analysis</h3>
                </div>
                
                <div className="p-4">
                  <textarea
                    className="w-full h-32 bg-black/30 border border-gray-600/50 rounded-lg p-4 text-white placeholder-gray-400 resize-none backdrop-blur focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                    placeholder="What did you learn from this trade?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <Button 
                    onClick={saveTradeAnalysis}
                    disabled={updateTradeMutation.isPending}
                    className="mt-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateTradeMutation.isPending ? 'Saving...' : 'Save Analysis'}
                  </Button>
                </div>
              </div>

              {/* Tags Section */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white">🏷️ Tags</h3>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge 
                        key={index}
                        className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 cursor-pointer transition-all"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add tag..." 
                      className="bg-black/30 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button 
                      onClick={addTag}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeDetailModal;