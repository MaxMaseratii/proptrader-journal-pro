import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Bell, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Globe,
  DollarSign,
  Shield
} from "lucide-react";

export default function NewsCalendar() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prop Trader News Calendar</h1>
              <p className="text-gray-600 dark:text-gray-400">Economic events with prop trading risk assessments</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
              <Globe className="h-3 w-3 mr-1" />
              Prop Trader Focused
            </Badge>
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <AlertTriangle className="h-3 w-3 mr-1" />
              High Impact Today
            </Badge>
          </div>
        </div>

        {/* Today's Events */}
        <Card className="mb-8 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Today's High-Impact Events</span>
            </CardTitle>
            <CardDescription>Events that significantly affect prop trader accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-l-red-500 pl-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-400">US Non-Farm Payrolls</h3>
                    <p className="text-sm text-red-600 dark:text-red-300">Expected: 185K | Previous: 206K</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-red-200 text-red-800">High Impact</Badge>
                    <p className="text-sm text-red-600 mt-1">8:30 AM EST</p>
                  </div>
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  <strong>Prop Trading Risk:</strong> Major USD volatility expected. Consider reducing position sizes 30 minutes before release.
                </div>
              </div>

              <div className="border-l-4 border-l-yellow-500 pl-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-400">Federal Reserve Chair Speech</h3>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">Topic: Economic Outlook</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-200 text-yellow-800">Medium Impact</Badge>
                    <p className="text-sm text-yellow-600 mt-1">2:00 PM EST</p>
                  </div>
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Prop Trading Risk:</strong> Potential interest rate comments may cause market reversals. Monitor SPY/QQQ closely.
                </div>
              </div>

              <div className="border-l-4 border-l-blue-500 pl-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-400">ECB Interest Rate Decision</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-300">Expected: 3.25% | Previous: 3.25%</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-200 text-blue-800">Medium Impact</Badge>
                    <p className="text-sm text-blue-600 mt-1">7:45 AM EST</p>
                  </div>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Prop Trading Risk:</strong> EUR pairs volatility. Good opportunity for breakout strategies if rate changes.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>This Week's Key Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <span className="font-medium">Monday - CPI Data</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">High volatility expected</p>
                  </div>
                  <Badge className="bg-red-100 text-red-700">High</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <span className="font-medium">Wednesday - FOMC Minutes</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Market sentiment shift possible</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <span className="font-medium">Friday - Retail Sales</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Consumer spending indicator</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Medium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Risk Management Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-400 mb-1">High Impact Events</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Reduce position sizes to 50% of normal. Avoid trading 30 minutes before and after.
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">Medium Impact Events</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Monitor closely but normal trading permitted. Watch for sudden reversals.
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-400 mb-1">Trading Opportunities</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Breakout strategies work well during high volatility periods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Alert Preferences</span>
            </CardTitle>
            <CardDescription>Customize when and how you receive news alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-3">Impact Level</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">High Impact Events</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Medium Impact Events</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Low Impact Events</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Timing</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">30 minutes before</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">15 minutes before</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">At event time</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Markets</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Forex (USD pairs)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">US Indices</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Commodities</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                <Bell className="h-4 w-4 mr-2" />
                Save Alert Settings
              </Button>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Test Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}