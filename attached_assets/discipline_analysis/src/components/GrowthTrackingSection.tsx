import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, Trophy, TrendingUp, Calendar, CheckCircle2, Clock } from "lucide-react";

interface LearningGoal {
  id: string;
  title: string;
  category: string;
  progress: number;
  target: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
}

interface Achievement {
  title: string;
  description: string;
  date: string;
  category: string;
  points: number;
}

export default function GrowthTrackingSection() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const learningGoals: LearningGoal[] = [
    {
      id: '1',
      title: 'Complete Advanced Options Trading Course',
      category: 'Education',
      progress: 75,
      target: 100,
      deadline: '2024-02-15',
      status: 'active',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Read 3 Trading Psychology Books',
      category: 'Psychology',
      progress: 67,
      target: 100,
      deadline: '2024-02-28',
      status: 'active',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Master Fibonacci Retracements',
      category: 'Technical Analysis',
      progress: 90,
      target: 100,
      deadline: '2024-01-31',
      status: 'active',
      priority: 'high'
    },
    {
      id: '4',
      title: 'Implement Risk Management System',
      category: 'Risk Management',
      progress: 100,
      target: 100,
      deadline: '2024-01-15',
      status: 'completed',
      priority: 'high'
    }
  ];

  const achievements: Achievement[] = [
    {
      title: 'Consistency Master',
      description: '30 consecutive days of following trading plan',
      date: '2024-01-10',
      category: 'Discipline',
      points: 100
    },
    {
      title: 'Risk Guardian',
      description: 'Never exceeded 2% risk per trade for 3 months',
      date: '2024-01-05',
      category: 'Risk Management',
      points: 150
    },
    {
      title: 'Learning Enthusiast',
      description: 'Completed 5 trading courses this quarter',
      date: '2023-12-28',
      category: 'Education',
      points: 75
    }
  ];

  const skillProgress = {
    month: {
      'Technical Analysis': 78,
      'Risk Management': 85,
      'Psychology': 62,
      'Strategy Development': 70,
      'Market Knowledge': 74
    },
    quarter: {
      'Technical Analysis': 72,
      'Risk Management': 80,
      'Psychology': 58,
      'Strategy Development': 65,
      'Market Knowledge': 68
    },
    year: {
      'Technical Analysis': 65,
      'Risk Management': 70,
      'Psychology': 45,
      'Strategy Development': 55,
      'Market Knowledge': 60
    }
  };

  const studyStats = {
    hoursThisWeek: 12,
    hoursThisMonth: 48,
    coursesCompleted: 3,
    booksRead: 2,
    webinarsAttended: 5
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-green-400';
      case 'overdue': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Study Hours</span>
            </div>
            <div className="text-2xl font-bold text-white">{studyStats.hoursThisWeek}</div>
            <div className="text-xs text-gray-500">This week</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">Courses</span>
            </div>
            <div className="text-2xl font-bold text-white">{studyStats.coursesCompleted}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Achievements</span>
            </div>
            <div className="text-2xl font-bold text-white">{achievements.length}</div>
            <div className="text-xs text-gray-500">Unlocked</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Goals</span>
            </div>
            <div className="text-2xl font-bold text-white">{learningGoals.filter(g => g.status === 'active').length}</div>
            <div className="text-xs text-gray-500">Active</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Learning Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningGoals.map((goal) => (
              <div key={goal.id} className="bg-gray-900/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(goal.priority)}`} />
                    <h4 className="font-medium text-white">{goal.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{goal.category}</Badge>
                    <span className={`text-sm ${getStatusColor(goal.status)} capitalize`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1">
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  <span className="text-sm text-white">{goal.progress}%</span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Deadline: {goal.deadline}</span>
                  <span>Priority: {goal.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Skill Development</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {Object.keys(skillProgress).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="capitalize"
                >
                  {period}
                </Button>
              ))}
            </div>
            
            <div className="space-y-3">
              {Object.entries(skillProgress[selectedPeriod as keyof typeof skillProgress]).map(([skill, progress]) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{skill}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="h-2 w-20" />
                    <span className="text-sm text-white w-12">{progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-gray-900/50 p-3 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <h4 className="font-medium text-white text-sm">{achievement.title}</h4>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      +{achievement.points} pts
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{achievement.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{achievement.category}</span>
                    <span>{achievement.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}