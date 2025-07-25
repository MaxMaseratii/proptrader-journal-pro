import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Upload, 
  BarChart3, 
  Target, 
  Shield, 
  TrendingUp,
  FileText,
  CheckCircle,
  ArrowRight,
  Play,
  Download,
  Calendar,
  DollarSign,
  Brain,
  Trophy,
  Lightbulb,
  MessageSquare,
  Settings,
  HelpCircle
} from "lucide-react";

export default function KnowledgeBase() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-gradient-rainbow">Knowledge Base</h1>
        <p className="text-gray-400 text-lg">
          Learn how to master your trading journey with #1 PropFirm Trader's Journal
        </p>
      </div>

      {/* Quick Start Guide */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Play className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-blue-400">Quick Start Guide</CardTitle>
          </div>
          <CardDescription>Get up and running in 5 minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                <span className="text-white font-medium">Create Account</span>
              </div>
              <p className="text-gray-400 text-sm">Set up your prop firm trading account with balance, drawdown limits, and profit targets.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                <span className="text-white font-medium">Upload Trades</span>
              </div>
              <p className="text-gray-400 text-sm">Import your trading data via CSV or add trades manually to start tracking performance.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                <span className="text-white font-medium">Analyze & Improve</span>
              </div>
              <p className="text-gray-400 text-sm">Review analytics, journal your trades, and track your progress toward consistent profitability.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trading Account Management */}
        <Card className="bg-gray-800/30 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-white">Trading Account Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-yellow-400 font-medium">✓ Multi-Account Support</h4>
              <p className="text-gray-400 text-sm">Track multiple prop firm accounts, challenges, and funded accounts simultaneously.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-yellow-400 font-medium">✓ Risk Management</h4>
              <p className="text-gray-400 text-sm">Monitor daily loss limits, drawdown buffers, and risk per trade automatically.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-yellow-400 font-medium">✓ Payout Tracking</h4>
              <p className="text-gray-400 text-sm">Track payout eligibility with 5-day rules, consistency requirements, and profit splits.</p>
            </div>
          </CardContent>
        </Card>

        {/* CSV Import System */}
        <Card className="bg-gray-800/30 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-green-500" />
              <CardTitle className="text-white">CSV Import System</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-green-400 font-medium">✓ Universal Platform Support</h4>
              <p className="text-gray-400 text-sm">Supports Tradovate, MetaTrader, NinjaTrader, Interactive Brokers, and more.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-green-400 font-medium">✓ Intelligent Detection</h4>
              <p className="text-gray-400 text-sm">Automatically detects CSV format and maps columns for seamless import.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-green-400 font-medium">✓ Trade Analysis</h4>
              <p className="text-gray-400 text-sm">Analyzes stop loss movements, profit target hits, and trading discipline.</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Analytics */}
        <Card className="bg-gray-800/30 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-white">Performance Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-blue-400 font-medium">✓ Advanced Metrics</h4>
              <p className="text-gray-400 text-sm">Sharpe ratio, profit factor, expectancy, win rate, and Kelly criterion calculations.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-blue-400 font-medium">✓ Discipline Scoring</h4>
              <p className="text-gray-400 text-sm">Comprehensive analysis of trading discipline, emotional control, and risk adherence.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-blue-400 font-medium">✓ Visual Charts</h4>
              <p className="text-gray-400 text-sm">Equity curves, P&L charts, and performance heatmaps with interactive tooltips.</p>
            </div>
          </CardContent>
        </Card>

        {/* Daily Planning */}
        <Card className="bg-gray-800/30 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-white">Daily Trading Plans</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-purple-400 font-medium">✓ Strategy Builder</h4>
              <p className="text-gray-400 text-sm">Create custom trading strategies with rules, risk parameters, and expected values.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-purple-400 font-medium">✓ Session Tracking</h4>
              <p className="text-gray-400 text-sm">Live session timer with plan vs actual performance comparison.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-purple-400 font-medium">✓ Journal Integration</h4>
              <p className="text-gray-400 text-sm">Daily reflections linked to specific trading plans for continuous improvement.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How to Upload Trades */}
      <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-green-400" />
            <CardTitle className="text-green-400">How to Upload Trades</CardTitle>
          </div>
          <CardDescription>Step-by-step guide to importing your trading data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Method 1: CSV Import */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Method 1: CSV Import (Recommended)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Step 1: Export from Platform</h4>
                  <p className="text-gray-400 text-sm">Export your trades from your trading platform (Tradovate, MT4/5, NinjaTrader, etc.) as CSV file.</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Step 2: Go to Trades Log</h4>
                  <p className="text-gray-400 text-sm">Navigate to Trades Log page and click on the "Import CSV" tab.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Step 3: Select Account</h4>
                  <p className="text-gray-400 text-sm">Choose which trading account to import the trades to from the dropdown.</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Step 4: Upload & Analyze</h4>
                  <p className="text-gray-400 text-sm">Upload your CSV file and review the automatic analysis before importing.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Method 2: Manual Entry */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Method 2: Manual Entry
            </h3>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-3">For individual trades or when CSV import isn't available:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />Go to Trades Log → "Add Trade" tab</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />Select account, symbol, and trade direction</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />Enter entry/exit prices, dates, and P&L</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />Add trade documentation (images, TradingView links)</li>
              </ul>
            </div>
          </div>

          {/* Supported Platforms */}
          <div>
            <h3 className="text-white font-semibold mb-4">Supported Trading Platforms</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Tradovate", "MetaTrader 4/5", "NinjaTrader", "Interactive Brokers", "Rithmic", "CQG", "ThinkorSwim", "TopstepTrader", "FTMO", "Binance"].map((platform) => (
                <Badge key={platform} variant="outline" className="justify-center p-2 text-gray-300 border-gray-600">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gray-800/30 border-gray-700 hover:border-yellow-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-yellow-500" />
              <h3 className="text-white font-medium">Trading Calendar</h3>
            </div>
            <p className="text-gray-400 text-sm">Visual calendar showing daily P&L, trade counts, and performance metrics with color-coded indicators.</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700 hover:border-green-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-green-500" />
              <h3 className="text-white font-medium">Spending Tracker</h3>
            </div>
            <p className="text-gray-400 text-sm">Track all prop firm expenses: account costs, activation fees, resets, and calculate your trading ROI.</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700 hover:border-purple-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-5 h-5 text-purple-500" />
              <h3 className="text-white font-medium">AI Trading Coach</h3>
            </div>
            <p className="text-gray-400 text-sm">Marthy AI provides personalized trading insights, discipline feedback, and performance recommendations.</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700 hover:border-blue-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-5 h-5 text-blue-500" />
              <h3 className="text-white font-medium">Achievement System</h3>
            </div>
            <p className="text-gray-400 text-sm">Gamified progress tracking with discipline badges, streak counters, and milestone achievements.</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700 hover:border-teal-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              <h3 className="text-white font-medium">Projection Planning</h3>
            </div>
            <p className="text-gray-400 text-sm">Create day-by-day projections to reach profit targets with risk management and timeline planning.</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700 hover:border-pink-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-pink-500" />
              <h3 className="text-white font-medium">Trading Journal</h3>
            </div>
            <p className="text-gray-400 text-sm">Daily reflection entries with structured prompts for continuous improvement and emotional tracking.</p>
          </CardContent>
        </Card>
      </div>

      {/* Tips & Best Practices */}
      <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <CardTitle className="text-yellow-400">Tips & Best Practices</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-white font-medium">📈 For Better Analytics</h4>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li>• Import trades daily for real-time tracking</li>
                <li>• Add trade documentation (screenshots, notes)</li>
                <li>• Use consistent symbol naming across accounts</li>
                <li>• Review discipline scores weekly</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-medium">🎯 For Prop Firm Success</h4>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li>• Monitor drawdown buffers constantly</li>
                <li>• Track 5-day payout requirements</li>
                <li>• Journal every trading session</li>
                <li>• Set realistic daily profit targets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Support */}
      <Card className="bg-gray-800/30 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-white">Need Help?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-400 hover:bg-blue-500/10">
              <HelpCircle className="w-4 h-4" />
              FAQ Section
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-green-500 text-green-400 hover:bg-green-500/10">
              <MessageSquare className="w-4 h-4" />
              Live Support
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-purple-500 text-purple-400 hover:bg-purple-500/10">
              <Download className="w-4 h-4" />
              User Guide PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}