import { memo, useMemo, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialShareButtons } from './SocialShareButtons';

// Lazy load heavy dashboard components
const TradingViewWidget = lazy(() => import('@/components/TradingViewWidget'));
const AdvancedCharts = lazy(() => import('@/components/AdvancedCharts'));

interface DashboardData {
  totalPnL: number;
  winRate: number;
  bestDay: number;
  currentStreak: number;
  recentTrades: any[];
}

interface DashboardOptimizationsProps {
  data: DashboardData;
}

// Performance optimized dashboard header with social sharing
export const DashboardHeader = memo<DashboardOptimizationsProps>(({ data }) => {
  const shareData = useMemo(() => ({
    totalPnL: data.totalPnL >= 0 ? `+$${data.totalPnL.toFixed(2)}` : `-$${Math.abs(data.totalPnL).toFixed(2)}`,
    winRate: `${data.winRate.toFixed(1)}%`,
    bestDay: `$${data.bestDay.toFixed(2)}`,
    currentStreak: data.currentStreak
  }), [data]);

  return (
    <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">
          Trading Performance Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total P&L</p>
            <p className={`text-2xl font-bold ${data.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {shareData.totalPnL}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Win Rate</p>
            <p className="text-2xl font-bold text-yellow-400">{shareData.winRate}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Best Day</p>
            <p className="text-2xl font-bold text-green-400">{shareData.bestDay}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Current Streak</p>
            <p className="text-2xl font-bold text-blue-400">{data.currentStreak} days</p>
          </div>
        </div>
        
        <SocialShareButtons shareData={shareData} />
      </CardContent>
    </Card>
  );
});

// Optimized widget component with loading states
export const OptimizedWidget = memo<{ 
  title: string; 
  children: React.ReactNode; 
  loading?: boolean;
}>(({ title, children, loading = false }) => {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
});

// Lazy loaded chart wrapper with error boundary
export const LazyChartWrapper = memo<{ type: 'tradingview' | 'advanced' }>(({ type }) => (
  <Suspense fallback={
    <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
      <p className="text-gray-500">Loading chart...</p>
    </div>
  }>
    {type === 'tradingview' ? <TradingViewWidget /> : <AdvancedCharts />}
  </Suspense>
));

DashboardHeader.displayName = 'DashboardHeader';
OptimizedWidget.displayName = 'OptimizedWidget';
LazyChartWrapper.displayName = 'LazyChartWrapper';