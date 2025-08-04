import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  User, 
  ArrowRight, 
  TrendingUp, 
  Brain, 
  Target, 
  DollarSign,
  BarChart3,
  Clock
} from "lucide-react";

export default function Blog() {
  const featuredPost = {
    title: "The Complete Guide to Mental Fitness in Prop Trading",
    excerpt: "Discover how pre-session mental fitness checks can transform your trading performance and why 89% of successful prop traders use psychological preparation techniques.",
    author: "Sarah Chen",
    date: "August 1, 2025",
    readTime: "8 min read",
    category: "Mental Fitness",
    image: "🧠"
  };

  const recentPosts = [
    {
      title: "Why Target Projection Systems Are Game-Changers for Prop Traders",
      excerpt: "Learn how systematic profit target planning can increase your success rate by 34% and help you scale through prop firm challenges faster.",
      author: "Michael Rodriguez",
      date: "July 28, 2025",
      readTime: "6 min read",
      category: "Strategy",
      image: "🎯"
    },
    {
      title: "The Hidden Costs of Prop Trading: A Complete Expense Tracking Guide",
      excerpt: "Uncover the true cost of prop trading and learn advanced expense tracking techniques that can save you thousands per year.",
      author: "Emma Thompson",
      date: "July 25, 2025",
      readTime: "10 min read",
      category: "Prop Firm Management",
      image: "💰"
    },
    {
      title: "AI-Powered Trading Psychology: How Marthy Helps Traders Improve",
      excerpt: "Deep dive into how artificial intelligence is revolutionizing trading psychology analysis and personalized improvement recommendations.",
      author: "Dr. Alex Kim",
      date: "July 22, 2025",
      readTime: "12 min read",
      category: "Technology",
      image: "🤖"
    },
    {
      title: "Daily Trading Plans vs Reality: Why 73% of Traders Fail at Execution",
      excerpt: "Analyze the gap between planning and execution, and discover the systematic approach that separates successful prop traders from the rest.",
      author: "James Wilson",
      date: "July 19, 2025",
      readTime: "9 min read",
      category: "Performance",
      image: "📊"
    },
    {
      title: "News Calendar Impact: How Economic Events Affect Prop Trader Success",
      excerpt: "Statistical analysis of how major economic events impact prop trader performance and strategies for maximizing opportunities.",
      author: "Lisa Zhang",
      date: "July 16, 2025",
      readTime: "7 min read",
      category: "Market Analysis",
      image: "📰"
    },
    {
      title: "The Psychology of Drawdown: Mental Strategies for Prop Traders",
      excerpt: "Navigate drawdown periods with confidence using proven psychological techniques specifically designed for prop firm environments.",
      author: "Dr. Marcus Brown",
      date: "July 13, 2025",
      readTime: "11 min read",
      category: "Mental Fitness",
      image: "🧠"
    }
  ];

  const categories = [
    { name: "Mental Fitness", count: 12, color: "bg-purple-100 text-purple-700" },
    { name: "Strategy", count: 18, color: "bg-blue-100 text-blue-700" },
    { name: "Prop Firm Management", count: 15, color: "bg-yellow-100 text-yellow-700" },
    { name: "Technology", count: 8, color: "bg-green-100 text-green-700" },
    { name: "Performance", count: 14, color: "bg-red-100 text-red-700" },
    { name: "Market Analysis", count: 10, color: "bg-indigo-100 text-indigo-700" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            PropTrader Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Insights, strategies, and success stories from the world of prop trading. 
            Learn from experts and improve your trading performance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post */}
            <Card className="mb-12 border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{featuredPost.image}</div>
                  <div>
                    <Badge className="bg-yellow-100 text-yellow-700 mb-2">Featured</Badge>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {featuredPost.title}
                    </h2>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {featuredPost.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <Button>
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Articles</h3>
              
              {recentPosts.map((post, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl flex-shrink-0">{post.image}</div>
                      <div className="flex-1">
                        <Badge className="mb-2 bg-gray-100 text-gray-700">{post.category}</Badge>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {post.author}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {post.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {post.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <div key={index} className="flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                      <span className="text-gray-900 dark:text-white">{category.name}</span>
                      <Badge className={category.color}>{category.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Popular This Week</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      How I Scaled from $10K to $100K in 6 Months
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">12,453 views</p>
                  </div>
                  
                  <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      The 5 Mental Mistakes Every Prop Trader Makes
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">9,876 views</p>
                  </div>
                  
                  <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      Understanding Prop Firm Payout Structures
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">8,432 views</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Newsletter Signup */}
            <Card>
              <CardHeader>
                <CardTitle>Stay Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Get the latest prop trading insights and strategies delivered to your inbox weekly.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}