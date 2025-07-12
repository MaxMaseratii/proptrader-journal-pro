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

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5" />
            Emotional Control Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emotionalMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{metric.name}</h4>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    <Badge variant={metric.current >= metric.target * 0.8 ? "default" : "destructive"}>
                      {metric.current}%
                    </Badge>
                  </div>
                </div>
                <Progress value={metric.current} className="h-2 mb-2" />
                <p className="text-xs text-gray-400">{metric.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Target: {metric.target}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Weekly Progress Tracking</CardTitle>
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