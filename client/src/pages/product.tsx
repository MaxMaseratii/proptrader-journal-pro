import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Calendar, 
  Target, 
  DollarSign, 
  BookOpen, 
  BarChart3, 
  Bell, 
  Settings,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Product() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            PropTraderJournal Product Overview
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            The only trading journal exclusively designed for prop firm traders, featuring unique tools 
            for mental fitness, daily planning, and performance optimization.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <Brain className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle>Pre-Session Mental Fitness</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Mandatory psychological readiness assessment before each trading session to ensure optimal decision-making state.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <Calendar className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>Daily Trading Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Structured pre-market planning with strategy selection and live performance tracking against your plan.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <Target className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle>Target Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced profit target calculations based on risk-reward ratios and prop firm requirements.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <DollarSign className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle>Prop Firm Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Track expenses and monitor payout eligibility with real-time status updates.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-red-500 mb-2" />
              <CardTitle>AI-Integrated Journal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Risk-linked journal with AI coach providing psychology analysis and improvement recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-indigo-500 mb-2" />
              <CardTitle>Performance vs Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time comparison of results against your pre-session plan with deviation alerts.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Benefits */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Why PropTraderJournal?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Built for Prop Traders</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Prop firm expense tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Payout eligibility monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Drawdown management tools</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Challenge-specific analytics</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Unique Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Mental fitness assessments</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>AI trading psychology coach</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Daily plan vs performance tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Prop trader news calendar</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}