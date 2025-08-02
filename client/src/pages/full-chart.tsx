import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullChartProps {}

const FullChart: React.FC<FullChartProps> = () => {
  const [, setLocation] = useLocation();
  
  // Get symbol from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const symbol = urlParams.get('symbol') || 'CME_MINI:ES1!';

  useEffect(() => {
    // Load TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      // Initialize TradingView widget
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: '5',
          timezone: 'America/New_York',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#000000',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: 'tradingview_fullchart',
          hide_top_toolbar: false,
          studies: [
            'Volume@tv-basicstudies',
            'VWAP@tv-basicstudies',
            'BB@tv-basicstudies',
            'MAExp@tv-basicstudies',
            'RSI@tv-basicstudies'
          ],
          backgroundColor: '#000000',
          gridLineColor: '#1a1a1a',
          fontColor: '#ffffff'
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [symbol]);

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-purple-900 border-b border-purple-500/30">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setLocation('/trades')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-purple-500/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trades
          </Button>
          <h1 className="text-xl font-bold text-white">
            Full Chart View - {symbol}
          </h1>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 p-4">
        <div className="h-full bg-black rounded-lg border border-gray-700/50 overflow-hidden">
          <div 
            id="tradingview_fullchart" 
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for TradingView
declare global {
  interface Window {
    TradingView: any;
  }
}

export default FullChart;