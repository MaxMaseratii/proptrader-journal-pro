import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Shield, 
  Brain, 
  Target, 
  Zap, 
  BarChart3,
  CheckCircle,
  Star,
  Award,
  BookOpen,
  Sparkles,
  Crown,
  Gem,
  ArrowRight,
  UserPlus
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Account, Spending } from "@shared/schema";

export default function Welcome() {
  const [showComparison, setShowComparison] = useState(false);
  
  // Fetch accounts and spending data for the spending tracker
  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    enabled: true // Enable to show real data
  });
  
  const { data: spending } = useQuery<Spending[]>({
    queryKey: ['/api/spending'],
    enabled: true // Enable to show real data
  });

  // Calculate spending data for the tracker (using real data from accounts and spending)
  const challengeCost = (spending?.filter(s => s.spendingType === 'account_purchase').reduce((sum, s) => sum + s.amount, 0) || 0) + 
                       (accounts?.reduce((sum, a) => sum + (a.accountCost || 0), 0) || 0);
  const activationCost = (spending?.filter(s => s.spendingType === 'activation_fee').reduce((sum, s) => sum + s.amount, 0) || 0) + 
                        (accounts?.reduce((sum, a) => sum + (a.activationCost || 0), 0) || 0);
  const totalPayout = spending?.filter(s => s.spendingType === 'payout').reduce((sum, s) => sum + s.amount, 0) || 0;
  const activeAccounts = accounts?.filter(a => a.status === 'active').length || 0;
  const failedAccounts = accounts?.filter(a => a.status === 'failed').length || 0;
  const totalAccounts = accounts?.length || 0;
  const totalSpent = challengeCost + activationCost + (accounts?.reduce((sum, a) => sum + (a.totalResetsCost || 0), 0) || 0);
  const roi = totalPayout - totalSpent;

  const spendingData = {
    challengeCost,
    activationCost,
    totalPayout,
    activeAccounts,
    failedAccounts,
    totalAccounts,
    totalSpent,
    roi
  };
  const features = [
    {
      icon: Target,
      title: "PropFirms Accounts & Risk Planning",
      description: "Comprehensive account management with responsible day-to-pass planning and risk projections",
      color: "text-prop-gold"
    },
    {
      icon: TrendingUp,
      title: "PropFirms Spending Tracker",
      description: "Track your investments, reset costs, and account expenses with detailed financial analytics",
      color: "text-prop-tiffany"
    },
    {
      icon: Brain,
      title: "Disciplinary Assistant",
      description: "AI-powered disciplinary analysis with professional trading psychology insights",
      color: "text-prop-green"
    },
    {
      icon: BookOpen,
      title: "Professional Trading Journal",
      description: "Structured reflection system with improvement tracking and performance analysis",
      color: "text-prop-pink"
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      title: "FTMO Funded Trader",
      content: "PropTraderJournal helped me pass my $200K challenge. The risk management tools are incredible.",
      rating: 5,
      gradient: "bg-prop-gradient-gold"
    },
    {
      name: "Sarah Mitchell",
      title: "MyForexFunds Pro",
      content: "Finally, a journal that understands prop trading. The analytics saved my account multiple times.",
      rating: 5,
      gradient: "bg-prop-gradient-tiffany"
    },
    {
      name: "Marcus Rodriguez",
      title: "The Funded Trader Elite",
      content: "From failing challenges to consistent payouts. This platform transformed my trading career.",
      rating: 5,
      gradient: "bg-prop-gradient-green"
    }
  ];

  return (
    <div className="min-h-screen bg-prop-gradient-hero">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-prop-gradient-rainbow p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-rainbow">PropTraderJournal</h1>
              <p className="text-xs text-gray-400">#1 Elite PropTrader Journal</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-prop-gradient-gold text-white font-semibold hover:scale-105 smooth-transition border-gradient-gold"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-prop-gradient-rainbow text-white px-6 py-2 text-lg font-semibold mb-6">
              <Crown className="w-4 h-4 mr-2" />
              The Elite Choice for Prop Traders
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            Master Your
            <br />
            <span className="text-gradient-rainbow">Trading Journey</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            The most advanced trading journal built exclusively for prop traders. 
            Transform your performance, pass your challenges, and achieve consistent profitability.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              onClick={() => window.location.href = '/auth'}
              size="lg"
              className="bg-prop-gradient-gold text-white text-xl px-12 py-6 font-bold hover-lift smooth-transition border-gradient-gold"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Start Your Journey
            </Button>
            <Button 
              onClick={() => window.location.href = '/auth'}
              variant="outline"
              size="lg"
              className="text-xl px-12 py-6 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black smooth-transition font-bold"
            >
              <UserPlus className="w-6 h-6 mr-3" />
              Register
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="text-xl px-12 py-6 border-prop-tiffany text-prop-tiffany hover:bg-prop-tiffany hover:text-black smooth-transition"
            >
              <Award className="w-6 h-6 mr-3" />
              View Features
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-prop-green" />
              <span className="text-gray-400">Trusted by 10,000+ Traders</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-prop-blue" />
              <span className="text-gray-400">Bank-Level Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-prop-gold" />
              <span className="text-gray-400">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gradient-gold">
              Elite Features for Elite Traders
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Every tool you need to dominate prop trading challenges and build a sustainable trading career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift border-gradient-gold"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-prop-gradient-rainbow flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className={`text-xl ${feature.color}`}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
            
            {/* Daily Risk Management */}
            <Card className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift border-gradient-gold">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-prop-gradient-rainbow flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-prop-blue">Daily Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  Real-time daily risk monitoring with drawdown alerts and violation tracking
                </CardDescription>
              </CardContent>
            </Card>

            {/* Discipline Score Tracking */}
            <Card className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift border-gradient-gold">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-prop-gradient-rainbow flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-prop-gold">Discipline Score Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  Advanced discipline scoring with risk compliance and trade limits analysis
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gradient-tiffany">
              Choose Your Trading Level
            </h2>
            <p className="text-xl text-gray-300">
              From aspiring traders to professional firms - we have the perfect plan for your journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic */}
            <Card className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift border-prop-green">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-prop-gradient-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-prop-green">Basic</CardTitle>
                <CardDescription className="text-gray-300 mt-4">Perfect for new traders</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-prop-green">$9.99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <div className="mt-2">
                  <Badge className="bg-success-green text-white text-xs">7 Days Free Trial</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-green mr-3" />
                    <span className="text-gray-300">5 Trading Accounts</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-green mr-3" />
                    <span className="text-gray-300">Basic Performance Analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-green mr-3" />
                    <span className="text-gray-300">Professional Trade Journal</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-green mr-3" />
                    <span className="text-gray-300">CSV Import & Export</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-green mr-3" />
                    <span className="text-gray-300">Basic Risk Alerts</span>
                  </li>
                </ul>
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    className="w-full bg-prop-gradient-green text-white hover-scale smooth-transition"
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    variant="outline"
                    className="w-full border-prop-green text-prop-green hover:bg-prop-green hover:text-white smooth-transition"
                  >
                    Login
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro Trader */}
            <Card className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift border-prop-gold relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-prop-gradient-gold text-black px-6 py-2 font-bold">
                  <Crown className="w-4 h-4 mr-2" />
                  MOST POPULAR
                </Badge>
              </div>
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-prop-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-2xl text-prop-gold">Pro Trader</CardTitle>
                <CardDescription className="text-gray-300 mt-4">For serious prop traders</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-prop-gold">$14.99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <div className="mt-2">
                  <Badge className="bg-prop-gradient-gold text-white text-xs">7 Days Free Trial</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">10 Trading Accounts</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">Advanced Analytics & Reports</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">Risk Management Tools</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">Discipline Score Tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">Daily Risk Management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-gold mr-3" />
                    <span className="text-gray-300">Priority Support</span>
                  </li>
                </ul>
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    className="w-full bg-prop-gradient-gold text-black font-bold hover-scale smooth-transition"
                  >
                    Start Pro Trial
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    variant="outline"
                    className="w-full border-prop-gold text-prop-gold hover:bg-prop-gold hover:text-black smooth-transition"
                  >
                    Login
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Firm Plan */}
            <Card className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift border-prop-pink">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-prop-gradient-pink rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gem className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-prop-pink">Premium</CardTitle>
                <CardDescription className="text-gray-300 mt-4">For professional traders</CardDescription>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-prop-pink">$29.99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <div className="mt-2">
                  <Badge className="bg-prop-gradient-pink text-white text-xs">7 Days Free Trial</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">Unlimited Trading Accounts</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">AI Trading Insights (Marthy AI)</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">Advanced Discipline Analysis</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">Behavioral Analysis & Alerts</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">Custom Risk Parameters</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-prop-pink mr-3" />
                    <span className="text-gray-300">Premium Support</span>
                  </li>
                </ul>
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    className="w-full bg-prop-gradient-pink text-white hover-scale smooth-transition"
                  >
                    Start Elite Trial
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    variant="outline"
                    className="w-full border-prop-pink text-prop-pink hover:bg-prop-pink hover:text-white smooth-transition"
                  >
                    Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Plan Comparison Button */}
          <div className="text-center mt-12">
            <Button 
              onClick={() => setShowComparison(!showComparison)}
              variant="outline"
              className="border-prop-gold text-prop-gold hover:bg-prop-gold hover:text-black smooth-transition"
            >
              {showComparison ? "Hide" : "Compare Plans"} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Plan Comparison Table */}
          {showComparison && (
            <div className="mt-8 bg-prop-card rounded-xl border border-prop-gold/20 p-6">
              <h3 className="text-2xl font-bold text-prop-gold mb-6 text-center">Feature Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-prop-gold/20">
                      <th className="text-left p-4 text-gray-300">Feature</th>
                      <th className="text-center p-4 text-prop-green">Basic</th>
                      <th className="text-center p-4 text-prop-gold">Pro</th>
                      <th className="text-center p-4 text-prop-pink">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-dark-border">
                      <td className="p-4 font-medium">Trading Accounts</td>
                      <td className="text-center p-4">5</td>
                      <td className="text-center p-4">10</td>
                      <td className="text-center p-4">Unlimited</td>
                    </tr>
                    <tr className="border-b border-dark-border">
                      <td className="p-4 font-medium">Trade Journal</td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-green mx-auto" /></td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-gold mx-auto" /></td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-pink mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-dark-border">
                      <td className="p-4 font-medium">Performance Analytics</td>
                      <td className="text-center p-4">Basic</td>
                      <td className="text-center p-4">Advanced</td>
                      <td className="text-center p-4">Advanced</td>
                    </tr>
                    <tr className="border-b border-dark-border">
                      <td className="p-4 font-medium">Risk Management Tools</td>
                      <td className="text-center p-4">Basic Alerts</td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-gold mx-auto" /></td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-pink mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-dark-border">
                      <td className="p-4 font-medium">Discipline Score Tracking</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-gold mx-auto" /></td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-pink mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-dark-border">
                      <td className="p-4 font-medium">Daily Risk Management</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-gold mx-auto" /></td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-pink mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-dark-border">
                      <td className="p-4 font-medium">AI Trading Insights (Marthy AI)</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-pink mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-dark-border">
                      <td className="p-4 font-medium">Advanced Discipline Analysis</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-pink mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-dark-border">
                      <td className="p-4 font-medium">Behavioral Analysis & Alerts</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-pink mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-dark-border">
                      <td className="p-4 font-medium">Custom Risk Parameters</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-prop-pink mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Support Level</td>
                      <td className="text-center p-4">Standard</td>
                      <td className="text-center p-4">Priority</td>
                      <td className="text-center p-4">Premium</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Dashboard Showcase */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gradient-rainbow">
              Elite Features in Action
            </h2>
            <p className="text-xl text-gray-300">
              See how PropTraderJournal transforms your prop trading journey with these powerful tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* PropFirms Accounts & Risk Planning */}
            <div className="bg-prop-card rounded-xl border border-prop-gold/20 p-6 hover-lift smooth-transition">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-prop-gold mb-2">PropFirms Accounts & Risk Planning</h3>
                <p className="text-gray-300">Strategic account management with intelligent risk projections</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded p-3 text-center">
                    <div className="text-lg font-bold text-prop-gold">$150,000</div>
                    <div className="text-xs text-gray-300">Account Size</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3 text-center">
                    <div className="text-lg font-bold text-prop-green">$9,000</div>
                    <div className="text-xs text-gray-300">Target Objective</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3 text-center">
                    <div className="text-lg font-bold text-prop-pink">$4,500</div>
                    <div className="text-xs text-gray-300">Max Drawdown</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3 text-center">
                    <div className="text-lg font-bold text-prop-pink">$500</div>
                    <div className="text-xs text-gray-300">Risk Per Trade</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Reward Ratio</span>
                    <span className="text-prop-green font-bold">1:3 RR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Days to Target</span>
                    <span className="text-prop-tiffany font-bold">6 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Daily Target</span>
                    <span className="text-prop-green font-bold">$1,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Active Trading Days</span>
                    <span className="text-prop-gold font-bold">4 / 6</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Progress</span>
                    <span className="text-prop-green font-bold">67%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div className="bg-prop-green h-3 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* PropFirms Spending Tracker */}
            <div className="bg-prop-card rounded-xl border border-prop-tiffany/20 p-6 hover-lift smooth-transition">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-prop-tiffany mb-2">PropFirms Spending Tracker</h3>
                <p className="text-gray-300">Complete financial overview of your trading investments</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-700 rounded p-3 text-center">
                    <div className="text-xl font-bold text-prop-tiffany">{formatCurrency(spendingData.challengeCost)}</div>
                    <div className="text-xs text-gray-300">Challenge Cost</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3 text-center">
                    <div className="text-xl font-bold text-prop-pink">{formatCurrency(spendingData.activationCost)}</div>
                    <div className="text-xs text-gray-300">Activation Cost</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3 text-center">
                    <div className="text-xl font-bold text-prop-green">{formatCurrency(spendingData.totalPayout)}</div>
                    <div className="text-xs text-gray-300">Total Payout</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-gray-700 rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Active Accounts</span>
                      <span className="text-prop-green font-bold">{spendingData.activeAccounts}</span>
                    </div>
                    <div className="text-xs text-gray-400">{spendingData.activeAccounts} accounts</div>
                  </div>
                  <div className="bg-gray-700 rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Failed Accounts</span>
                      <span className="text-prop-pink font-bold">{spendingData.failedAccounts}</span>
                    </div>
                    <div className="text-xs text-gray-400">{spendingData.failedAccounts} accounts</div>
                  </div>
                  <div className="bg-gray-700 rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Accounts</span>
                      <span className="text-prop-tiffany font-bold">{spendingData.totalAccounts}</span>
                    </div>
                    <div className="text-xs text-gray-400">Overall spent: {formatCurrency(spendingData.totalSpent)}</div>
                  </div>
                </div>
                <div className="bg-prop-gradient-green/20 border border-prop-green/50 rounded p-3 text-center">
                  <div className="text-lg font-bold text-prop-green">ROI: {formatCurrency(spendingData.roi)}</div>
                  <div className="text-xs text-prop-green font-bold">{spendingData.roi > 0 ? 'PROFITABLE TRADER' : 'WORKING TOWARD PROFIT'}</div>
                </div>
              </div>
            </div>

            {/* Disciplinary Assistant */}
            <div className="bg-prop-card rounded-xl border border-prop-green/20 p-6 hover-lift smooth-transition">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-prop-green mb-2">Disciplinary Assistant</h3>
                <p className="text-gray-300">AI-powered psychology analysis and trading discipline tracking</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-prop-green">92.7%</div>
                  <div className="text-sm text-gray-300">Overall Discipline Score</div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                    <div className="bg-prop-green h-2 rounded-full w-11/12"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-sm font-semibold text-prop-green">Risk Management</div>
                    <div className="text-lg font-bold text-prop-green">96%</div>
                    <div className="text-xs text-gray-400">Excellent control</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-sm font-semibold text-yellow-400">Emotional Control</div>
                    <div className="text-lg font-bold text-yellow-400">84%</div>
                    <div className="text-xs text-gray-400">Room for improvement</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-sm font-semibold text-prop-green">Strategy Adherence</div>
                    <div className="text-lg font-bold text-prop-green">98%</div>
                    <div className="text-xs text-gray-400">Outstanding</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="text-sm font-semibold text-prop-tiffany">Stop Loss Respect</div>
                    <div className="text-lg font-bold text-prop-tiffany">89%</div>
                    <div className="text-xs text-gray-400">Very good</div>
                  </div>
                </div>
                <div className="bg-prop-gradient-gold/20 border border-prop-gold/50 rounded p-3">
                  <div className="text-sm font-semibold text-prop-gold">🎯 Current Focus</div>
                  <div className="text-xs text-gray-300">Improve patience during news events</div>
                </div>
              </div>
            </div>

            {/* Professional Trading Journal */}
            <div className="bg-prop-card rounded-xl border border-prop-pink/20 p-6 hover-lift smooth-transition">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-prop-pink mb-2">Professional Trading Journal</h3>
                <p className="text-gray-300">Structured reflection system with performance analysis</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 rounded p-3 text-center">
                    <div className="text-lg font-bold text-prop-pink">247</div>
                    <div className="text-xs text-gray-300">Journal Entries</div>
                  </div>
                  <div className="bg-gray-700 rounded p-3 text-center">
                    <div className="text-lg font-bold text-prop-green">89%</div>
                    <div className="text-xs text-gray-300">Consistency Rate</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-700 rounded p-3">
                    <div className="border-l-4 border-prop-green pl-3">
                      <h5 className="text-xs font-semibold text-prop-green">What Went Right</h5>
                      <p className="text-gray-300 text-xs">Perfect entry on EUR/USD breakout at 1.0850 support. Followed my 3-confirmation rule and held through minor pullback.</p>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="border-l-4 border-red-500 pl-3">
                      <h5 className="text-xs font-semibold text-red-400">What Went Wrong</h5>
                      <p className="text-gray-300 text-xs">Moved stop loss from 1.0820 to 1.0810 on GBP/JPY trade, reducing my risk management edge.</p>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="border-l-4 border-prop-gold pl-3">
                      <h5 className="text-xs font-semibold text-prop-gold">Tomorrow's Focus</h5>
                      <p className="text-gray-300 text-xs">Maintain original stop levels. Trust the initial analysis and avoid emotional adjustments.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-prop-gradient-pink/20 border border-prop-pink/50 rounded p-3 text-center">
                  <div className="text-sm font-semibold text-prop-pink">📈 Weekly Progress</div>
                  <div className="text-xs text-gray-300">Discipline improved by 12% this week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gradient-rainbow">
              Trusted by Elite Traders
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of successful prop traders who use PropTraderJournal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-prop-card hover:bg-prop-card-hover smooth-transition hover-lift">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-prop-gold fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 text-lg leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full ${testimonial.gradient} flex items-center justify-center mr-4`}>
                      <span className="text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-gray-400">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trial Information */}
      <section className="py-16 px-4 bg-gray-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">15 Days Free Trial • Cancel Anytime</h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Start your journey risk-free with our 15-day trial period. Experience all premium features 
            and see why thousands of prop traders choose PropTraderJournal. No commitments, no hidden fees.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-prop-gradient-green rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Full Access</h3>
              <p className="text-gray-400">All features unlocked during trial</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-prop-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Risk</h3>
              <p className="text-gray-400">Cancel anytime with one click</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-prop-gradient-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Setup</h3>
              <p className="text-gray-400">Start trading in under 2 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-prop-card rounded-3xl p-12 border-gradient-rainbow">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-rainbow">
              Ready to Elevate Your Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join the elite community of prop traders who use PropJournal Pro to 
              consistently pass challenges and build profitable trading careers.
            </p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              size="lg"
              className="bg-prop-gradient-rainbow text-white text-xl px-12 py-6 font-bold hover-lift smooth-transition"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Start Your Free Trial
            </Button>
            <p className="text-gray-400 mt-4 text-sm">15 days free • Cancel anytime • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-prop-gradient-rainbow p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gradient-rainbow">PropTraderJournal</h3>
              <p className="text-sm text-gray-400">#1 Elite PropTrader Journal</p>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            Empowering prop traders worldwide to achieve consistent profitability
          </p>
          <div className="flex justify-center space-x-8 text-gray-400">
            <span>© 2025 PropTraderJournal</span>
            <a href="/privacy-policy" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-white transition-colors cursor-pointer">Terms of Service</a>
            <a href="/support" className="hover:text-white transition-colors cursor-pointer">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}