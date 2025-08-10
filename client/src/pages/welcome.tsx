import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, Target, Brain, Shield, BarChart3, Calendar, DollarSign, BookOpen, 
  ArrowRight, CheckCircle, Star, Award, Zap, TrendingUp, Users, Menu, X,
  MessageSquare, Settings, Bell, Activity, PieChart, Calculator
} from "lucide-react";

// Brand New Header with Golden Gradient Theme
function PropTraderHeader() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Original Logo Design */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg border-2 border-teal-400">
                <Crown className="w-7 h-7 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-black">
                PropTrader<span className="text-teal-700">Journal</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-black hover:text-teal-700 font-semibold transition-colors">Features</a>
            <a href="#pricing" className="text-black hover:text-teal-700 font-semibold transition-colors">Pricing</a>
            <a href="#testimonials" className="text-black hover:text-teal-700 font-semibold transition-colors">Reviews</a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/auth')}
              className="text-black hover:text-teal-700 hover:bg-white/20 font-semibold"
            >
              Log In
            </Button>
            <Button
              onClick={() => setLocation('/signup')}
              className="bg-black text-yellow-400 hover:bg-gray-800 border-2 border-teal-400 font-bold shadow-lg"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-black"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-black/20">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-black font-semibold">Features</a>
              <a href="#pricing" className="text-black font-semibold">Pricing</a>
              <a href="#testimonials" className="text-black font-semibold">Reviews</a>
              <Button onClick={() => setLocation('/auth')} variant="ghost" className="text-black w-full">
                Log In
              </Button>
              <Button onClick={() => setLocation('/signup')} className="bg-black text-yellow-400 w-full">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default function Welcome() {
  const [, setLocation] = useLocation();

  // Enhanced features with powerful descriptions and brand colors
  const features = [
    {
      icon: Brain,
      title: "Pre-Session Mental Fitness",
      description: "85% readiness score with Focus Level, Emotional Control, and Confidence metrics. Never trade unprepared again.",
      color: "text-yellow-500",
      gradient: "from-yellow-400/30 to-amber-500/30",
      bgGradient: "from-yellow-50 to-amber-50",
      iconBg: "from-yellow-400 to-amber-500"
    },
    {
      icon: Calendar,
      title: "Daily Trading Blueprint",
      description: "Live session tracking with strategy execution, real-time progress monitoring, and profit target management.",
      color: "text-teal-600", 
      gradient: "from-teal-400/30 to-cyan-500/30",
      bgGradient: "from-teal-50 to-cyan-50",
      iconBg: "from-teal-500 to-cyan-600"
    },
    {
      icon: Target,
      title: "Profit Target Calculator",
      description: "Account-based simulations with R:R optimization, compounding effects, and locked projection system for consistent results.",
      color: "text-green-600",
      gradient: "from-green-400/30 to-emerald-500/30",
      bgGradient: "from-green-50 to-emerald-50",
      iconBg: "from-green-500 to-emerald-600"
    },
    {
      icon: DollarSign,
      title: "Prop Firm Spending Hub",
      description: "Complete payout eligibility tracking, expense categorization, receipt management, and funding cost analysis.",
      color: "text-yellow-500",
      gradient: "from-yellow-400/30 to-amber-500/30",
      bgGradient: "from-yellow-50 to-amber-50",
      iconBg: "from-yellow-400 to-amber-500"
    },
    {
      icon: MessageSquare,
      title: "AI Trading Coach (Marthy)",
      description: "24/7 intelligent assistant with behavioral analysis, risk management coaching, and personalized trading insights.",
      color: "text-teal-600",
      gradient: "from-teal-400/30 to-cyan-500/30",
      bgGradient: "from-teal-50 to-cyan-50",
      iconBg: "from-teal-500 to-cyan-600"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Advanced analytics comparing actual vs planned performance with discipline scoring and improvement recommendations.",
      color: "text-green-600",
      gradient: "from-green-400/30 to-emerald-500/30",
      bgGradient: "from-green-50 to-emerald-50",
      iconBg: "from-green-500 to-emerald-600"
    },
    {
      icon: Bell,
      title: "Economic Calendar Pro",
      description: "High-impact news alerts, prop trading opportunities, and market event scheduling tailored for funded traders.",
      color: "text-yellow-500",
      gradient: "from-yellow-400/30 to-amber-500/30",
      bgGradient: "from-yellow-50 to-amber-50",
      iconBg: "from-yellow-400 to-amber-500"
    },
    {
      icon: Settings,
      title: "Strategy Builder & Share",
      description: "Create custom trading strategies, backtest performance, share with community, and track rule adherence.",
      color: "text-teal-600",
      gradient: "from-teal-400/30 to-cyan-500/30",
      bgGradient: "from-teal-50 to-cyan-50",
      iconBg: "from-teal-500 to-cyan-600"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$9",
      period: "month",
      description: "Perfect for new prop traders",
      features: [
        "1 Trading Account",
        "Basic Performance Analytics (7-day history)",
        "Daily Trading Plans",
        "Mental Fitness Checks",
        "Basic Trading Journal (text only)",
        "30-day data retention",
        "Email Support"
      ],
      popular: false
    },
    {
      name: "Professional", 
      price: "$14.99",
      period: "month",
      originalPrice: "$39",
      savings: "Save $288/year",
      description: "Most popular for active traders",
      features: [
        "5 Trading Accounts",
        "Advanced Analytics & Reports",
        "AI Assistant (Marthy)",
        "Target Projections System",
        "Prop Spending Tracking",
        "Enhanced Trading Journal (photos, links, tags)",
        "90-day data retention",
        "Priority Support",
        "Strategy Builder & Sharing"
      ],
      popular: true
    },
    {
      name: "Elite",
      price: "$24.99",
      period: "month", 
      originalPrice: "$99",
      savings: "Save $900/year",
      description: "For Professional Traders",
      features: [
        "Unlimited Trading Accounts",
        "Professional Dashboard (real-time updates)",
        "Monte Carlo Simulations (probability modeling)",
        "Institutional Charts & Analytics",
        "AI-Powered Mental Check (personalized insights)",
        "Professional Flow State Programs",
        "Multi-Firm ROI Analysis",
        "Tax-Ready Payout Reports",
        "Professional Reporting Suite"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Marcus Chen",
      title: "FTMO Funded Trader",
      content: "This journal completely transformed my trading discipline. The mental fitness checks alone helped me avoid 3 major losses this month.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Sarah Williams", 
      title: "TopstepTrader Pro",
      content: "The target projection system is incredibly accurate. I've hit my profit targets 85% more consistently since using PropTraderJournal.",
      rating: 5,
      avatar: "SW"
    },
    {
      name: "David Rodriguez",
      title: "MyForexFunds Elite",
      content: "Marthy, the AI assistant, is like having a trading coach 24/7. The behavioral analysis has improved my risk management dramatically.",
      rating: 5,
      avatar: "DR"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PropTraderHeader />

      {/* Hero Section - Completely Original Design */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-teal-900 py-20 overflow-hidden">
        {/* Geometric Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Unique Badge Design */}
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold py-2 px-6 text-lg border-2 border-teal-400 shadow-xl">
              <Crown className="w-5 h-5 mr-2" />
              Elite Prop Trading Platform
            </Badge>

            {/* Original Hero Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                Master Prop Trading
              </span>
              <br />
              <span className="text-white">
                With <span className="bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">Precision</span>
              </span>
            </h1>

            {/* Unique Value Proposition */}
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
              The only trading journal engineered specifically for prop firm success. 
              <span className="text-yellow-400 font-semibold"> 8 unique capabilities</span> designed to maximize your 
              <span className="text-teal-400 font-semibold"> funded account performance</span> through advanced 
              <span className="text-green-400 font-semibold"> discipline tracking</span> and 
              <span className="text-yellow-400 font-semibold"> AI-powered insights</span>.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation('/signup')}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold px-10 py-4 text-xl border-2 border-teal-400 shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Award className="mr-3 h-6 w-6" />
                Start Your Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation('/auth')}
                className="px-10 py-4 text-xl border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black font-bold transform hover:scale-105 transition-all duration-300"
              >
                Watch Demo
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-black flex items-center justify-center text-black font-bold text-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span>Join 10,000+ funded traders</span>
              </div>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span>4.9/5 from 2,000+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Original Grid Layout */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold">
              <Zap className="w-4 h-4 mr-2" />
              8 Unique Capabilities
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Built for <span className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">Prop Traders</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature designed specifically for prop firm success - from mental preparation to payout tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`group hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 ${index % 2 === 0 ? 'hover:border-yellow-400' : 'hover:border-teal-400'} shadow-lg hover:scale-105 bg-gradient-to-br ${feature.bgGradient} hover:shadow-teal-500/25`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg`} />
                <CardHeader className="relative text-center">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${feature.iconBg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white drop-shadow-sm" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-gray-700 text-sm text-center leading-relaxed font-medium group-hover:text-gray-800">
                    {feature.description}
                  </p>
                  <div className={`mt-4 w-full h-1 bg-gradient-to-r ${feature.iconBg} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Enhanced Design */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-black via-gray-900 to-teal-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-teal-400/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-6 text-lg shadow-xl">
              <DollarSign className="w-5 h-5 mr-2" />
              🎯 Launch Special - 40% Off Limited Time
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Transparent <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Pricing</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              💪 All plans include 3-day free trial. Cancel anytime. Built for prop traders by prop traders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden transform transition-all duration-500 hover:scale-105 ${
                  plan.popular
                    ? 'border-0 shadow-2xl scale-105 bg-gradient-to-br from-yellow-400/20 via-amber-500/20 to-orange-500/20 backdrop-blur-sm border-4 border-yellow-400/50'
                    : 'border border-gray-600 hover:shadow-xl bg-gray-800/80 backdrop-blur-sm hover:border-teal-400/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-center py-3 font-bold">
                    <Crown className="w-4 h-4 inline mr-2" />
                    MOST POPULAR
                  </div>
                )}
                
                <CardHeader className={plan.popular ? 'pt-16' : 'pt-8'}>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                  <div className="flex items-baseline mt-6">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                    {plan.originalPrice && (
                      <span className="ml-3 text-lg text-gray-500 line-through">{plan.originalPrice}</span>
                    )}
                  </div>
                  {plan.savings && (
                    <div className="mt-2">
                      <span className="text-sm text-green-400 font-semibold">{plan.savings}</span>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => setLocation('/signup')}
                    className={`w-full py-3 font-bold text-lg ${
                      plan.popular
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black'
                        : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white'
                    }`}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">
              <Users className="w-4 h-4 mr-2" />
              Trusted by Pros
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Success <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">Stories</span>
            </h2>
            <p className="text-xl text-gray-600">
              Real results from funded prop traders using PropTraderJournal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-black font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-100 via-white to-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-xl">
                <Crown className="w-7 h-7 text-black" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                PropTrader<span className="text-gray-900">Journal</span>
              </span>
            </div>
            <p className="text-gray-600 mb-8">
              The elite trading journal for prop firm traders. Master discipline, maximize profits.
            </p>
            <div className="border-t border-gray-200 pt-8">
              <p className="font-bold text-lg">
                <span className="bg-gradient-to-r from-yellow-500 via-amber-600 to-black bg-clip-text text-transparent">
                  © 2025 PropTraderJournal. All rights reserved.
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}