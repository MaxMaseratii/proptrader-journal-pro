import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  Star, 
  Users, 
  Bookmark, 
  Filter,
  Brain,
  Target,
  Calendar,
  DollarSign
} from "lucide-react";

export default function Tutorials() {
  const tutorialCategories = [
    {
      title: "Getting Started",
      color: "text-blue-500",
      tutorials: [
        {
          title: "PropTraderJournal Complete Setup Guide",
          duration: "15 min",
          difficulty: "Beginner",
          views: 12453,
          rating: 4.9,
          description: "Complete walkthrough of setting up your PropTraderJournal account and importing your first trades."
        },
        {
          title: "Understanding Your Dashboard",
          duration: "8 min",
          difficulty: "Beginner",
          views: 9876,
          rating: 4.8,
          description: "Learn to navigate and customize your trading dashboard for maximum efficiency."
        }
      ]
    },
    {
      title: "Mental Fitness Training",
      color: "text-purple-500",
      tutorials: [
        {
          title: "Pre-Session Mental Fitness Check Masterclass",
          duration: "20 min",
          difficulty: "Intermediate",
          views: 7654,
          rating: 4.9,
          description: "Master the mental fitness assessment and learn to optimize your psychological state before trading."
        },
        {
          title: "Building Trading Discipline with Psychology Scores",
          duration: "18 min",
          difficulty: "Intermediate",
          views: 6543,
          rating: 4.7,
          description: "Use AI-powered psychology analysis to identify and improve your trading discipline patterns."
        }
      ]
    },
    {
      title: "Daily Planning & Execution",
      color: "text-green-500",
      tutorials: [
        {
          title: "Creating Effective Daily Trading Plans",
          duration: "12 min",
          difficulty: "Beginner",
          views: 8765,
          rating: 4.8,
          description: "Learn to create structured daily plans that improve your trading consistency and performance."
        },
        {
          title: "Live Performance Tracking vs Your Plan",
          duration: "14 min",
          difficulty: "Intermediate",
          views: 5432,
          rating: 4.6,
          description: "Monitor your real-time performance against your pre-session plan and make adjustments."
        }
      ]
    },
    {
      title: "Prop Firm Success",
      color: "text-yellow-500",
      tutorials: [
        {
          title: "Maximizing Prop Firm Payouts",
          duration: "25 min",
          difficulty: "Advanced",
          views: 11234,
          rating: 4.9,
          description: "Advanced strategies for tracking expenses, meeting requirements, and maximizing your payout potential."
        },
        {
          title: "Target Projection System for Prop Traders",
          duration: "16 min",
          difficulty: "Intermediate",
          views: 6789,
          rating: 4.7,
          description: "Use advanced projection tools to plan your path to prop firm profit targets and scaling."
        }
      ]
    }
  ];

  const featuredTutorials = [
    {
      title: "Complete Prop Trader Success Blueprint",
      duration: "45 min",
      difficulty: "All Levels",
      views: 23456,
      rating: 4.9,
      thumbnail: "🎯",
      description: "The ultimate guide combining all 8 unique PropTraderJournal features for prop trading success."
    },
    {
      title: "Mental Fitness + AI Assistant Integration",
      duration: "30 min",
      difficulty: "Intermediate",
      views: 15678,
      rating: 4.8,
      thumbnail: "🧠",
      description: "Advanced tutorial on combining mental fitness checks with AI assistant recommendations."
    },
    {
      title: "Advanced Analytics & Performance Optimization",
      duration: "35 min",
      difficulty: "Advanced",
      views: 9876,
      rating: 4.7,
      thumbnail: "📊",
      description: "Deep dive into performance analytics and using data to optimize your trading approach."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Play className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Video Tutorials
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Master PropTraderJournal with our comprehensive video tutorial library designed specifically for prop traders.
          </p>
        </div>

        {/* Featured Tutorials */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Featured Tutorials</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTutorials.map((tutorial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{tutorial.thumbnail}</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tutorial.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tutorial.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {tutorial.duration}
                      </span>
                      <Badge className="bg-blue-100 text-blue-700">{tutorial.difficulty}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {tutorial.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        {tutorial.rating}
                      </span>
                    </div>
                    
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tutorial Categories */}
        <div className="space-y-8">
          {tutorialCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className={`${category.color}`}>{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.tutorials.map((tutorial, tutorialIndex) => (
                    <div key={tutorialIndex} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">{tutorial.title}</h3>
                        <Bookmark className="h-4 w-4 text-gray-400 hover:text-yellow-500 cursor-pointer" />
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{tutorial.description}</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {tutorial.duration}
                        </span>
                        <Badge 
                          className={
                            tutorial.difficulty === 'Beginner' 
                              ? 'bg-green-100 text-green-700' 
                              : tutorial.difficulty === 'Intermediate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }
                        >
                          {tutorial.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {tutorial.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {tutorial.rating}
                        </span>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Watch Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Learning Path */}
        <Card className="mt-16">
          <CardHeader>
            <CardTitle>Recommended Learning Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Complete Setup Guide</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start with account setup and basic navigation</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Mental Fitness Training</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Master pre-session psychology preparation</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Daily Planning System</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Learn structured planning and execution tracking</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Prop Firm Optimization</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Advanced prop firm success strategies</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}