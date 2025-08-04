import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Plus, 
  TrendingUp, 
  Shield, 
  DollarSign,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function AccountManager() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Manager</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your prop firm trading accounts</p>
            </div>
          </div>
          
          <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Account
          </Button>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">FTMO Challenge</CardTitle>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <CardDescription>$100,000 Challenge Account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
                  <span className="font-medium">$102,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Daily Drawdown</span>
                  <span className="text-green-600">2.45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</span>
                  <span className="text-green-600">1.2%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">On Track for Payout</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">MyForexFunds</CardTitle>
                <Badge className="bg-yellow-100 text-yellow-700">Challenge</Badge>
              </div>
              <CardDescription>$200,000 Challenge Account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
                  <span className="font-medium">$198,750</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Daily Drawdown</span>
                  <span className="text-yellow-600">4.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</span>
                  <span className="text-yellow-600">3.8%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">Approaching Limit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">TopstepTrader</CardTitle>
                <Badge className="bg-blue-100 text-blue-700">Funded</Badge>
              </div>
              <CardDescription>$50,000 Funded Account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Balance</span>
                  <span className="font-medium">$52,890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Profit</span>
                  <span className="text-green-600">$2,890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payout Due</span>
                  <span className="text-blue-600">5 days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Ready for Payout</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your accounts efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-sm">View Performance</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Shield className="h-6 w-6 mb-2" />
                <span className="text-sm">Risk Settings</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <DollarSign className="h-6 w-6 mb-2" />
                <span className="text-sm">Payout History</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Settings className="h-6 w-6 mb-2" />
                <span className="text-sm">Account Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}