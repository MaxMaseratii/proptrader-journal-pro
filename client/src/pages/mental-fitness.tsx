import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  Target,
  Heart,
  Zap
} from "lucide-react";

export default function MentalFitness() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
              <Brain className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pre-Session Mental Fitness Check</h1>
              <p className="text-gray-600 dark:text-gray-400">Ensure optimal psychological readiness before trading</p>
            </div>
          </div>
          
          <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400">
            <Brain className="h-3 w-3 mr-1" />
            Prop Trader Exclusive Feature
          </Badge>
        </div>

        {/* Today's Check */}
        <Card className="mb-8 border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Today's Mental Fitness Status</span>
              </CardTitle>
              <Badge className="bg-green-100 text-green-700">Ready to Trade</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">92%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Focus Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">78%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Emotional Control</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">88%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Emotional State</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Stress Level</span>
                  <Badge className="bg-green-100 text-green-700">Low</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Anxiety</span>
                  <Badge className="bg-green-100 text-green-700">Minimal</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Confidence</span>
                  <Badge className="bg-blue-100 text-blue-700">High</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Motivation</span>
                  <Badge className="bg-green-100 text-green-700">Strong</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Physical Readiness</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Energy Level</span>
                  <Badge className="bg-green-100 text-green-700">High</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sleep Quality</span>
                  <Badge className="bg-green-100 text-green-700">Good</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alertness</span>
                  <Badge className="bg-blue-100 text-blue-700">Sharp</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Focus</span>
                  <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>Trading Mindset</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Risk Awareness</span>
                  <Badge className="bg-green-100 text-green-700">High</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Patience</span>
                  <Badge className="bg-yellow-100 text-yellow-700">Moderate</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Discipline</span>
                  <Badge className="bg-green-100 text-green-700">Strong</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Plan Adherence</span>
                  <Badge className="bg-green-100 text-green-700">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trends */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Mental Fitness Trends</span>
            </CardTitle>
            <CardDescription>Your psychological readiness over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Mental Fitness Trend Chart</p>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Today's Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Strengths to Leverage</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• High focus level - perfect for detailed chart analysis</li>
                  <li>• Strong discipline - ideal for following your trading plan</li>
                  <li>• Good emotional control - less likely to revenge trade</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Areas to Monitor</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Patience level is moderate - wait for complete setups</li>
                  <li>• Take breaks between trades to maintain focus</li>
                  <li>• Consider reducing position size if stress increases</li>
                </ul>
              </div>

              <div className="flex space-x-4 mt-6">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Start Trading Session
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Retake Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}