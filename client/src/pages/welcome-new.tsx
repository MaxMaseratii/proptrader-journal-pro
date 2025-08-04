import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  UserPlus,
  Menu,
  X,
  ChevronDown,
  Users,
  Clock,
  DollarSign,
  Trophy,
  Activity,
  Bell,
  Eye,
  Calculator,
  Settings,
  PieChart,
  FileText,
  GraduationCap,
  HelpCircle
} from "lucide-react";

// Header Component
function WelcomeHeader() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const navigation = [
    {
      name: 'Features',
      href: '#features',
      dropdown: [
        { name: 'Account Management', href: '#features', icon: Settings },
        { name: 'Risk Management', href: '#features', icon: Shield },
        { name: 'Trading Journal', href: '#features', icon: BookOpen },
        { name: 'Analytics & Reports', href: '#features', icon: BarChart3 },
        { name: 'Position Sizing', href: '#features', icon: Calculator },
        { name: 'Watchlists', href: '#features', icon: Eye },
        { name: 'Notifications', href: '#features', icon: Bell },
      ]
    },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    {
      name: 'Resources',
      href: '#resources',
      dropdown: [
        { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
        { name: 'Documentation', href: '#docs', icon: BookOpen },
        { name: 'Tutorials', href: '#tutorials', icon: BookOpen },
        { name: 'Community', href: '#community', icon: Users },
        { name: 'Support', href: '/support', icon: Settings },
      ]
    }
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Crown className="h-8 w-8 text-yellow-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  PropTrader
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Journal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.dropdown ? (
                  <div className="relative">
                    <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium flex items-center space-x-1">
                      <span>{item.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {subItem.icon && <subItem.icon className="h-4 w-4" />}
                            <span>{subItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/auth')}
              className="text-sm"
            >
              Log In
            </Button>
            <Button 
              onClick={() => setLocation('/signup')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-sm"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <a
                    href={item.href}
                    className="block px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    {item.name}
                  </a>
                  {item.dropdown && (
                    <div className="pl-6 space-y-1">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/auth')}
                  className="w-full"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => setLocation('/signup')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

// Footer Component
function WelcomeFooter() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Security', href: '/security' },
        { name: 'Integrations', href: '#integrations' },
        { name: 'API', href: '/api-docs' },
        { name: 'Changelog', href: '/changelog' },
      ]
    },
    {
      title: 'Trading Tools',
      links: [
        { name: 'Account Manager', href: '/accounts' },
        { name: 'Risk Management', href: '/risk-management' },
        { name: 'Position Sizing', href: '/position-sizing' },
        { name: 'Watchlists', href: '/watchlists' },
        { name: 'Trading Journal', href: '/journal' },
        { name: 'Analytics', href: '/analytics' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Knowledge Base', href: '/knowledge-base' },
        { name: 'Documentation', href: '/docs' },
        { name: 'Tutorials', href: '/tutorials' },
        { name: 'Blog', href: '/blog' },
        { name: 'Community', href: '/community' },
        { name: 'Support Center', href: '/support' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                PropTrader
              </span>
              <span className="text-xl font-bold text-white">Journal</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Professional trading journal and risk management platform designed for prop traders and funded accounts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.942 5.556a16.3 16.3 0 0 0-4.126-1.297c-.178.321-.385.754-.529 1.097a15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.097 16.274 16.274 0 0 0-4.129 1.3C.846 9.721.266 13.776.842 17.737c1.751 1.29 3.448 2.079 5.122 2.596.412-.564.777-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.122-2.596c.681-4.552-.114-8.518-2.979-12.182zM6.678 15.482c-1.183 0-2.16-1.09-2.16-2.425 0-1.336.951-2.425 2.16-2.425 1.209 0 2.184 1.09 2.16 2.425-.024 1.336-.951 2.425-2.16 2.425zm6.644 0c-1.183 0-2.16-1.09-2.16-2.425 0-1.336.951-2.425 2.16-2.425 1.209 0 2.184 1.09 2.16 2.425-.024 1.336-.951 2.425-2.16 2.425z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {currentYear} PropTraderJournal. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-sm text-gray-400">Made for prop traders, by prop traders</span>
            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
              Independent Platform
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Welcome Component
export default function Welcome() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Settings,
      title: "Account Management",
      description: "Comprehensive prop firm account tracking with real-time balance monitoring, payout eligibility, and multi-account portfolio management.",
      color: "text-blue-500",
      gradient: "from-blue-500/10 to-blue-600/10",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay informed with intelligent alerts for account milestones, payout readiness, risk warnings, and trading achievements.",
      color: "text-purple-500",
      gradient: "from-purple-500/10 to-purple-600/10",
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Advanced risk controls with daily loss limits, drawdown tracking, position sizing calculators, and rule violation detection.",
      color: "text-red-500",
      gradient: "from-red-500/10 to-red-600/10",
    },
    {
      icon: Eye,
      title: "Watchlists",
      description: "Organized symbol tracking with price alerts, category-based grouping, and real-time market data integration.",
      color: "text-green-500",
      gradient: "from-green-500/10 to-green-600/10",
    },
    {
      icon: Calculator,
      title: "Position Sizing",
      description: "Professional position sizing calculator with risk/reward analysis, lot size optimization, and educational resources.",
      color: "text-yellow-500",
      gradient: "from-yellow-500/10 to-yellow-600/10",
    },
    {
      icon: BookOpen,
      title: "Trading Journal",
      description: "Structured reflection system with trade analysis, performance tracking, and disciplinary improvement insights.",
      color: "text-indigo-500",
      gradient: "from-indigo-500/10 to-indigo-600/10",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep performance insights with profit factor analysis, drawdown studies, equity curves, and custom reporting.",
      color: "text-teal-500",
      gradient: "from-teal-500/10 to-teal-600/10",
    },
    {
      icon: Brain,
      title: "AI Trading Assistant",
      description: "Intelligent trading companion with disciplinary analysis, psychology tracking, and personalized improvement recommendations.",
      color: "text-pink-500",
      gradient: "from-pink-500/10 to-pink-600/10",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$9",
      period: "month",
      description: "Perfect for new prop traders",
      features: [
        "Up to 2 trading accounts",
        "Basic risk management",
        "Trading journal",
        "Basic analytics",
        "Email support",
      ],
      popular: false,
      gradient: "from-gray-500 to-gray-600",
    },
    {
      name: "Professional",
      price: "$19",
      period: "month",
      description: "For serious prop traders",
      features: [
        "Unlimited trading accounts",
        "Advanced risk management",
        "AI trading assistant",
        "Advanced analytics & reports",
        "Position sizing calculator",
        "Watchlists & notifications",
        "Priority support",
      ],
      popular: true,
      gradient: "from-yellow-500 to-yellow-600",
    },
    {
      name: "Enterprise",
      price: "$39",
      period: "month",
      description: "For trading teams & firms",
      features: [
        "Everything in Professional",
        "Team collaboration",
        "Custom integrations",
        "White-label options",
        "Dedicated account manager",
        "24/7 phone support",
      ],
      popular: false,
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  const testimonials = [
    {
      name: "Michael Chen",
      title: "FTMO Funded Trader",
      content: "PropTraderJournal helped me pass my $200K challenge. The risk management tools are incredible and saved me from several potential violations.",
      rating: 5,
      avatar: "MC",
    },
    {
      name: "Sarah Rodriguez",
      title: "MyForexFunds Pro",
      content: "The disciplinary assistant is a game-changer. It identified my overtrading patterns and helped me develop better trading habits.",
      rating: 5,
      avatar: "SR",
    },
    {
      name: "James Thompson",
      title: "TopstepTrader Funded",
      content: "Best trading journal I've used. The analytics are detailed, and the position sizing calculator is spot-on for risk management.",
      rating: 5,
      avatar: "JT",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <WelcomeHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              🚀 Trusted by 10,000+ Prop Traders
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Master Your{" "}
              <span className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                Prop Trading
              </span>
              <br />
              Journey
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              The complete trading journal and risk management platform designed specifically for proprietary trading firms. 
              Track performance, manage risk, and scale your funded accounts with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation('/signup')}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 text-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation('/auth')}
                className="px-8 py-3 text-lg"
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for prop traders to manage risk, track performance, and scale funded accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50`} />
                <CardHeader className="relative">
                  <div className={`w-12 h-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your trading needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden ${
                  plan.popular
                    ? 'border-yellow-500 shadow-lg scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className={plan.popular ? 'pt-12' : ''}>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="flex items-baseline mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 ml-1">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => setLocation('/signup')}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white'
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
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
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Successful Traders
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what funded traders are saying about PropTraderJournal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-gray-900">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Take Your Trading to the Next Level?
          </h2>
          <p className="text-xl text-yellow-100 mb-8">
            Join thousands of successful prop traders who trust PropTraderJournal to manage their funded accounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation('/signup')}
              className="bg-white text-yellow-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-yellow-600 px-8 py-3 text-lg"
              onClick={() => setLocation('/knowledge-base')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <WelcomeFooter />
    </div>
  );
}