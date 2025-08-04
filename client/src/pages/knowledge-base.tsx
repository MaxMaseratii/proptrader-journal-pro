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
  BarChart3,
  CheckCircle,
  Bot,
  Calendar,
  Settings
} from "lucide-react";

export default function KnowledgeBase() {
  const categories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      color: "text-blue-500",
      description: "Learn the fundamentals of using PropTrader Journal - from setting up your first account to understanding the core features that will transform your trading performance.",
      articles: [
        { 
          title: "Setting up your first trading account", 
          views: 2847, 
          rating: 4.8,
          description: "Complete guide to creating and configuring your prop firm trading account with proper risk settings, drawdown limits, and profit targets." 
        },
        { 
          title: "Importing trades from your broker", 
          views: 1923, 
          rating: 4.9,
          description: "Step-by-step instructions for CSV import from major platforms like MT4/5, Tradovate, NinjaTrader, and Interactive Brokers." 
        },
        { 
          title: "Understanding the dashboard", 
          views: 1654, 
          rating: 4.7,
          description: "Navigate the comprehensive dashboard widgets including P&L tracking, risk metrics, discipline scores, and performance analytics." 
        },
        { 
          title: "Creating your first journal entry", 
          views: 1432, 
          rating: 4.6,
          description: "Learn to document trades effectively with emotional states, market analysis, and improvement insights for better performance." 
        }
      ]
    },
    {
      title: "Mental Fitness & Psychology",
      icon: Brain,
      color: "text-purple-500",
      description: "Master the psychological aspects of trading with our comprehensive mental fitness tools designed specifically for prop firm challenges and live market conditions.",
      articles: [
        { 
          title: "How to use the Mental Fitness Check", 
          views: 987, 
          rating: 4.9,
          description: "Complete guide to the 8-point pre-session assessment including emotional clarity, focus levels, risk respect, and professional mindset evaluation." 
        },
        { 
          title: "Understanding your psychology scores", 
          views: 743, 
          rating: 4.8,
          description: "Interpret the 40-point scoring system with GO/REDUCED/NO-GO thresholds and wisdom guidance for optimal trading performance." 
        },
        { 
          title: "Building emotional discipline", 
          views: 612, 
          rating: 4.7,
          description: "Proven techniques for managing fear, greed, and FOMO while maintaining consistent execution of your trading plan." 
        },
        { 
          title: "Pre-session preparation guide", 
          views: 534, 
          rating: 4.6,
          description: "Essential checklist for mental preparation including market regime analysis, risk assessment, and confidence building exercises." 
        }
      ]
    },
    {
      title: "Target Projections & Planning",
      icon: Target,
      color: "text-green-500",
      description: "Master the art of realistic target setting and strategic planning with advanced projection tools designed for prop firm success and sustainable growth.",
      articles: [
        { 
          title: "Setting realistic profit targets", 
          views: 1234, 
          rating: 4.8,
          description: "Learn to set achievable daily, weekly, and monthly profit targets based on your account size, risk tolerance, and trading style." 
        },
        { 
          title: "Risk-reward ratio calculations", 
          views: 876, 
          rating: 4.7,
          description: "Master R:R ratio optimization for consistent profitability with detailed examples from successful prop traders." 
        },
        { 
          title: "Account growth projection methods", 
          views: 665, 
          rating: 4.6,
          description: "Use advanced projection algorithms to forecast account growth patterns and plan your trading milestones effectively." 
        },
        { 
          title: "Managing target expectations", 
          views: 543, 
          rating: 4.5,
          description: "Balance ambition with realism to avoid overtrading and maintain consistent performance throughout your prop firm journey." 
        }
      ]
    },
    {
      title: "Prop Firm Management & Payouts",
      icon: DollarSign,
      color: "text-yellow-500",
      description: "Comprehensive guide to managing prop firm relationships, tracking expenses, understanding payout rules, and maximizing your earning potential.",
      articles: [
        { 
          title: "Tracking prop firm expenses", 
          views: 1543, 
          rating: 4.9,
          description: "Complete expense tracking system with categories for challenge fees, activation costs, subscription fees, and tax optimization strategies." 
        },
        { 
          title: "Understanding payout eligibility", 
          views: 1234, 
          rating: 4.8,
          description: "Navigate complex payout rules including minimum trading days, consistency requirements, and withdrawal schedules across different firms." 
        },
        { 
          title: "Managing multiple prop firm accounts", 
          views: 987, 
          rating: 4.7,
          description: "Strategies for handling multiple prop firm challenges simultaneously while maintaining discipline and avoiding correlation risks." 
        },
        { 
          title: "Maximizing your payout potential", 
          views: 765, 
          rating: 4.6,
          description: "Advanced techniques for optimizing payout amounts through strategic scaling, profit splitting, and performance bonuses." 
        }
      ]
    },
    {
      title: "Advanced Analytics & Reports",
      icon: BarChart3,
      color: "text-indigo-500",
      description: "Deep dive into performance analytics, discipline tracking, and AI-powered insights to continuously improve your trading performance and decision-making.",
      articles: [
        { 
          title: "Reading your performance reports", 
          views: 1876, 
          rating: 4.8,
          description: "Comprehensive guide to interpreting profit factor, Sharpe ratio, win rate, and other key performance metrics for data-driven improvements." 
        },
        { 
          title: "Understanding discipline scores", 
          views: 1432, 
          rating: 4.7,
          description: "Master the 25-point discipline scorecard including rule adherence, emotional control, and risk management assessment." 
        },
        { 
          title: "Analyzing trading patterns", 
          views: 1098, 
          rating: 4.6,
          description: "Identify recurring patterns in your trading behavior using advanced analytics and behavioral pattern recognition algorithms." 
        },
        { 
          title: "Using AI insights effectively", 
          views: 876, 
          rating: 4.5,
          description: "Leverage Marthy, your AI trading companion, for personalized feedback, performance analysis, and strategic recommendations." 
        }
      ]
    },
    {
      title: "Troubleshooting & Support",
      icon: Search,
      color: "text-red-500",
      description: "Quick solutions to common issues including CSV import problems, calculation errors, sync issues, and platform connectivity troubleshooting.",
      articles: [
        { 
          title: "Common import issues and solutions", 
          views: 2134, 
          rating: 4.7,
          description: "Fix CSV import errors including format mismatches, date parsing issues, currency conversion problems, and column mapping failures." 
        },
        { 
          title: "Fixing calculation discrepancies", 
          views: 1654, 
          rating: 4.6,
          description: "Resolve P&L calculation differences, commission handling, swap calculations, and balance reconciliation with broker statements." 
        },
        { 
          title: "Resolving sync problems", 
          views: 1234, 
          rating: 4.5,
          description: "Troubleshoot data synchronization issues between accounts, fix duplicate trades, and resolve timestamp conflicts." 
        },
        { 
          title: "Account connection troubleshooting", 
          views: 987, 
          rating: 4.4,
          description: "Diagnose and fix connection issues with prop firm portals, broker APIs, and third-party trading platforms." 
        }
      ]
    }
  ];

  const popularArticles = [
    { 
      title: "Complete Guide to Pre-Session Mental Fitness Check", 
      category: "Mental Fitness", 
      views: 5643, 
      rating: 4.9,
      description: "Master the 8-point pre-session assessment that prevents emotional trading and ensures consistent performance." 
    },
    { 
      title: "Daily Trading Plan Builder: Structure for Success", 
      category: "Planning", 
      views: 4321, 
      rating: 4.8,
      description: "Create comprehensive daily plans with strategy selection, risk management, and real-time tracking capabilities." 
    },
    { 
      title: "Target Projection System: Account Growth Forecasting", 
      category: "Projections", 
      views: 3876, 
      rating: 4.7,
      description: "Use advanced algorithms to project profit targets based on risk-reward ratios and historical performance." 
    },
    { 
      title: "Prop Firm Spending & Payout Eligibility Tracking", 
      category: "Financial Management", 
      views: 3542, 
      rating: 4.6,
      description: "Comprehensive expense tracking with automatic payout eligibility calculations for multiple prop firms." 
    }
  ];

  const eightFeatures = [
    {
      title: "1. Pre-Session Mental Fitness Check",
      icon: Brain,
      color: "text-purple-500",
      description: "Comprehensive psychological assessment before each trading session to ensure optimal mental state and prevent emotional trading decisions.",
      features: [
        "8-point psychological assessment scale",
        "Emotional clarity and focus level measurement",
        "Risk respect and professional mindset evaluation", 
        "GO/REDUCED/NO-GO trading recommendations",
        "40-point scoring system with wisdom guidance",
        "Real-time mental state tracking and alerts"
      ]
    },
    {
      title: "2. Daily Trading Plan Builder",
      icon: Target,
      color: "text-green-500", 
      description: "Advanced planning system that helps create comprehensive daily trading strategies with built-in risk management and performance tracking.",
      features: [
        "Strategy selection and customization tools",
        "Risk management parameter setting",
        "Market analysis and session planning",
        "Real-time plan vs. actual performance tracking",
        "Automated plan adherence scoring",
        "Historical plan review and optimization"
      ]
    },
    {
      title: "3. Target Projection System",
      icon: TrendingUp,
      color: "text-blue-500",
      description: "Sophisticated forecasting algorithms that project realistic profit targets based on historical performance, risk ratios, and account parameters.",
      features: [
        "Account-based projection modeling",
        "Risk-reward ratio optimization",
        "Monte Carlo simulation capabilities",
        "Multiple timeframe projections (daily, weekly, monthly)",
        "Confidence interval calculations",
        "Milestone tracking and achievement alerts"
      ]
    },
    {
      title: "4. Prop Firm Spending & Payout Eligibility",
      icon: DollarSign,
      color: "text-yellow-500",
      description: "Complete financial management system for tracking prop firm expenses, calculating payout eligibility, and optimizing trading firm relationships.",
      features: [
        "Multi-firm expense categorization and tracking",
        "Automated payout eligibility calculations",
        "Challenge fee and activation cost management",
        "Profit sharing and withdrawal scheduling",
        "Tax optimization reporting",
        "ROI analysis across multiple prop firms"
      ]
    },
    {
      title: "5. Risk-Integrated Trading Journal with AI Assistant (Marthy)",
      icon: Bot,
      color: "text-indigo-500",
      description: "Advanced journaling system with AI-powered analysis that provides personalized feedback, pattern recognition, and improvement recommendations.",
      features: [
        "AI-powered trade analysis and feedback",
        "Emotional state tracking and correlation analysis",
        "Pattern recognition and behavioral insights",
        "Personalized improvement recommendations",
        "Risk violation detection and alerts",
        "Performance coaching and mentorship"
      ]
    },
    {
      title: "6. Daily Performance vs Plan Analysis",
      icon: BarChart3,
      color: "text-red-500",
      description: "Comprehensive comparison system that analyzes actual trading performance against planned strategies with detailed deviation analysis.",
      features: [
        "Real-time plan adherence monitoring",
        "Deviation analysis and impact assessment",
        "Performance attribution reporting",
        "Strategy effectiveness measurement",
        "Risk management compliance tracking",
        "Daily scorecard and improvement metrics"
      ]
    },
    {
      title: "7. Prop Trader News Calendar",
      icon: Calendar,
      color: "text-orange-500",
      description: "Specialized news and event calendar focused on market events that impact prop trading strategies and risk management decisions.",
      features: [
        "Economic event impact analysis",
        "Prop firm specific news and updates",
        "Market volatility predictions",
        "Trading session risk assessments",
        "Automated news-based trading alerts",
        "Historical event performance correlation"
      ]
    },
    {
      title: "8. Strategy Builder & Sharing",
      icon: Settings,
      color: "text-pink-500",
      description: "Advanced strategy creation and sharing platform that allows traders to build, test, and share trading strategies with the prop trading community.",
      features: [
        "Visual strategy builder with drag-and-drop interface",
        "Strategy backtesting and optimization tools",
        "Community strategy sharing and rating system",
        "Performance tracking across multiple strategies",
        "Risk parameter customization and testing",
        "Strategy collaboration and mentorship features"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            PropTrader Knowledge Base
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Master prop trading with comprehensive guides, tutorials, and expert insights. Everything you need to succeed as a professional prop trader.
          </p>
        </div>

        {/* Search */}
        <Card className="mb-12 bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles, guides, and tutorials..."
                className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-black text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Popular Articles */}
        <Card className="mb-12 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Popular Articles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularArticles.map((article, index) => (
                <div 
                  key={index} 
                  className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer"
                  onClick={() => window.location.href = `/knowledge-base/article/popular/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <h3 className="font-medium text-white mb-2">{article.title}</h3>
                  <p className="text-gray-400 text-xs mb-2">{article.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-400">
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
              <Card key={index} className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-800`}>
                      <IconComponent className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <span className="text-white">{category.title}</span>
                  </CardTitle>
                  <p className="text-gray-300 text-sm mt-2">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.articles.map((article, articleIndex) => (
                      <div
                        key={articleIndex}
                        className="p-3 rounded-lg hover:bg-gray-800 cursor-pointer border border-gray-700 hover:border-gray-600"
                      >
                        <h4 className="font-medium text-white text-sm mb-2">
                          {article.title}
                        </h4>
                        <p className="text-gray-400 text-xs mb-2">{article.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-blue-400 hover:text-blue-300"
                            onClick={() => {
                              const categorySlug = category.title.toLowerCase().replace(/\s+/g, '-');
                              const articleSlug = article.title.toLowerCase().replace(/\s+/g, '-');
                              window.location.href = `/knowledge-base/article/${categorySlug}/${articleSlug}`;
                            }}
                          >
                            Read
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help */}
        <Card className="mt-16 bg-gray-900 border-gray-700">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-400 mb-4">
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