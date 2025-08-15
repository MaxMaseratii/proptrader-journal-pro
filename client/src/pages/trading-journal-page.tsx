import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Brain,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function TradingJournalPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Journal</h1>
              <p className="text-gray-600 dark:text-gray-400">Reflect, analyze, and improve your trading discipline</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Journal Entry
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </div>
        </div>

        {/* Journal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
                  <p className="text-2xl font-bold">47</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Consistency</p>
                  <p className="text-2xl font-bold">89%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mental Score</p>
                  <p className="text-2xl font-bold">8.2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Target className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Goals Met</p>
                  <p className="text-2xl font-bold">12/15</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Journal Entries</CardTitle>
            <CardDescription>Your latest trading reflections and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-l-green-500 pl-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Excellent Risk Management Day</h3>
                  <Badge className="bg-green-100 text-green-700">Profitable</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Today I stuck to my risk rules perfectly. Cut losses early and let winners run. 
                  Made 3 trades, 2 winners, 1 small loss. Net +$340.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Aug 4, 2025</span>
                  <span>FTMO Account</span>
                  <span>3 Trades</span>
                </div>
              </div>

              <div className="border-l-4 border-l-yellow-500 pl-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Overtrading Issue</h3>
                  <Badge className="bg-yellow-100 text-yellow-700">Learning</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Took too many trades today. Need to be more selective. 
                  Quality over quantity. Only trade A+ setups.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Aug 3, 2025</span>
                  <span>MyForexFunds</span>
                  <span>7 Trades</span>
                </div>
              </div>

              <div className="border-l-4 border-l-red-500 pl-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Emotional Trading</h3>
                  <Badge className="bg-red-100 text-red-700">Loss</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Got emotional after first loss and revenge traded. 
                  Need to work on patience and emotional control.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Aug 2, 2025</span>
                  <span>FTMO Account</span>
                  <span>5 Trades</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journal Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Mental Fitness Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pre-session Preparation</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Emotional Control</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '72%'}}></div>
                    </div>
                    <span className="text-sm font-medium">72%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rule Adherence</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '91%'}}></div>
                    </div>
                    <span className="text-sm font-medium">91%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Areas for Improvement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Patience</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Wait for complete setups before entering trades
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-500">Emotional Control</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Don't revenge trade after losses
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-400">Position Sizing</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Stick to calculated position sizes
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