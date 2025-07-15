import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Target, TrendingUp, Shield, Brain, BookOpen } from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  category: string;
  completed: boolean;
}

interface ActionPlanProps {
  disciplineScore: number;
}

export default function ComprehensiveActionPlan({ disciplineScore }: ActionPlanProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: '1',
      title: 'Implement Bracket Orders',
      description: 'Use bracket orders for all trades to enforce stop-loss and take-profit discipline',
      priority: 'high',
      timeframe: 'This Week',
      category: 'Risk Management',
      completed: false
    },
    {
      id: '2',
      title: 'Create Trading Journal',
      description: 'Document every trade with entry/exit reasons, emotions, and lessons learned',
      priority: 'high',
      timeframe: 'This Week',
      category: 'Self-Analysis',
      completed: false
    },
    {
      id: '3',
      title: 'Define Position Sizing Rules',
      description: 'Never risk more than 1-2% of account per trade, use position size calculator',
      priority: 'high',
      timeframe: 'This Week',
      category: 'Risk Management',
      completed: false
    },
    {
      id: '4',
      title: 'Establish Daily Routine',
      description: 'Create pre-market analysis routine and post-market review process',
      priority: 'medium',
      timeframe: 'Next 2 Weeks',
      category: 'Process',
      completed: false
    },
    {
      id: '5',
      title: 'Practice Mindfulness',
      description: 'Implement 10-minute daily meditation to improve emotional control',
      priority: 'medium',
      timeframe: 'Next 2 Weeks',
      category: 'Psychology',
      completed: false
    },
    {
      id: '6',
      title: 'Backtest Strategy',
      description: 'Thoroughly backtest your trading strategy over 2+ years of data',
      priority: 'medium',
      timeframe: 'Next Month',
      category: 'Strategy',
      completed: false
    },
    {
      id: '7',
      title: 'Set Performance Metrics',
      description: 'Define clear KPIs: win rate, profit factor, maximum drawdown targets',
      priority: 'low',
      timeframe: 'Next Month',
      category: 'Analytics',
      completed: false
    },
    {
      id: '8',
      title: 'Join Trading Community',
      description: 'Connect with disciplined traders for accountability and learning',
      priority: 'low',
      timeframe: 'Next Month',
      category: 'Education',
      completed: false
    }
  ]);

  const toggleCompletion = (id: string) => {
    setActionItems(items => 
      items.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedItems = actionItems.filter(item => item.completed).length;
  const progressPercentage = (completedItems / actionItems.length) * 100;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Risk Management': return <Shield className="h-4 w-4" />;
      case 'Psychology': return <Brain className="h-4 w-4" />;
      case 'Strategy': return <Target className="h-4 w-4" />;
      case 'Analytics': return <TrendingUp className="h-4 w-4" />;
      case 'Education': return <BookOpen className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const groupedItems = actionItems.reduce((acc, item) => {
    if (!acc[item.timeframe]) acc[item.timeframe] = [];
    acc[item.timeframe].push(item);
    return acc;
  }, {} as Record<string, ActionItem[]>);

  return (
    <div className="space-y-6">
      <Card className="bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-green-400" />
            Comprehensive Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Progress</span>
              <span className="text-green-400 font-semibold">
                {completedItems}/{actionItems.length} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-sm text-gray-400">
              {progressPercentage === 0 
                ? "Start implementing these actions to improve your trading discipline"
                : progressPercentage < 50
                ? "Good start! Keep building momentum with these improvements"
                : progressPercentage < 100
                ? "Excellent progress! You're on track to becoming a disciplined trader"
                : "Outstanding! You've completed all action items. Time to maintain and optimize."}
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.entries(groupedItems).map(([timeframe, items]) => (
        <Card key={timeframe} className="bg-black border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-blue-400" />
              {timeframe}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-700/30 border border-gray-600">
                  <Checkbox 
                    checked={item.completed}
                    onCheckedChange={() => toggleCompletion(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {item.title}
                      </h4>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {getCategoryIcon(item.category)}
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="capitalize">{item.priority} Priority</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-400">💡 Success Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
              <span><strong>Start Small:</strong> Focus on 1-2 high-priority items first</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
              <span><strong>Track Progress:</strong> Review and update this plan weekly</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
              <span><strong>Stay Consistent:</strong> Small daily improvements compound over time</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
              <span><strong>Measure Results:</strong> Track your discipline score monthly</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}