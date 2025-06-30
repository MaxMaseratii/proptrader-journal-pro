import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Shield, BarChart3, Target, Users, Award } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold">MMM Stats</h1>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/api/login'}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-6">
            Professional Trading Dashboard
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Track your prop trading performance with advanced analytics, risk management, and comprehensive reporting tools designed for serious traders.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started Today
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h3>
          <p className="text-gray-300 text-lg">Built specifically for prop traders and trading firms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 text-blue-400 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Risk Management</h4>
              <p className="text-gray-300">
                Advanced risk analysis with daily loss limits, drawdown tracking, and smart position sizing calculations.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <BarChart3 className="h-12 w-12 text-green-400 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Performance Analytics</h4>
              <p className="text-gray-300">
                Comprehensive performance tracking with P&L analysis, win rates, and detailed trade breakdowns.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <Target className="h-12 w-12 text-purple-400 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Account Management</h4>
              <p className="text-gray-300">
                Multi-account support for challenge and funded accounts with firm-specific configurations and limits.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-yellow-400 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Trading Journal</h4>
              <p className="text-gray-300">
                Structured journaling with reflection prompts to track what went right and wrong for continuous improvement.
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <Award className="h-12 w-12 text-red-400 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Advanced Reports</h4>
              <p className="text-gray-300">
                Generate comprehensive reports with customizable date ranges and export capabilities for external analysis.
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <TrendingUp className="h-12 w-12 text-blue-400 mb-4" />
              <h4 className="text-xl font-semibold mb-3">Real-time Monitoring</h4>
              <p className="text-gray-300">
                Live tracking of your trading performance with instant alerts and risk monitoring dashboards.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Elevate Your Trading?</h3>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of successful prop traders using MMM Stats to track and improve their performance.
            </p>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Trading Smarter
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 MMM Stats. Built for professional traders.</p>
          </div>
        </div>
      </div>
    </div>
  );
}