import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Share2, 
  Plus, 
  TrendingUp, 
  Target,
  Users,
  BookOpen,
  BarChart3,
  CheckCircle
} from "lucide-react";

export default function StrategyBuilder() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
              <Settings className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Strategy Builder & Sharing</h1>
              <p className="text-gray-600 dark:text-gray-400">Create, test, and share trading strategies with the community</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New Strategy
            </Button>
            <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400">
              <Users className="h-3 w-3 mr-1" />
              Community Feature
            </Badge>
          </div>
        </div>

        {/* My Strategies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>My Trading Strategies</span>
            </CardTitle>
            <CardDescription>Your custom strategies and their performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Breakout Master</CardTitle>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <CardDescription>Support/Resistance breakout strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Win Rate:</span>
                      <span className="font-medium text-green-600">72%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Factor:</span>
                      <span className="font-medium text-green-600">2.4</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Trades:</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Adherence:</span>
                      <span className="font-medium text-blue-600">89%</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Trend Rider</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700">Testing</Badge>
                  </div>
                  <CardDescription>Momentum-based trend following</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Win Rate:</span>
                      <span className="font-medium text-blue-600">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Factor:</span>
                      <span className="font-medium text-blue-600">1.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Trades:</span>
                      <span className="font-medium">43</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Adherence:</span>
                      <span className="font-medium text-yellow-600">76%</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline" disabled>
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Mean Reversion</CardTitle>
                    <Badge className="bg-yellow-100 text-yellow-700">Draft</Badge>
                  </div>
                  <CardDescription>Counter-trend scalping strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Win Rate:</span>
                      <span className="font-medium text-gray-500">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Factor:</span>
                      <span className="font-medium text-gray-500">-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Trades:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Adherence:</span>
                      <span className="font-medium text-gray-500">-</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline">Complete</Button>
                    <Button size="sm" variant="outline" disabled>
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Community Strategies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Community Strategies</span>
            </CardTitle>
            <CardDescription>Top-performing strategies shared by prop traders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-green-800 dark:text-green-400">London Session Scalper</h3>
                    <p className="text-sm text-green-600 dark:text-green-300">by @PropTrader_Mike</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-200 text-green-800">Featured</Badge>
                    <span className="text-sm text-green-600">★ 4.8</span>
                  </div>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  High-frequency scalping strategy optimized for London session volatility. 
                  Perfect for FTMO and MyForexFunds accounts.
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600">Win Rate: 78%</span>
                    <span className="text-green-600">Downloads: 2,347</span>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    Download Strategy
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">ICT Concepts Pro</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">by @ICT_Trader_Sarah</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">Popular</Badge>
                    <span className="text-sm text-gray-600">★ 4.6</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Advanced Inner Circle Trader concepts adapted for prop firm trading. 
                  Includes smart money concepts and market structure analysis.
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4 text-sm">
                    <span className="text-gray-600">Win Rate: 71%</span>
                    <span className="text-gray-600">Downloads: 1,856</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Download Strategy
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">Conservative Swing</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">by @SwingKing_Tom</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-100 text-purple-800">Low Risk</Badge>
                    <span className="text-sm text-gray-600">★ 4.4</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Low-risk swing trading strategy perfect for maintaining drawdown rules. 
                  Ideal for nervous traders or strict prop firm requirements.
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4 text-sm">
                    <span className="text-gray-600">Win Rate: 65%</span>
                    <span className="text-gray-600">Downloads: 1,234</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Download Strategy
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Strategy Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Strategy Performance Chart</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Adherence Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Breakout Master</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '89%'}}></div>
                    </div>
                    <span className="text-sm font-medium">89%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trend Rider</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '76%'}}></div>
                    </div>
                    <span className="text-sm font-medium">76%</span>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-800 dark:text-blue-400">Improvement Tip</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your Trend Rider adherence is below 80%. Consider setting more specific entry criteria 
                    to reduce discretionary decisions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}