import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Award, 
  Target, 
  TrendingUp,
  Star,
  Crown,
  Zap,
  Shield,
  Medal,
  Flame
} from 'lucide-react';

const EnhancedAchievementSystem = () => {
  const playerStats = {
    totalAchievements: 12,
    unlockedAchievements: 0,
    completionRate: 0,
    totalPoints: 0,
    currentRank: 'New Trader',
    nextRank: 'Novice Trader',
    pointsToNextRank: 100
  };

  const achievementCategories = [
    {
      name: 'Trading Milestones',
      icon: TrendingUp,
      color: 'text-yellow-400',
      achievements: [
        { 
          title: 'First Profit', 
          description: 'Make your first profitable trade', 
          unlocked: false, 
          points: 50,
          icon: Target,
          rarity: 'common'
        },
        { 
          title: '10 Trade Streak', 
          description: 'Complete 10 consecutive profitable trades', 
          unlocked: false, 
          points: 200,
          progress: 0,
          icon: Flame,
          rarity: 'rare'
        },
        { 
          title: '$10K Milestone', 
          description: 'Reach $10,000 in total profits', 
          unlocked: false, 
          points: 500,
          progress: 0,
          icon: Crown,
          rarity: 'epic'
        }
      ]
    },
    {
      name: 'Risk Management',
      icon: Shield,
      color: 'text-blue-400',
      achievements: [
        { 
          title: 'Risk Master', 
          description: 'Maintain risk below 2% for 30 days', 
          unlocked: false, 
          points: 300,
          progress: 0,
          icon: Shield,
          rarity: 'rare'
        },
        { 
          title: 'Drawdown Defender', 
          description: 'Never exceed 5% drawdown in a month', 
          unlocked: false, 
          points: 250,
          icon: Shield,
          rarity: 'uncommon'
        },
        { 
          title: 'Position Sizing Pro', 
          description: 'Perfect position sizing for 100 trades', 
          unlocked: false, 
          points: 400,
          progress: 0,
          icon: Target,
          rarity: 'epic'
        }
      ]
    },
    {
      name: 'Discipline & Consistency',
      icon: Award,
      color: 'text-purple-400',
      achievements: [
        { 
          title: 'Journal Keeper', 
          description: 'Journal 50 consecutive trades', 
          unlocked: false, 
          points: 150,
          icon: Award,
          rarity: 'uncommon'
        },
        { 
          title: 'Early Bird', 
          description: 'Trade during market open 20 times', 
          unlocked: false, 
          points: 100,
          progress: 0,
          icon: Zap,
          rarity: 'common'
        },
        { 
          title: 'Weekend Warrior', 
          description: 'Complete market analysis on 10 weekends', 
          unlocked: false, 
          points: 200,
          progress: 0,
          icon: Star,
          rarity: 'rare'
        }
      ]
    },
    {
      name: 'Performance Excellence',
      icon: Crown,
      color: 'text-yellow-400',
      achievements: [
        { 
          title: 'Win Rate Champion', 
          description: 'Achieve 80%+ win rate over 50 trades', 
          unlocked: false, 
          points: 600,
          progress: 0,
          icon: Crown,
          rarity: 'legendary'
        },
        { 
          title: 'Profit Factor Hero', 
          description: 'Maintain 2.0+ profit factor for 3 months', 
          unlocked: false, 
          points: 700,
          progress: 0,
          icon: Trophy,
          rarity: 'legendary'
        },
        { 
          title: 'Consistency King', 
          description: 'Profitable for 12 consecutive months', 
          unlocked: false, 
          points: 1000,
          progress: 0,
          icon: Medal,
          rarity: 'mythic'
        }
      ]
    }
  ];

  const recentAchievements: any[] = [];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 text-gray-400 bg-gray-400/10';
      case 'uncommon': return 'border-green-400 text-green-400 bg-green-400/10';
      case 'rare': return 'border-blue-400 text-blue-400 bg-blue-400/10';
      case 'epic': return 'border-purple-400 text-purple-400 bg-purple-400/10';
      case 'legendary': return 'border-yellow-400 text-yellow-400 bg-yellow-400/10';
      case 'mythic': return 'border-red-400 text-red-400 bg-red-400/10';
      default: return 'border-gray-400 text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6 bg-black min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Achievements</h1>
          <p className="text-gray-400">Track your trading milestones and unlock rewards</p>
        </div>
        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400 text-lg px-4 py-2">
          {playerStats.currentRank}
        </Badge>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Points</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{playerStats.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-gray-400">{playerStats.pointsToNextRank} to next rank</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {playerStats.unlockedAchievements}/{playerStats.totalAchievements}
            </div>
            <p className="text-xs text-gray-400">{playerStats.completionRate}% complete</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Current Rank</CardTitle>
            <Crown className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-400">{playerStats.currentRank}</div>
            <p className="text-xs text-gray-400">Next: {playerStats.nextRank}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{playerStats.completionRate}%</div>
            <Progress value={playerStats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            <Award className="h-5 w-5 text-yellow-400" />
            Recently Unlocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex-shrink-0 text-center p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="font-semibold text-sm text-white">{achievement.title}</div>
                <div className="text-xs text-gray-400">{achievement.unlockedDate}</div>
                <Badge className="mt-2 bg-yellow-400/20 text-yellow-400 border-yellow-400">
                  +{achievement.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      {achievementCategories.map((category, categoryIndex) => {
        const CategoryIcon = category.icon;
        
        return (
          <Card key={categoryIndex} className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                <CategoryIcon className={`h-5 w-5 ${category.color}`} />
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.achievements.map((achievement, achievementIndex) => {
                  const AchievementIcon = achievement.icon;
                  
                  return (
                    <div
                      key={achievementIndex}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        achievement.unlocked
                          ? `${getRarityColor(achievement.rarity)} hover:scale-105 ring-2 ring-yellow-400/30`
                          : 'bg-gray-800/20 border-gray-600 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <AchievementIcon className={`h-6 w-6 ${
                          achievement.unlocked ? category.color : 'text-gray-500'
                        }`} />
                        <div className="flex-1">
                          <div className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                            {achievement.title}
                          </div>
                          <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {achievement.description}
                      </p>
                      
                      {achievement.unlocked ? (
                        <Badge className="bg-green-400/20 text-green-400 border-green-400">
                          <Trophy className="h-3 w-3 mr-1" />
                          Unlocked • {achievement.points} pts
                        </Badge>
                      ) : (
                        <div className="space-y-2">
                          {achievement.progress && (
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-white">{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} className="h-2" />
                            </div>
                          )}
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            {achievement.points} points
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EnhancedAchievementSystem;