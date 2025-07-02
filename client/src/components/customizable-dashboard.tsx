import React, { useState, useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { calculateDisciplinedScore, getScoreColor } from "@/lib/disciplined-score";
import { EquityChart, MonthlyPerformanceChart } from "@/components/chart-components";
import TradeAnalysisCalendar from "@/components/trade-analysis-calendar";
import { Settings, Eye, EyeOff, Grid, Save } from "lucide-react";
import type { Account, Trade } from "@shared/schema";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  defaultSize: { w: number; h: number };
  category: string;
}

interface CustomizableDashboardProps {
  accounts: Account[];
  trades: Trade[];
  analytics: any[];
}

// Widget Components
const ActiveAccountsWidget = ({ accounts }: { accounts: Account[] }) => (
  <Card className="h-full bg-prop-card border-prop-gold/20">
    <CardHeader className="pb-3">
      <CardTitle className="text-prop-gold text-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Active Accounts
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {accounts.slice(0, 3).map((account) => (
        <div key={account.id} className="flex justify-between items-center p-3 bg-dark-card rounded-lg">
          <div>
            <p className="text-white font-medium">{account.name}</p>
            <p className="text-xs text-gray-400 capitalize">{account.type}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold">{formatCurrency(account.balance || 0)}</p>
            <Badge variant={account.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {account.status}
            </Badge>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const RecentTradesWidget = ({ trades }: { trades: Trade[] }) => (
  <Card className="h-full bg-prop-card border-prop-gold/20">
    <CardHeader className="pb-3">
      <CardTitle className="text-prop-gold text-lg">Recent Trades</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {trades.slice(0, 4).map((trade) => (
        <div key={trade.id} className="flex justify-between items-center p-3 bg-dark-card rounded-lg">
          <div>
            <p className="text-white font-medium">{trade.symbol}</p>
            <p className="text-xs text-gray-400">{trade.date}</p>
          </div>
          <div className="text-right">
            <p className={`font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(trade.pnl || 0)}
            </p>
            <p className="text-xs text-gray-400">{trade.side}</p>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const DisciplinedScoreWidget = ({ trades }: { trades: Trade[] }) => {
  const disciplineScore = calculateDisciplinedScore(trades);
  const scoreColor = getScoreColor(disciplineScore);
  
  return (
    <Card className="h-full bg-prop-card border-prop-gold/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-prop-gold text-lg">Disciplined Trading Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-8 border-gray-700 flex items-center justify-center">
            <span className={`text-2xl font-bold ${scoreColor}`}>{disciplineScore}</span>
          </div>
          <div className={`absolute inset-0 rounded-full border-8 border-transparent ${scoreColor} border-t-current`} 
               style={{ transform: `rotate(${(disciplineScore / 100) * 360}deg)` }}></div>
        </div>
        <div className="text-center">
          <p className="text-white font-medium">Overall Grade</p>
          <Badge className={`${scoreColor} text-white font-bold`}>
            {disciplineScore >= 90 ? 'A+' : disciplineScore >= 80 ? 'A' : disciplineScore >= 70 ? 'B' : disciplineScore >= 60 ? 'C' : 'D'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

const WinRateWidget = ({ trades }: { trades: Trade[] }) => {
  const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length;
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  return (
    <Card className="h-full bg-prop-card border-prop-gold/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-prop-gold text-lg">Win Rate</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">{formatPercentage(winRate)}</div>
          <Progress value={winRate} className="w-full h-3" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-gray-400 text-sm">Wins</p>
            <p className="text-green-400 font-bold">{winningTrades}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Losses</p>
            <p className="text-red-400 font-bold">{totalTrades - winningTrades}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AccountPerformanceWidget = ({ accounts }: { accounts: Account[] }) => (
  <Card className="h-full bg-prop-card border-prop-gold/20">
    <CardHeader className="pb-3">
      <CardTitle className="text-prop-gold text-lg">Account Performance</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {accounts.slice(0, 2).map((account) => (
        <div key={account.id} className="p-3 bg-dark-card rounded-lg">
          <div className="flex justify-between mb-2">
            <p className="text-white font-medium">{account.name}</p>
            <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
              {account.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-400">Balance</p>
              <p className="text-white font-bold">{formatCurrency(account.balance || 0)}</p>
            </div>
            <div>
              <p className="text-gray-400">Profit Target</p>
              <p className="text-prop-gold font-bold">{formatCurrency(account.profitTarget || 0)}</p>
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const MonthlyPerformanceWidget = ({ trades }: { trades: Trade[] }) => (
  <Card className="h-full bg-prop-card border-prop-gold/20">
    <CardHeader className="pb-3">
      <CardTitle className="text-prop-gold text-lg">Monthly Performance</CardTitle>
    </CardHeader>
    <CardContent>
      <MonthlyPerformanceChart trades={trades} />
    </CardContent>
  </Card>
);

const EquityChartWidget = ({ trades }: { trades: Trade[] }) => (
  <Card className="h-full bg-prop-card border-prop-gold/20">
    <CardHeader className="pb-3">
      <CardTitle className="text-prop-gold text-lg">Equity Curve</CardTitle>
    </CardHeader>
    <CardContent>
      <EquityChart trades={trades} />
    </CardContent>
  </Card>
);

const TradeCalendarWidget = ({ trades }: { trades: Trade[] }) => (
  <Card className="h-full bg-prop-card border-prop-gold/20">
    <CardHeader className="pb-3">
      <CardTitle className="text-prop-gold text-lg">Trade Analysis Calendar</CardTitle>
    </CardHeader>
    <CardContent>
      <TradeAnalysisCalendar trades={trades} />
    </CardContent>
  </Card>
);

const DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: "active-accounts",
    title: "Active Accounts",
    component: ActiveAccountsWidget,
    defaultSize: { w: 6, h: 4 },
    category: "accounts"
  },
  {
    id: "recent-trades",
    title: "Recent Trades",
    component: RecentTradesWidget,
    defaultSize: { w: 6, h: 4 },
    category: "trades"
  },
  {
    id: "disciplined-score",
    title: "Disciplined Trading Score",
    component: DisciplinedScoreWidget,
    defaultSize: { w: 4, h: 4 },
    category: "analysis"
  },
  {
    id: "win-rate",
    title: "Win Rate",
    component: WinRateWidget,
    defaultSize: { w: 4, h: 4 },
    category: "performance"
  },
  {
    id: "account-performance",
    title: "Account Performance",
    component: AccountPerformanceWidget,
    defaultSize: { w: 4, h: 4 },
    category: "accounts"
  },
  {
    id: "monthly-performance",
    title: "Monthly Performance",
    component: MonthlyPerformanceWidget,
    defaultSize: { w: 8, h: 5 },
    category: "performance"
  },
  {
    id: "equity-chart",
    title: "Equity Curve",
    component: EquityChartWidget,
    defaultSize: { w: 12, h: 6 },
    category: "charts"
  },
  {
    id: "trade-calendar",
    title: "Trade Analysis Calendar",
    component: TradeCalendarWidget,
    defaultSize: { w: 12, h: 8 },
    category: "analysis"
  }
];

export default function CustomizableDashboard({ accounts, trades, analytics }: CustomizableDashboardProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(
    DASHBOARD_WIDGETS.map(w => w.id)
  );
  const [layouts, setLayouts] = useState({
    lg: DASHBOARD_WIDGETS.map((widget, index) => ({
      i: widget.id,
      x: (index % 2) * 6,
      y: Math.floor(index / 2) * widget.defaultSize.h,
      w: widget.defaultSize.w,
      h: widget.defaultSize.h,
    }))
  });

  const handleLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts);
  };

  const toggleWidget = (widgetId: string) => {
    setVisibleWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const saveDashboardLayout = () => {
    localStorage.setItem('dashboard-layout', JSON.stringify(layouts));
    localStorage.setItem('visible-widgets', JSON.stringify(visibleWidgets));
    setIsCustomizing(false);
  };

  const resetDashboard = () => {
    const defaultLayout = DASHBOARD_WIDGETS.map((widget, index) => ({
      i: widget.id,
      x: (index % 2) * 6,
      y: Math.floor(index / 2) * widget.defaultSize.h,
      w: widget.defaultSize.w,
      h: widget.defaultSize.h,
    }));
    setLayouts({ lg: defaultLayout });
    setVisibleWidgets(DASHBOARD_WIDGETS.map(w => w.id));
  };

  // Load saved layout on mount
  React.useEffect(() => {
    const savedLayout = localStorage.getItem('dashboard-layout');
    const savedWidgets = localStorage.getItem('visible-widgets');
    
    if (savedLayout) {
      setLayouts(JSON.parse(savedLayout));
    }
    if (savedWidgets) {
      setVisibleWidgets(JSON.parse(savedWidgets));
    }
  }, []);

  const filteredWidgets = DASHBOARD_WIDGETS.filter(widget => 
    visibleWidgets.includes(widget.id)
  );

  return (
    <div className="p-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient-rainbow mb-2">Dashboard</h1>
          <p className="text-gray-400">Customize your trading overview</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-prop-card border-prop-gold/20 text-prop-gold hover:bg-prop-gold hover:text-black">
                <Settings className="w-4 h-4 mr-2" />
                Customize Widgets
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-prop-card border-prop-gold/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-prop-gold">Dashboard Customization</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium mb-3">Visible Widgets</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {DASHBOARD_WIDGETS.map((widget) => (
                      <div key={widget.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={widget.id}
                          checked={visibleWidgets.includes(widget.id)}
                          onCheckedChange={() => toggleWidget(widget.id)}
                        />
                        <label htmlFor={widget.id} className="text-sm text-gray-300">
                          {widget.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={saveDashboardLayout}
                    className="bg-prop-gold text-black hover:bg-prop-gold/80"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Layout
                  </Button>
                  <Button 
                    onClick={resetDashboard}
                    variant="outline"
                    className="border-prop-gold/20 text-prop-gold hover:bg-prop-gold hover:text-black"
                  >
                    Reset to Default
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => setIsCustomizing(!isCustomizing)}
            variant={isCustomizing ? "default" : "outline"}
            className={isCustomizing 
              ? "bg-prop-gold text-black hover:bg-prop-gold/80" 
              : "bg-prop-card border-prop-gold/20 text-prop-gold hover:bg-prop-gold hover:text-black"
            }
          >
            <Grid className="w-4 h-4 mr-2" />
            {isCustomizing ? "Exit Customize" : "Drag & Drop Mode"}
          </Button>
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        isDraggable={isCustomizing}
        isResizable={isCustomizing}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        margin={[16, 16]}
      >
        {filteredWidgets.map((widget) => {
          const WidgetComponent = widget.component;
          return (
            <div key={widget.id} className={`widget ${isCustomizing ? 'customizing' : ''}`}>
              <WidgetComponent 
                accounts={accounts} 
                trades={trades} 
                analytics={analytics}
              />
              {isCustomizing && (
                <div className="absolute top-2 right-2 bg-black/80 rounded p-1">
                  <Grid className="w-4 h-4 text-prop-gold" />
                </div>
              )}
            </div>
          );
        })}
      </ResponsiveGridLayout>

      <style jsx global>{`
        .widget {
          position: relative;
          transition: all 0.2s ease;
        }
        
        .widget.customizing {
          outline: 2px dashed #d4af37;
          outline-offset: 4px;
        }
        
        .widget.customizing:hover {
          outline-color: #f4d03f;
          transform: scale(1.02);
        }
        
        .react-grid-item.react-grid-placeholder {
          background: rgba(212, 175, 55, 0.2);
          border: 2px dashed #d4af37;
          border-radius: 8px;
        }
        
        .react-grid-item > .react-resizable-handle::after {
          border-right: 2px solid #d4af37;
          border-bottom: 2px solid #d4af37;
        }
      `}</style>
    </div>
  );
}