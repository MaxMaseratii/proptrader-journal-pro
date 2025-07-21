import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Shield, Target, TrendingUp, BookOpen, Star, Award, Crown } from "lucide-react";
import type { Achievement, UserStats } from "@shared/schema";

interface AchievementCardProps {
  achievement: Achievement;
  userStats?: UserStats;
}

function AchievementCard({ achievement, userStats }: AchievementCardProps) {
  const progressPercentage = Math.min((achievement.progress / achievement.target) * 100, 100);
  
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-amber-600"; // Bronze
      case 2: return "bg-gray-400"; // Silver
      case 3: return "bg-yellow-500"; // Gold
      case 4: return "bg-purple-600"; // Platinum
      default: return "bg-gray-600";
    }
  };

  const getLevelName = (level: number) => {
    switch (level) {
      case 1: return "Bronze";
      case 2: return "Silver";
      case 3: return "Gold";
      case 4: return "Platinum";
      default: return "Unknown";
    }
  };

  return (
    <Card className={`bg-gray-900/50 border-gray-700 transition-all duration-300 hover:bg-gray-800/50 ${
      achievement.isUnlocked ? 'ring-2 ring-prop-gold/50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full ${getLevelColor(achievement.level)} flex items-center justify-center text-2xl`}>
              {achievement.isUnlocked ? achievement.badge : '🔒'}
            </div>
            <div>
              <CardTitle className="text-white text-lg">{achievement.title}</CardTitle>
              <Badge variant="outline" className={`${getLevelColor(achievement.level)} text-white border-none`}>
                {getLevelName(achievement.level)}
              </Badge>
            </div>
          </div>
          {achievement.isUnlocked && (
            <Trophy className="h-6 w-6 text-prop-gold" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{achievement.progress}/{achievement.target}</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
          {achievement.isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-prop-gold">
              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AchievementSystem() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/user-stats"],
  });

  const categories = [
    { id: 'all', name: 'All Achievements', icon: Trophy },
    { id: 'risk_discipline', name: 'Risk Discipline', icon: Shield },
    { id: 'stop_loss_respect', name: 'Stop Loss Respect', icon: Target },
    { id: 'profit_target', name: 'Profit Targets', icon: TrendingUp },
    { id: 'journal_streak', name: 'Journal Consistency', icon: BookOpen },
    { id: 'consistency', name: 'Trading Consistency', icon: Star },
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.achievementType === selectedCategory);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {/* Achievement Header */}
      <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gradient-rainbow flex items-center">
              <Award className="h-7 w-7 text-prop-gold mr-3" />
              Achievement Center
            </h2>
            <p className="text-gray-300 mt-2">Track your trading discipline and unlock rewards</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-prop-gold">{unlockedCount}/{totalCount}</div>
            <div className="text-sm text-gray-400">Achievements Unlocked</div>
            {userStats && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-purple-900/20 border-purple-500 text-purple-300">
                  Level {userStats.level} • {userStats.totalPoints} points
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`${
                selectedCategory === category.id
                  ? 'bg-prop-gold text-black'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            userStats={userStats}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No achievements in this category yet</p>
          <p className="text-gray-500 text-sm">Start trading with discipline to unlock your first achievements!</p>
        </div>
      )}

      {/* Upcoming Achievement Preview */}
      {userStats && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-prop-tiffany text-prop-tiffany hover:bg-prop-tiffany/10">
              <Crown className="h-4 w-4 mr-2" />
              View Next Achievement Goals
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-prop-gold" />
                Next Goals
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Risk Discipline Score</span>
                  <span className="text-prop-gold font-semibold">{userStats.riskDisciplineScore}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Stop Loss Respect Streak</span>
                  <span className="text-green-400 font-semibold">{userStats.stopLossRespectStreak} trades</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Journal Streak</span>
                  <span className="text-blue-400 font-semibold">{userStats.journalStreakDays} days</span>
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-sm text-gray-300">
                  🎯 <strong className="text-white">Next Milestone:</strong> Maintain your stop loss for 10 consecutive trades to unlock the "Iron Discipline" badge!
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}