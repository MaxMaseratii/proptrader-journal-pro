import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Calendar, Target, BarChart3, Clock } from "lucide-react";

interface ProgressData {
  date: string;
  disciplineScore: number;
  winRate: number;
  riskScore: number;
  emotionalScore: number;
  trades: number;
}

interface Milestone {
  title: string;
  description: string;
  target: number;
  current: number;
  category: string;
  deadline: string;
}

export default function ProgressTrackingSection() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('discipline');
  
  const progressData: ProgressData[] = [
    { date: '2024-01-01', disciplineScore: 58, winRate: 32, riskScore: 65, emotionalScore: 42, trades: 45 },
    { date: '2024-01-08', disciplineScore: 62, winRate: 38, riskScore: 68, emotionalScore: 45, trades: 52 },
    { date: '2024-01-15', disciplineScore: 65, winRate: 42, riskScore: 72, emotionalScore: 48, trades: 48 },
    { date: '2024-01-22', disciplineScore: 68, winRate: 45, riskScore: 75, emotionalScore: 52, trades: 41 },
    { date: '2024-01-29', disciplineScore: 72, winRate: 48, riskScore: 78, emotionalScore: 58, trades: 38 }
  ];

  const milestones: Milestone[] = [
    {
      title: "Discipline Master",
      description: "Achieve 80% discipline score",
      target: 80,
      current: 72,
      category: "Discipline",
      deadline: "2024-03-01"
    },
    {
      title: "Risk Guardian",
      description: "Maintain 85% risk management score",
      target: 85,
      current: 78,
      category: "Risk Management",
      deadline: "2024-02-15"
    },
    {
      title: "Emotional Control",
      description: "Reach 70% emotional control score",
      target: 70,
      current: 58,
      category: "Psychology",
      deadline: "2024-04-01"
    },
    {
      title: "Consistency King",
      description: "Win rate above 55% for 4 weeks",
      target: 55,
      current: 48,
      category: "Performance",
      deadline: "2024-03-15"
    }
  ];

  const weeklyStats = {
    tradesThisWeek: 38,
    avgDisciplineScore: 72,
    improvementRate: 15,
    streakDays: 12,
    bestMetric: "Risk Management",
    worstMetric: "Emotional Control"
  };

  const getMetricData = (metric: string) => {
    switch(metric) {
      case 'discipline': return progressData.map(d => d.disciplineScore);
      case 'winRate': return progressData.map(d => d.winRate);
      case 'risk': return progressData.map(d => d.riskScore);
      case 'emotional': return progressData.map(d => d.emotionalScore);
      default: return progressData.map(d => d.disciplineScore);
    }
  };

  const getCurrentValue = () => {
    const data = getMetricData(selectedMetric);
    return data[data.length - 1];
  };

  const getImprovement = () => {
    const data = getMetricData(selectedMetric);
    if (data.length < 2) return 0;
    return ((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1);
  };

  const getMilestoneProgress = (milestone: Milestone) => {
    return (milestone.current / milestone.target) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Trades</span>
            </div>
            <div className="text-2xl font-bold text-white">{weeklyStats.tradesThisWeek}</div>
            <div className="text-xs text-gray-500">This week</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">Discipline</span>
            </div>
            <div className="text-2xl font-bold text-white">{weeklyStats.avgDisciplineScore}%</div>
            <div className="text-xs text-gray-500">Average score</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Improvement</span>
            </div>
            <div className="text-2xl font-bold text-white">+{weeklyStats.improvementRate}%</div>
            <div className="text-xs text-gray-500">This month</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Streak</span>
            </div>
            <div className="text-2xl font-bold text-white">{weeklyStats.streakDays}</div>
            <div className="text-xs text-gray-500">Days consistent</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Performance Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            {[
              { key: 'discipline', label: 'Discipline Score' },
              { key: 'winRate', label: 'Win Rate' },
              { key: 'risk', label: 'Risk Management' },
              { key: 'emotional', label: 'Emotional Control' }
            ].map((metric) => (
              <Button
                key={metric.key}
                variant={selectedMetric === metric.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMetric(metric.key)}
              >
                {metric.label}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {getCurrentValue()}%
              </div>
              <div className="text-sm text-gray-400">Current Value</div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                parseFloat(getImprovement()) > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {getImprovement()}%
              </div>
              <div className="text-sm text-gray-400">Improvement</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {progressData.length}
              </div>
              <div className="text-sm text-gray-400">Weeks Tracked</div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Weekly Progress</h4>
            <div className="space-y-2">
              {progressData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{data.date}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={getMetricData(selectedMetric)[index]} className="h-2 w-32" />
                    <span className="text-sm text-white w-12">
                      {getMetricData(selectedMetric)[index]}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Milestones & Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-400" />
                    <h4 className="font-medium text-white">{milestone.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{milestone.category}</Badge>
                    <span className="text-sm text-white">
                      {milestone.current}/{milestone.target}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{milestone.description}</p>
                
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1">
                    <Progress value={getMilestoneProgress(milestone)} className="h-2" />
                  </div>
                  <span className="text-sm text-white">
                    {getMilestoneProgress(milestone).toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Deadline: {milestone.deadline}</span>
                  <span>
                    {milestone.target - milestone.current} points to go
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