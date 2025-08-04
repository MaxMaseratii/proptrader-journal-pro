import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Search, 
  Star, 
  Clock, 
  Users, 
  TrendingUp,
  Brain,
  Target,
  DollarSign,
  BarChart3
} from "lucide-react";

export default function KnowledgeBase() {
  const categories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      color: "text-blue-500",
      articles: [
        { title: "Setting up your first trading account", views: 2847, rating: 4.8 },
        { title: "Importing trades from your broker", views: 1923, rating: 4.9 },
        { title: "Understanding the dashboard", views: 1654, rating: 4.7 },
        { title: "Creating your first journal entry", views: 1432, rating: 4.6 }
      ]
    },
    {
      title: "Mental Fitness",
      icon: Brain,
      color: "text-purple-500",
      articles: [
        { title: "How to use the Mental Fitness Check", views: 987, rating: 4.9 },
        { title: "Understanding your psychology scores", views: 743, rating: 4.8 },
        { title: "Building emotional discipline", views: 612, rating: 4.7 },
        { title: "Pre-session preparation guide", views: 534, rating: 4.6 }
      ]
    },
    {
      title: "Target Projections",
      icon: Target,
      color: "text-green-500",
      articles: [
        { title: "Setting realistic profit targets", views: 1234, rating: 4.8 },
        { title: "Risk-reward ratio calculations", views: 876, rating: 4.7 },
        { title: "Account growth projection methods", views: 665, rating: 4.6 },
        { title: "Managing target expectations", views: 543, rating: 4.5 }
      ]
    },
    {
      title: "Prop Firm Management",
      icon: DollarSign,
      color: "text-yellow-500",
      articles: [
        { title: "Tracking prop firm expenses", views: 1543, rating: 4.9 },
        { title: "Understanding payout eligibility", views: 1234, rating: 4.8 },
        { title: "Managing multiple prop firm accounts", views: 987, rating: 4.7 },
        { title: "Maximizing your payout potential", views: 765, rating: 4.6 }
      ]
    },
    {
      title: "Advanced Analytics",
      icon: BarChart3,
      color: "text-indigo-500",
      articles: [
        { title: "Reading your performance reports", views: 1876, rating: 4.8 },
        { title: "Understanding discipline scores", views: 1432, rating: 4.7 },
        { title: "Analyzing trading patterns", views: 1098, rating: 4.6 },
        { title: "Using AI insights effectively", views: 876, rating: 4.5 }
      ]
    },
    {
      title: "Troubleshooting",
      icon: Search,
      color: "text-red-500",
      articles: [
        { title: "Common import issues and solutions", views: 2134, rating: 4.7 },
        { title: "Fixing calculation discrepancies", views: 1654, rating: 4.6 },
        { title: "Resolving sync problems", views: 1234, rating: 4.5 },
        { title: "Account connection troubleshooting", views: 987, rating: 4.4 }
      ]
    }
  ];

  const popularArticles = [
    { title: "Complete Guide to Prop Trading Success", category: "Getting Started", views: 5643, rating: 4.9 },
    { title: "Mental Fitness: The Trader's Secret Weapon", category: "Mental Fitness", views: 4321, rating: 4.8 },
    { title: "Maximizing Prop Firm Payouts", category: "Prop Firm Management", views: 3876, rating: 4.7 },
    { title: "Advanced Risk Management Strategies", category: "Advanced Analytics", views: 3542, rating: 4.6 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Knowledge Base
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to know about PropTraderJournal, prop trading, and maximizing your success.
          </p>
        </div>

        {/* Search */}
        <Card className="mb-12">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles, guides, and tutorials..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Popular Articles */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Popular Articles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularArticles.map((article, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{article.title}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                    <span>{article.category}</span>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {article.views.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        {article.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IconComponent className={`h-5 w-5 ${category.color}`} />
                    <span>{category.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">{article.title}</h4>
                        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {article.views}
                          </span>
                          <span className="flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            {article.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 text-sm">
                    View All Articles
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help */}
        <Card className="mt-16">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our support team is here to help you succeed with PropTraderJournal.
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}