import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface EmotionalMetric {
  name: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export default function EmotionalControlSection() {
  const [selectedWeek, setSelectedWeek] = useState(4);
  
  const emotionalMetrics: EmotionalMetric[] = [
    {
      name: "Fear Control",
      current: 65,
      target: 85,
      trend: 'up',
      description: "Managing fear-based decisions and exits"
    },
    {
      name: "Greed Management",
      current: 58,
      target: 80,
      trend: 'down',
      description: "Avoiding overtrading and position sizing errors"
    },
    {
      name: "Patience Level",
      current: 72,
      target: 90,
      trend: 'up',
      description: "Waiting for quality setups and entries"
    },
    {
      name: "Stress Response",
      current: 45,
      target: 75,
      trend: 'stable',
      description: "Managing stress during volatile periods"
    }
  ];

  const weeklyData = [
    { week: 1, fearControl: 45, greedMgmt: 40, patience: 55, stress: 35 },
    { week: 2, fearControl: 52, greedMgmt: 48, patience: 62, stress: 38 },
    { week: 3, fearControl: 58, greedMgmt: 55, patience: 68, stress: 42 },
    { week: 4, fearControl: 65, greedMgmt: 58, patience: 72, stress: 45 }
  ];

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <div className="h-4 w-4 bg-yellow-400 rounded-full" />;
    }
  };

  const calculateOverallScore = () => {
    return emotionalMetrics.reduce((total, metric) => total + metric.current, 0) / emotionalMetrics.length;
  };

  const overallScore = calculateOverallScore();
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-purple-400";
    if (score >= 50) return "text-purple-300";
    return "text-purple-200";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-dark-card border-dark-border hover-glow">
        <CardHeader>
          <CardTitle className="text-gradient-rainbow text-center">
            Mental Game Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore.toFixed(1)}
            </div>
            <div className="text-xl text-gray-300">
              Emotional Control Level
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="h-3 rounded-full bg-prop-gradient-purple transition-all duration-300"
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {emotionalMetrics.map((metric, index) => (
          <Card key={index} className="bg-black border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400">
                  <Brain className="h-4 w-4" />
                  <span className="font-medium text-sm">{metric.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  <Badge className={metric.current >= metric.target * 0.8 ? "bg-purple-600 text-white" : "bg-purple-800 text-white"}>
                    {metric.current}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={metric.current} className="h-2 mb-2" />
              <p className="text-xs text-gray-400">{metric.description}</p>
              <div className="text-xs text-gray-500 mt-1">
                Target: {metric.target}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-black border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Weekly Progress Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {weeklyData.map((week) => (
              <Button
                key={week.week}
                variant={selectedWeek === week.week ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedWeek(week.week)}
              >
                Week {week.week}
              </Button>
            ))}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Fear Control</span>
              <span className="text-sm text-white">{weeklyData[selectedWeek - 1].fearControl}%</span>
            </div>
            <Progress value={weeklyData[selectedWeek - 1].fearControl} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Greed Management</span>
              <span className="text-sm text-white">{weeklyData[selectedWeek - 1].greedMgmt}%</span>
            </div>
            <Progress value={weeklyData[selectedWeek - 1].greedMgmt} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Patience Level</span>
              <span className="text-sm text-white">{weeklyData[selectedWeek - 1].patience}%</span>
            </div>
            <Progress value={weeklyData[selectedWeek - 1].patience} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Stress Response</span>
              <span className="text-sm text-white">{weeklyData[selectedWeek - 1].stress}%</span>
            </div>
            <Progress value={weeklyData[selectedWeek - 1].stress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}