import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const getChartSymbol = (symbol: string) => {
    if (!symbol) return 'CME:ES1!';
    
    // Clean the symbol - remove any extra characters
    const cleanSymbol = symbol.trim().toUpperCase();
    
    // Map your CSV symbols to proper TradingView symbols
    const symbolMappings: { [key: string]: string } = {
      'ES': 'CME_MINI:ES1!',
      'ESU': 'CME_MINI:ES1!',
      'ESU24': 'CME_MINI:ES1!',
      'ESH': 'CME_MINI:ES1!', 
      'ESM': 'CME_MINI:ES1!',
      'ESZ': 'CME_MINI:ES1!',
      'MES': 'CME_MINI:MES1!',
      'NQ': 'CME_MINI:NQ1!',
      'NQU': 'CME_MINI:NQ1!',
      'NQU24': 'CME_MINI:NQ1!',
      'NQH': 'CME_MINI:NQ1!',
      'NQM': 'CME_MINI:NQ1!',
      'NQZ': 'CME_MINI:NQ1!',
      'MNQ': 'CME_MINI:MNQ1!',
      'YM': 'CME_MINI:YM1!',
      'MYM': 'CME_MINI:MYM1!',
      'RTY': 'CME_MINI:RTY1!',
      'M2K': 'CME_MINI:M2K1!',
      'CL': 'NYMEX:CL1!',
      'GC': 'COMEX:GC1!',
      'SI': 'COMEX:SI1!',
      'ZB': 'CBOT:ZB1!',
      'ZN': 'CBOT:ZN1!',
      'ZF': 'CBOT:ZF1!',
      'ZT': 'CBOT:ZT1!'
    };

    // First try exact match
    if (symbolMappings[cleanSymbol]) {
      return symbolMappings[cleanSymbol];
    }

    // Then try to match base symbol (remove contract month and year)
    const baseSymbol = cleanSymbol.replace(/[HMUZ]\d*$/, '');
    if (symbolMappings[baseSymbol]) {
      return symbolMappings[baseSymbol];
    }

    // Default fallback for futures
    return 'CME_MINI:ES1!';
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

  if (!trade) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-black dark:bg-black border border-teal-500/30">
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
                <div className="text-sm text-gray-300">{trade.exitPrice ? (trade.exitPrice - trade.entryPrice).toFixed(2) : 'Open'} points</div>
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
              <div className="text-xl font-bold text-white">${trade.entryPrice?.toFixed(2) || 'N/A'}</div>
              <div className="text-xs text-blue-300 mt-1">{formatTime(trade.fillTime)}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-sm font-medium">Exit</span>
              </div>
              <div className="text-xl font-bold text-white">${trade.exitPrice?.toFixed(2) || 'Open'}</div>
              <div className="text-xs text-purple-300 mt-1">{formatTime(trade.exitTime)}</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm font-medium">Stop Loss</span>
              </div>
              <div className="text-xl font-bold text-white">${trade.initialStopLoss?.toFixed(2) || 'N/A'}</div>
              <div className="text-xs text-red-300 mt-1">Final: ${trade.finalStopLoss?.toFixed(2) || 'N/A'}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm font-medium">Take Profit</span>
              </div>
              <div className="text-xl font-bold text-white">${trade.initialTakeProfit?.toFixed(2) || 'N/A'}</div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - TradingView Chart + Summary/Executions */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      📈 Live TradingView Chart with Trade Markers
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=${getChartSymbol(trade.symbol)}`, '_blank')}
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open in TradingView
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  {/* TradingView Chart */}
                  <div className="bg-black rounded-lg h-[500px] relative overflow-hidden">
                    <iframe
                      src={`https://www.tradingview.com/embed-widget/advanced-chart/?symbol=${getChartSymbol(trade.symbol)}&interval=5&timezone=America%2FNew_York&theme=dark&style=1&locale=en&backgroundColor=rgb(0%2C0%2C0)&gridLineColor=rgb(26%2C26%2C26)&fontColor=rgb(255%2C255%2C255)&underLineColor=rgb(55%2C65%2C81)&trendLineColor=rgb(147%2C51%2C234)&isTransparent=false&autosize=true&studies=%5B%22Volume%40tv-basicstudies%22%2C%22VWAP%40tv-basicstudies%22%2C%22BB%40tv-basicstudies%22%2C%22MAExp%40tv-basicstudies%22%2C%22RSI%40tv-basicstudies%22%5D&show_popup_button=true&popup_width=1000&popup_height=650&utm_source=max-maserati&utm_medium=widget&utm_campaign=chart&utm_term=${getChartSymbol(trade.symbol)}`}
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

                    {/* P&L indicator */}
                    <div className={`absolute bottom-4 left-4 backdrop-blur border rounded-lg px-3 py-2 text-xs font-semibold pointer-events-none ${
                      trade.pnl >= 0 ? 
                      'bg-green-500/20 border-green-500/30 text-green-300' : 
                      'bg-red-500/20 border-red-500/30 text-red-300'
                    }`}>
                      💰 P&L: {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                    </div>
                  </div>
                </div>
              </div>


            </div>

            {/* Right Column - Trade Analysis */}
            <div className="space-y-6">

              {/* Notes Section */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white">📝 Trade Analysis</h3>
                </div>
                
                <div className="p-4">
                  <textarea
                    className="w-full h-32 bg-white border border-gray-600/50 rounded-lg p-4 text-black placeholder-gray-600 resize-none backdrop-blur focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
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

              {/* Individual Executions Widget */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    ⚡ Individual Executions
                  </h3>
                </div>
                
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-4 text-xs text-gray-400 font-medium border-b border-gray-600/50 pb-2">
                      <span>Time</span>
                      <span>Price</span>
                      <span>Qty</span>
                      <span>P&L</span>
                    </div>
                    
                    {/* Entry Execution */}
                    <div className="grid grid-cols-4 gap-4 text-sm text-white py-2 hover:bg-gray-700/20 rounded">
                      <span className="font-mono">{formatTime(trade.fillTime)}</span>
                      <span className="font-mono">${trade.entryPrice?.toFixed(2)}</span>
                      <span className={`font-mono font-semibold ${trade.side === 'sell' ? 'text-red-400' : 'text-green-400'}`}>
                        {trade.side === 'sell' ? '-' : '+'}{trade.quantity}
                      </span>
                      <span className="font-mono">$0</span>
                    </div>
                    
                    {/* Exit Execution (if trade is closed) */}
                    {trade.exitPrice && (
                      <div className="grid grid-cols-4 gap-4 text-sm text-white py-2 hover:bg-gray-700/20 rounded">
                        <span className="font-mono">{formatTime(trade.exitTime)}</span>
                        <span className="font-mono">${trade.exitPrice.toFixed(2)}</span>
                        <span className={`font-mono font-semibold ${trade.side === 'sell' ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.side === 'sell' ? '+' : '-'}{trade.quantity}
                        </span>
                        <span className={`font-mono font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                        </span>
                      </div>
                    )}

                    {/* No partial fills data available in current schema */}
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