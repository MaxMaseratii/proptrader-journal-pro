import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: theme === 'dark' ? '#1a1a1a' : '#ffffff' },
        textColor: theme === 'dark' ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#374151' : '#e5e7eb' },
        horzLines: { color: theme === 'dark' ? '#374151' : '#e5e7eb' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB',
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: theme === 'dark' ? '#6B7280' : '#9CA3AF',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: theme === 'dark' ? '#6B7280' : '#9CA3AF',
          width: 1,
          style: 2,
        },
      },
    });

    chartRef.current = chart;

    // Add line series (simpler than candlestick for now)
    const lineSeries = chart.addSeries('Line', {
      color: '#2962FF',
      lineWidth: 2,
    });

    seriesRef.current = lineSeries;

    // Generate line data from trades
    const lineData = generateLineData(trades);
    lineSeries.setData(lineData);

    // Add trade markers
    addTradeMarkers(lineSeries, trades);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [trades, symbol, height, theme]);

  const addTradeMarkers = (series: any, trades: Trade[]) => {
    const markers = trades.map(trade => {
      const time = Math.floor(new Date(trade.date).getTime() / 1000);
      const pnl = trade.pnl || 0;
      const isProfit = pnl > 0;
      
      return {
        time,
        position: trade.side === 'buy' ? 'belowBar' : 'aboveBar',
        color: isProfit ? '#10b981' : '#ef4444',
        shape: trade.side === 'buy' ? 'arrowUp' : 'arrowDown',
        text: `${trade.side.toUpperCase()} ${trade.symbol} @ ${trade.entryPrice} | P&L: $${pnl.toFixed(2)}`,
        size: 1,
      };
    });

    try {
      series.setMarkers(markers);
    } catch (error) {
      console.log('Markers not supported in this chart version');
    }
  };

  const generateLineData = (trades: Trade[]) => {
    if (trades.length === 0) return [];

    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Generate line data showing price progression
    const lineData = sortedTrades.map(trade => {
      const time = Math.floor(new Date(trade.date).getTime() / 1000);
      const price = trade.exitPrice || trade.entryPrice || 0;
      
      return {
        time,
        value: parseFloat(price.toFixed(2)),
      };
    }).filter(point => point.value > 0);

    return lineData;
  };

  const profitableTrades = trades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = trades.length > 0 ? (profitableTrades / trades.length * 100).toFixed(1) : '0';

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {symbol}
          </span>
          <span className="ml-2 text-gray-400">Trading Chart</span>
        </h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            <span className="text-green-400">{profitableTrades}</span>
            <span className="mx-1">/</span>
            <span className="text-red-400">{trades.length - profitableTrades}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Win Rate: </span>
            <span className={`font-medium ${parseFloat(winRate) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {winRate}%
            </span>
          </div>
        </div>
      </div>
      <div 
        ref={chartContainerRef} 
        className="w-full rounded-lg overflow-hidden border border-gray-600" 
        style={{ height: `${height}px` }}
      />
    </div>
  );
};