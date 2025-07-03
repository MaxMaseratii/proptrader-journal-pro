import React, { useEffect, useRef } from 'react';
import type { Trade } from "@shared/schema";
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface SimpleChartProps {
  trades: Trade[];
  symbol: string;
  height?: number;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  trades,
  symbol,
  height = 400,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || trades.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const padding = 40;
    const chartWidth = rect.width - (padding * 2);
    const chartHeight = rect.height - (padding * 2);

    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Get price range
    const prices = sortedTrades.map(t => t.entryPrice || 0).filter(p => p > 0);
    const exitPrices = sortedTrades.map(t => t.exitPrice || 0).filter(p => p > 0);
    const allPrices = [...prices, ...exitPrices];
    
    if (allPrices.length === 0) return;

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (chartWidth * i / 10);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    // Draw price line
    ctx.strokeStyle = '#2962FF';
    ctx.lineWidth = 2;
    ctx.beginPath();

    sortedTrades.forEach((trade, index) => {
      const x = padding + (chartWidth * index / (sortedTrades.length - 1));
      const price = trade.exitPrice || trade.entryPrice || 0;
      const y = padding + chartHeight - ((price - minPrice) / priceRange * chartHeight);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw trade markers
    sortedTrades.forEach((trade, index) => {
      const x = padding + (chartWidth * index / (sortedTrades.length - 1));
      const price = trade.exitPrice || trade.entryPrice || 0;
      const y = padding + chartHeight - ((price - minPrice) / priceRange * chartHeight);
      const pnl = trade.pnl || 0;
      
      // Draw marker circle
      ctx.fillStyle = pnl > 0 ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw marker border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw price labels
    ctx.fillStyle = '#d1d5db';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * (5 - i) / 5);
      const y = padding + (chartHeight * i / 5) + 4;
      ctx.fillText(price.toFixed(2), padding - 10, y);
    }

  }, [trades, symbol]);

  const profitableTrades = trades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = trades.length > 0 ? (profitableTrades / trades.length * 100).toFixed(1) : '0';
  const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

  if (trades.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-8 text-center border border-gray-700" style={{ height: `${height}px` }}>
        <BarChart3 className="mx-auto h-12 w-12 text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No {symbol} trades</h3>
        <p className="text-gray-500">Start trading {symbol} to see your price chart</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {symbol}
          </span>
          <span className="ml-2 text-gray-400">Price Chart</span>
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm">
            {totalPnl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
            )}
            <span className={totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
              ${totalPnl.toFixed(0)}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            <span className="text-green-400">{profitableTrades}</span>
            <span className="mx-1">/</span>
            <span className="text-red-400">{trades.length - profitableTrades}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Win: </span>
            <span className={`font-medium ${parseFloat(winRate) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {winRate}%
            </span>
          </div>
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        className="w-full rounded-lg border border-gray-600"
        style={{ height: `${height - 80}px` }}
      />
    </div>
  );
};