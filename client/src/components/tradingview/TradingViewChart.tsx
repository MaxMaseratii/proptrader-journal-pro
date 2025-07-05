import React, { useEffect, useRef, useState } from 'react';
import type { Trade } from "@shared/schema";

interface TradingViewChartProps {
  trades: Trade[];
  symbol: string;
  height?: number;
  theme?: 'light' | 'dark';
}

interface HoverInfo {
  trade: Trade;
  x: number;
  y: number;
  visible: boolean;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  trades,
  symbol,
  height = 400,
  theme = 'dark'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({ trade: {} as Trade, x: 0, y: 0, visible: false });

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Store trade positions for hover detection
  const tradePositions = useRef<Array<{ trade: Trade; x: number; y: number; radius: number }>>([]);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Check if mouse is over any trade marker
    const hoveredTrade = tradePositions.current.find(pos => {
      const distance = Math.sqrt(Math.pow(mouseX - pos.x, 2) + Math.pow(mouseY - pos.y, 2));
      return distance <= pos.radius + 5; // 5px tolerance
    });
    
    if (hoveredTrade) {
      setHoverInfo({
        trade: hoveredTrade.trade,
        x: mouseX,
        y: mouseY,
        visible: true
      });
    } else {
      setHoverInfo(prev => ({ ...prev, visible: false }));
    }
  };

  const handleMouseLeave = () => {
    setHoverInfo(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (!canvasRef.current || !trades.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear trade positions
    tradePositions.current = [];

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

    // Draw trade markers and store positions for hover detection
    sortedTrades.forEach((trade, index) => {
      const x = padding + (index / Math.max(sortedTrades.length - 1, 1)) * chartWidth;
      const price = trade.exitPrice || trade.entryPrice;
      const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      const pnl = trade.pnl || 0;
      const radius = 4;
      
      // Store position for hover detection
      tradePositions.current.push({ trade, x, y, radius });
      
      // Draw marker circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
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
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded border border-gray-600 cursor-crosshair"
          style={{ height: `${height}px` }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Hover Tooltip */}
        {hoverInfo.visible && (
          <div 
            className="absolute z-10 bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-prop-gold/30 rounded-lg p-3 shadow-2xl pointer-events-none backdrop-blur-sm"
            style={{
              left: Math.min(hoverInfo.x + 10, window.innerWidth - 200),
              top: Math.max(hoverInfo.y - 80, 10),
              minWidth: '180px'
            }}
          >
            <div className="text-xs text-gray-300 mb-1">
              {new Date(hoverInfo.trade.date).toLocaleDateString()}
            </div>
            <div className="text-sm font-medium text-white mb-1">
              {hoverInfo.trade.symbol || 'Unknown Symbol'}
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Entry:</span>
              <span className="text-xs text-white">{hoverInfo.trade.entryPrice?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Exit:</span>
              <span className="text-xs text-white">{hoverInfo.trade.exitPrice?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">P&L:</span>
              <span className={`text-sm font-bold ${
                (hoverInfo.trade.pnl || 0) > 0 ? 'text-prop-green' : 
                (hoverInfo.trade.pnl || 0) < 0 ? 'text-prop-pink' : 'text-prop-gold'
              }`}>
                {(hoverInfo.trade.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(hoverInfo.trade.pnl || 0)}
              </span>
            </div>
            {hoverInfo.trade.quantity && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">Qty:</span>
                <span className="text-xs text-white">{hoverInfo.trade.quantity}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
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