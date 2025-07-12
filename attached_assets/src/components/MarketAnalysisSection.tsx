import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Target, Calendar, CheckCircle2 } from "lucide-react";

interface AnalysisSkill {
  name: string;
  proficiency: number;
  accuracy: number;
  usage: number;
  improvement: number;
}

export default function MarketAnalysisSection() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
  
  const analysisSkills: AnalysisSkill[] = [
    {
      name: "Support/Resistance",
      proficiency: 85,
      accuracy: 78,
      usage: 92,
      improvement: 12
    },
    {
      name: "Trend Analysis",
      proficiency: 72,
      accuracy: 68,
      usage: 88,
      improvement: 8
    },
    {
      name: "Chart Patterns",
      proficiency: 65,
      accuracy: 62,
      usage: 75,
      improvement: 15
    },
    {
      name: "Volume Analysis",
      proficiency: 58,
      accuracy: 55,
      usage: 45,
      improvement: 22
    }
  ];

  const marketConditions = [
    { condition: "Trending Markets", performance: 82, trades: 45 },
    { condition: "Range-bound", performance: 65, trades: 28 },
    { condition: "High Volatility", performance: 58, trades: 22 },
    { condition: "Low Volatility", performance: 75, trades: 18 }
  ];

  const analysisAccuracy = {
    daily: { correct: 68, total: 85, percentage: 80 },
    weekly: { correct: 156, total: 195, percentage: 80 },
    monthly: { correct: 42, total: 58, percentage: 72 }
  };

  const recentAnalyses = [
    { date: "2024-01-15", setup: "EURUSD Breakout", outcome: "Success", pnl: "+2.3%" },
    { date: "2024-01-14", setup: "GBPJPY Reversal", outcome: "Success", pnl: "+1.8%" },
    { date: "2024-01-13", setup: "USDJPY Range", outcome: "Failed", pnl: "-0.9%" },
    { date: "2024-01-12", setup: "AUDUSD Trend", outcome: "Success", pnl: "+1.5%" }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5" />
            Market Analysis Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisSkills.map((skill, index) => (
              <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">{skill.name}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">Acc: {skill.accuracy}%</Badge>
                    <Badge variant={skill.improvement > 10 ? "default" : "secondary"}>
                      +{skill.improvement}%
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Proficiency</div>
                    <Progress value={skill.proficiency} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">{skill.proficiency}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Accuracy</div>
                    <Progress value={skill.accuracy} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">{skill.accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Usage</div>
                    <Progress value={skill.usage} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">{skill.usage}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Market Condition Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketConditions.map((condition, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{condition.condition}</div>
                    <div className="text-xs text-gray-400">{condition.trades} trades</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={condition.performance} className="h-2 w-20" />
                    <span className="text-sm text-white w-12">{condition.performance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Analysis Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {Object.keys(analysisAccuracy).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className="capitalize"
                >
                  {timeframe}
                </Button>
              ))}
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-400">
                {analysisAccuracy[selectedTimeframe as keyof typeof analysisAccuracy].percentage}%
              </div>
              <div className="text-sm text-gray-400">
                {analysisAccuracy[selectedTimeframe as keyof typeof analysisAccuracy].correct} correct out of {analysisAccuracy[selectedTimeframe as keyof typeof analysisAccuracy].total} analyses
              </div>
              <Progress value={analysisAccuracy[selectedTimeframe as keyof typeof analysisAccuracy].percentage} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentAnalyses.map((analysis, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{analysis.setup}</div>
                    <div className="text-xs text-gray-400">{analysis.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={analysis.outcome === 'Success' ? "default" : "destructive"}>
                    {analysis.outcome}
                  </Badge>
                  <span className={`text-sm font-medium ${
                    analysis.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {analysis.pnl}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}