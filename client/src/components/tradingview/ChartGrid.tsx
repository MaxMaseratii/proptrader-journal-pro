import React, { useState } from 'react';
import { TradingViewChart } from './TradingViewChart';
import type { Trade, Account } from "@shared/schema";
import { Grid3X3, Grid2X2, Square, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartGridProps {
  trades: Trade[];
  accounts: Account[];
  symbols: string[];
  gridSize?: 1 | 2 | 4;
}

export const ChartGrid: React.FC<ChartGridProps> = ({
  trades,
  accounts,
  symbols,
  gridSize: initialGridSize = 2
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(symbols?.[0] || '');
  const [gridSize, setGridSize] = useState<1 | 2 | 4>(initialGridSize);

  const getTradesForSymbol = (symbol: string) => {
    return trades.filter(trade => trade.symbol === symbol);
  };

  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const getUniqueSymbols = () => {
    const uniqueSymbols = Array.from(new Set(trades.map(trade => trade.symbol).filter(Boolean)));
    return uniqueSymbols.slice(0, 12); // Limit to 12 symbols for performance
  };

  const availableSymbols = symbols.length > 0 ? symbols : getUniqueSymbols();

  if (availableSymbols.length === 0) {
    return (
      <div className="w-full bg-gray-900 rounded-lg p-8 text-center border border-gray-700">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No Trading Data Available</h3>
        <p className="text-gray-500">Import your trades to see interactive charts with entry/exit points</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-4">
          <label className="text-gray-300 text-sm font-medium">Symbol:</label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableSymbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-300 text-sm font-medium mr-2">Layout:</span>
          <Button
            variant={gridSize === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setGridSize(1)}
            className="p-2"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant={gridSize === 2 ? "default" : "outline"}
            size="sm"
            onClick={() => setGridSize(2)}
            className="p-2"
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={gridSize === 4 ? "default" : "outline"}
            size="sm"
            onClick={() => setGridSize(4)}
            className="p-2"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Single Chart View */}
      {gridSize === 1 && (
        <TradingViewChart
          trades={getTradesForSymbol(selectedSymbol)}
          accounts={accounts}
          symbol={selectedSymbol}
          height={500}
        />
      )}

      {/* Multi-Chart Grid */}
      {gridSize > 1 && (
        <div className={`grid ${gridClasses[gridSize]} gap-6`}>
          {availableSymbols.slice(0, gridSize).map(symbol => {
            const symbolTrades = getTradesForSymbol(symbol);
            return (
              <TradingViewChart
                key={symbol}
                trades={symbolTrades}
                accounts={accounts}
                symbol={symbol}
                height={gridSize === 4 ? 250 : 300}
              />
            );
          })}
        </div>
      )}

      {/* Trading Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {availableSymbols.slice(0, 8).map(symbol => {
          const symbolTrades = getTradesForSymbol(symbol);
          const totalPnl = symbolTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
          const winningTrades = symbolTrades.filter(t => (t.pnl || 0) > 0).length;
          const winRate = symbolTrades.length > 0 ? (winningTrades / symbolTrades.length * 100).toFixed(1) : '0';

          return (
            <div key={symbol} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-medium text-white mb-2">{symbol}</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">P&L:</span>
                  <span className={totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                    ${totalPnl.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Win Rate:</span>
                  <span className={parseFloat(winRate) >= 50 ? 'text-green-500' : 'text-red-500'}>
                    {winRate}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Trades:</span>
                  <span className="text-gray-300">{symbolTrades.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};