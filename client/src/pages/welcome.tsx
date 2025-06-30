import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  BookOpen, 
  Target, 
  Users, 
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Download,
  Zap,
  Globe,
  Lock,
  Trophy,
  LineChart,
  PieChart,
  Calendar,
  FileText,
  DollarSign,
  Activity
} from "lucide-react";

export default function Welcome() {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Advanced Trading Journal",
      description: "Track every trade with detailed analytics, screenshots, and performance metrics designed specifically for prop traders."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Risk Management",
      description: "Real-time drawdown monitoring, daily loss limits, and automated risk alerts to keep you within prop firm rules."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Comprehensive statistics including win rate, profit factor, Sharpe ratio, and consistency metrics that prop firms value."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Multi-Account Management",
      description: "Manage multiple prop firm accounts, challenges, and funded accounts all in one unified dashboard."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "P&L Tracking",
      description: "Real-time profit and loss tracking with equity curves, daily performance, and monthly summaries."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Prop Firm Integration",
      description: "Pre-configured settings for major prop firms including FTMO, MyForexFunds, The5ers, and more."
    }
  ];

  const testimonials = [
    {
      name: "Marcus Chen",
      role: "FTMO Funded Trader",
      content: "PropJournal Pro helped me pass my $100K challenge by identifying my weak patterns. Now I'm consistently profitable with 3 funded accounts.",
      rating: 5
    },
    {
      name: "Sarah Williams",
      role: "MyForexFunds Trader",
      content: "The risk management features are incredible. I haven't breached a single rule since using this platform. Worth every penny.",
      rating: 5
    },
    {
      name: "David Rodriguez",
      role: "Professional Day Trader",
      content: "Finally, a journal built specifically for prop traders. The analytics rival what institutional firms use. Game changer!",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      period: "Forever",
      description: "Perfect for beginners and demo traders",
      features: [
        "Track up to 2 trading accounts",
        "Basic trade journaling",
        "Simple P&L tracking",
        "Community support",
        "Mobile app access"
      ],
      popular: false,
      cta: "Start Free"
    },
    {
      name: "Pro Trader",
      price: "$19",
      period: "per month",
      description: "Ideal for serious prop firm challengers",
      features: [
        "Unlimited trading accounts",
        "Advanced analytics & reports",
        "Risk management alerts",
        "CSV import/export",
        "Priority support",
        "Custom performance metrics",
        "Screenshot annotations",
        "Prop firm templates"
      ],
      popular: true,
      cta: "Start Pro Trial"
    },
    {
      name: "Firm",
      price: "$99",
      period: "per month",
      description: "For prop firms and trading groups",
      features: [
        "Everything in Pro Trader",
        "White-label solution",
        "Team management",
        "Custom branding",
        "API access",
        "Dedicated support",
        "Multi-firm management",
        "Advanced reporting suite"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Active Traders" },
    { number: "$2.5B+", label: "Tracked Volume" },
    { number: "98%", label: "Success Rate" },
    { number: "25+", label: "Prop Firms Supported" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PropJournal Pro</h1>
                <p className="text-xs text-slate-400">Elite Trading Journal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Features
              </Button>
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Pricing
              </Button>
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                About
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
            <Star className="h-3 w-3 mr-1" />
            Trusted by 50,000+ Prop Traders
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Prop Trading</span>
            <br />Journey
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The most advanced trading journal designed specifically for prop firm traders. 
            Track performance, manage risk, and pass your challenges with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-6"
              onClick={() => window.location.href = '/api/login'}
            >
              <Play className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700 text-lg px-8 py-6"
            >
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Built by prop traders, for prop traders. Every feature is designed to help you pass challenges and stay profitable.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/80 border-slate-700 hover:border-slate-600 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Successful Traders
            </h2>
            <p className="text-xl text-slate-300">
              See what funded traders are saying about PropJournal Pro
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/80 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-800/50" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-300">
              Choose the plan that fits your trading journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-blue-500 bg-slate-800' : 'bg-slate-800/80 border-slate-700'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-slate-400 ml-2">{plan.period}</span>}
                  </div>
                  <CardDescription className="text-slate-300 mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-slate-300">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                    onClick={() => window.location.href = '/api/login'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful prop traders who use PropJournal Pro to manage their trading career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-6"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-700">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">PropJournal Pro</h3>
                  <p className="text-xs text-slate-400">Elite Trading Journal</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                The most advanced trading journal for prop firm traders worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-slate-700" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2025 PropJournal Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white">
                <Lock className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}