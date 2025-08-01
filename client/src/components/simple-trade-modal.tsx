import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import type { Trade } from '@shared/schema';

interface SimpleTradeModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

const SimpleTradeModal = ({ trade, isOpen, onClose }: SimpleTradeModalProps) => {
  if (!trade) return null;

  const formatTime = (timestamp: Date | string | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  console.log('SimpleTradeModal render:', { isOpen, trade: trade?.symbol });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto bg-black border-4 border-yellow-400 text-white shadow-2xl relative">
        <DialogHeader className="border-b border-yellow-400 pb-4 bg-gray-800 p-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
                {trade.side === 'buy' ? 
                  <TrendingUp className="w-5 h-5 text-white" /> : 
                  <TrendingDown className="w-5 h-5 text-white" />
                }
              </div>
              <div>
                <div className="text-xl font-bold">{trade.symbol}</div>
                <div className="text-sm text-gray-300">{trade.side.toUpperCase()} • {trade.quantity} Contracts</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-black ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
              </div>
              <Badge className={`${trade.pnl >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {trade.pnl >= 0 ? 'PROFIT' : 'LOSS'}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Trade Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-blue-400 text-sm font-medium mb-1">Entry Price</div>
              <div className="text-xl font-bold">${trade.entryPrice}</div>
              <div className="text-xs text-gray-400">{formatTime(trade.fillTime)}</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-purple-400 text-sm font-medium mb-1">Exit Price</div>
              <div className="text-xl font-bold">${trade.exitPrice || 'Open'}</div>
              <div className="text-xs text-gray-400">{formatTime(trade.exitTime)}</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-red-400 text-sm font-medium mb-1">Stop Loss</div>
              <div className="text-xl font-bold">${trade.initialStopLoss || 'N/A'}</div>
              <div className="text-xs text-gray-400">Initial Level</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-green-400 text-sm font-medium mb-1">Take Profit</div>
              <div className="text-xl font-bold">${trade.initialTakeProfit || 'N/A'}</div>
              <div className="text-xs text-gray-400">Target Level</div>
            </div>
          </div>

          {/* Trade Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Trade Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Symbol:</span>
                  <span className="font-medium">{trade.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Direction:</span>
                  <span className={`font-medium ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.side.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="font-medium">{trade.quantity} contracts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="font-medium">{trade.date}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">P&L:</span>
                  <span className={`font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${trade.pnl.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-medium capitalize">{trade.status}</span>
                </div>
                {trade.notes && (
                  <div className="col-span-2 mt-4">
                    <div className="text-gray-400 mb-2">Notes:</div>
                    <div className="bg-gray-700 rounded p-3 text-sm">{trade.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TradingView Chart */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chart Analysis</h3>
              {trade.tradingViewLink && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(trade.tradingViewLink || '', '_blank')}
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                >
                  Open TradingView Chart
                </Button>
              )}
            </div>
            
            <div className="bg-black rounded-lg h-[400px] relative overflow-hidden">
              <iframe
                src={`https://www.tradingview.com/embed-widget/advanced-chart/?symbol=CME%3A${trade.symbol}&interval=5&timezone=America%2FNew_York&theme=dark&style=1&locale=en&backgroundColor=rgb(0%2C0%2C0)&gridLineColor=rgb(26%2C26%2C26)&fontColor=rgb(255%2C255%2C255)&autosize=true`}
                className="w-full h-full rounded-lg border-0"
                frameBorder={0}
                allow="encrypted-media"
                scrolling="no"
                title={`${trade.symbol} Chart`}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleTradeModal;