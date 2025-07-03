import React, { useEffect, useRef } from 'react';
import type { Trade } from "@shared/schema";

interface TradingViewChartProps {
  trades: Trade[];
  symbol: string;
  height?: number;
  theme?: 'light' | 'dark';
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  trades,
  symbol,
  height = 400,
  theme = 'dark'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !trades.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);
    
    // Set colors based on theme
    const bgColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
    const textColor = theme === 'dark' ? '#d1d5db' : '#374151';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, height);

    // Process trade data
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sortedTrades.length === 0) return;

    const prices = sortedTrades.map(t => t.exitPrice || t.entryPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const padding = 40;
    const chartWidth = rect.width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Draw price line
    ctx.strokeStyle = '#2962FF';
    ctx.lineWidth = 2;
    ctx.beginPath();

    sortedTrades.forEach((trade, index) => {
      const x = padding + (index / Math.max(sortedTrades.length - 1, 1)) * chartWidth;
      const price = trade.exitPrice || trade.entryPrice;
      const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw trade markers
    sortedTrades.forEach((trade, index) => {
      const x = padding + (index / Math.max(sortedTrades.length - 1, 1)) * chartWidth;
      const price = trade.exitPrice || trade.entryPrice;
      const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      const pnl = trade.pnl || 0;
      
      // Draw marker circle
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = pnl > 0 ? '#10b981' : pnl < 0 ? '#ef4444' : '#6b7280';
      ctx.fill();
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw grid lines and labels
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.font = '12px system-ui';
    ctx.fillStyle = textColor;

    // Horizontal grid lines (price levels)
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * chartHeight;
      const price = maxPrice - (i / 4) * priceRange;
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
      
      ctx.fillText(price.toFixed(2), padding + chartWidth + 5, y + 4);
    }

    // Draw symbol watermark
    ctx.font = '24px system-ui';
    ctx.fillStyle = theme === 'dark' ? 'rgba(180, 180, 180, 0.4)' : 'rgba(180, 180, 180, 0.7)';
    ctx.fillText(symbol || 'PropTraderJournal', padding, height - padding / 2);

  }, [trades, symbol, height, theme]);

  const profitableTrades = trades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = trades.length > 0 ? (profitableTrades / trades.length * 100).toFixed(1) : '0';

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {symbol}
          </span>
          <span className="text-gray-400 ml-2 text-sm">Price Chart</span>
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-gray-400">
            Trades: <span className="text-white font-medium">{trades.length}</span>
          </div>
          <div className="text-gray-400">
            Win Rate: <span className={`font-medium ${parseFloat(winRate) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {winRate}%
            </span>
          </div>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        className="w-full rounded border border-gray-600"
        style={{ height: `${height}px` }}
      />
      
      <div className="flex justify-center mt-4 space-x-6 text-xs text-gray-400">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          Profitable Trade
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          Loss Trade
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
          Breakeven Trade
        </div>
      </div>
    </div>
  );
};