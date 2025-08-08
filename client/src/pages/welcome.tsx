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
  Calendar,
  MessageSquare
} from "lucide-react";

// Header Component  
function WelcomeHeader() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: 'Features',
      href: '#features',
      dropdown: [
        { name: 'Mental Fitness Check', href: '/mental-fitness', icon: Brain },
        { name: 'Daily Trading Plan', href: '/daily-plan', icon: Calendar },
        { name: 'Target Projections', href: '/projections', icon: Target },
        { name: 'Prop Firm Spending', href: '/spending', icon: DollarSign },
        { name: 'Risk-Integrated Journal', href: '/trading-journal-page', icon: BookOpen },
        { name: 'Performance vs Plan', href: '/analytics-reports', icon: BarChart3 },
        { name: 'News Calendar', href: '/news-calendar', icon: Bell },
        { name: 'AI Assistant (Marthy)', href: '/trading-companion', icon: MessageSquare },
        { name: 'Strategy Builder', href: '/strategy-builder', icon: Settings },
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
              <div className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-100/50 to-amber-100/30">
                <Crown className="h-8 w-8 text-yellow-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  PropTrader
                </span>
                <span className="text-xl font-bold text-black dark:text-black">Journal</span>
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
                            onClick={(e) => {
                              e.preventDefault();
                              setLocation(subItem.href);
                            }}
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
                          onClick={(e) => {
                            e.preventDefault();
                            setLocation(subItem.href);
                          }}
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
      title: 'Help & Support',
      links: [
        { name: 'Knowledge Base', href: '/knowledge-base' },
        { name: 'Support Center', href: '/support' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-100/10 to-amber-100/10">
              <Crown className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                PropTrader
              </span>
              <span className="text-xl font-bold text-white">Journal</span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
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
          <div>
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {section.title}
                </h3>
                <ul className="grid grid-cols-2 gap-2">
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
      icon: Brain,
      title: "Pre-Session Mental Fitness Check",
      description: "Mandatory psychological readiness assessment before each trading session to ensure optimal decision-making state and emotional control.",
      color: "text-purple-500",
      gradient: "from-purple-500/10 to-purple-600/10",
    },
    {
      icon: Calendar,
      title: "Daily Trading Plan Builder",
      description: "Structured pre-market planning with strategy selection, risk parameters, and live performance tracking against your daily plan.",
      color: "text-blue-500",
      gradient: "from-blue-500/10 to-blue-600/10",
    },
    {
      icon: Target,
      title: "Target Projection System",
      description: "Advanced profit target calculations based on your risk-reward ratios, account growth projections, and prop firm requirements.",
      color: "text-green-500",
      gradient: "from-green-500/10 to-green-600/10",
    },
    {
      icon: DollarSign,
      title: "Prop Firm Spending & Payout Eligibility",
      description: "Track all prop firm expenses, monitor payout requirements, and get real-time eligibility status with automated calculations.",
      color: "text-yellow-500",
      gradient: "from-yellow-500/10 to-yellow-600/10",
    },
    {
      icon: BookOpen,
      title: "AI-Integrated Trading Journal & Assistant",
      description: "Risk-linked journal entries with AI coach Marthy providing real-time psychology analysis, discipline scoring, and personalized improvement recommendations.",
      color: "text-red-500",
      gradient: "from-red-500/10 to-red-600/10",
    },
    {
      icon: BarChart3,
      title: "Daily Performance vs Plan Analysis",
      description: "Real-time comparison of actual trading results against your pre-session plan with deviation alerts and adjustment recommendations.",
      color: "text-indigo-500",
      gradient: "from-indigo-500/10 to-indigo-600/10",
    },
    {
      icon: Bell,
      title: "Prop Trader News Calendar",
      description: "Curated economic events and news specifically relevant to prop firm traders with risk impact assessments and trading session timing.",
      color: "text-orange-500",
      gradient: "from-orange-500/10 to-orange-600/10",
    },
    {
      icon: Settings,
      title: "Strategy Builder & Sharing",
      description: "Create, test, and share custom trading strategies with the prop trader community while tracking adherence and performance metrics.",
      color: "text-teal-500",
      gradient: "from-teal-500/10 to-teal-600/10",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$9",
      originalPrice: "$19",
      period: "month",
      description: "Perfect for new prop traders",
      features: [
        "Up to 2 trading accounts",
        "Basic risk management",
        "Trading journal",
        "Basic analytics",
        "Email support",
        "Daily planning tools",
        "Basic mental fitness checks",
      ],
      popular: false,
      gradient: "from-gray-500 to-gray-600",
      savings: "Save $10/month",
    },
    {
      name: "Professional",
      price: "$19",
      originalPrice: "$39",
      period: "month",
      description: "For serious prop traders",
      features: [
        "Unlimited trading accounts",
        "Advanced risk management",
        "AI trading assistant (Marthy)",
        "Advanced analytics & reports",
        "Position sizing calculator",
        "Watchlists & notifications",
        "Target projection system",
        "Prop firm spending tracker",
        "Pre-session mental fitness",
        "High discipline tracking",
        "Priority support",
      ],
      popular: true,
      gradient: "from-yellow-500 to-yellow-600",
      savings: "Save $20/month",
    },
    {
      name: "Enterprise",
      price: "$39",
      originalPrice: "$79",
      period: "month",
      description: "For trading teams & firms",
      features: [
        "Everything in Professional",
        "Team collaboration",
        "Custom integrations",
        "White-label options",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom reporting",
        "API access",
      ],
      popular: false,
      gradient: "from-purple-500 to-purple-600",
      savings: "Save $40/month",
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
            <Badge className="mb-4 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300 shadow-sm">
              🚀 Trusted by 10,000+ Prop Traders
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              The <span className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent">#1 Journal</span>{" "}
              Exclusively for{" "}
              <span className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                Prop Firm
              </span>
              <br />
              Traders Success
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              The only trading journal fully focused on prop firm traders success. Master high discipline, daily planning, 
              pre-session mental fitness checks, target projections, and prop firm spending tracking to scale your funded accounts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation('/signup')}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-8 py-3 text-lg shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation('/auth')}
                className="px-8 py-3 text-lg border-yellow-400 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-500"
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
                    {plan.originalPrice && (
                      <span className="ml-2 text-lg text-gray-500 line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                  </div>
                  {plan.savings && (
                    <div className="mt-2">
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {plan.savings}
                      </span>
                    </div>
                  )}
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
                  <div className="space-y-3">
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
                    <Button 
                      variant="outline" 
                      className="w-full text-sm"
                      onClick={() => {
                        const modal = document.getElementById('pricing-comparison-modal');
                        if (modal) {
                          modal.classList.remove('hidden');
                          modal.classList.add('flex');
                        }
                      }}
                    >
                      Compare All Plans
                    </Button>
                  </div>
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
      
      {/* Pricing Comparison Modal */}
      <div 
        id="pricing-comparison-modal" 
        className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.currentTarget.classList.add('hidden');
            e.currentTarget.classList.remove('flex');
          }
        }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Compare All Plans</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const modal = document.getElementById('pricing-comparison-modal');
                  if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Features</th>
                    <th className="text-center p-4 font-medium">Starter</th>
                    <th className="text-center p-4 font-medium">Professional</th>
                    <th className="text-center p-4 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Trading Accounts</td>
                    <td className="text-center p-4">Up to 2</td>
                    <td className="text-center p-4">Unlimited</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Pre-Session Mental Fitness Check</td>
                    <td className="text-center p-4 text-gray-700 dark:text-gray-300">Basic</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Advanced</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Advanced + Custom</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Daily Trading Plan Builder</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Basic</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Advanced</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Team Plans</td>
                  </tr>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Target Projection System</td>
                    <td className="text-center p-4 text-gray-500 dark:text-gray-400">-</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Full Access</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Advanced + API</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Prop Firm Spending & Payout Eligibility</td>
                    <td className="text-center p-4 text-gray-500 dark:text-gray-400">-</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Full Tracking</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Multi-Firm + Reports</td>
                  </tr>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">AI-Integrated Trading Journal & Assistant</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Basic</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Advanced</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">AI Analysis</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Daily Performance vs Plan Analysis</td>
                    <td className="text-center p-4 text-gray-500 dark:text-gray-400">-</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Real-time</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Real-time + Alerts</td>
                  </tr>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Prop Trader News Calendar</td>
                    <td className="text-center p-4 text-gray-500 dark:text-gray-400">-</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Full Access</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Custom Alerts</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Strategy Builder & Sharing</td>
                    <td className="text-center p-4 text-gray-500 dark:text-gray-400">-</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Community</td>
                    <td className="text-center p-4 text-green-700 dark:text-green-400">Private + Teams</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Support</td>
                    <td className="text-center p-4 text-gray-700 dark:text-gray-300">Email</td>
                    <td className="text-center p-4 text-gray-700 dark:text-gray-300">Priority</td>
                    <td className="text-center p-4 text-gray-700 dark:text-gray-300">Dedicated Manager</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All plans include 14-day free trial • No setup fees • Cancel anytime
              </p>
              <Button 
                onClick={() => setLocation('/signup')}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-8 shadow-lg"
              >
                Start Your Free Trial
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Grade Section */}
    <div className="py-8 bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
            Security Grade
          </h2>
          <p className="text-sm text-gray-300">
            Enterprise-grade security protecting your trading data
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Password Security */}
          <Card className="bg-gradient-to-br from-gray-800/50 via-gray-900/60 to-black/70 border border-amber-500/20">
            <CardContent className="p-3 text-center">
              <Shield className="h-6 w-6 text-green-400 mx-auto mb-1" />
              <h3 className="text-xs font-semibold text-white mb-1">Password</h3>
              <div className="text-lg font-bold text-green-400">A+</div>
            </CardContent>
          </Card>

          {/* Session Security */}
          <Card className="bg-gradient-to-br from-gray-800/50 via-gray-900/60 to-black/70 border border-amber-500/20">
            <CardContent className="p-3 text-center">
              <Clock className="h-6 w-6 text-blue-400 mx-auto mb-1" />
              <h3 className="text-xs font-semibold text-white mb-1">Sessions</h3>
              <div className="text-lg font-bold text-blue-400">A+</div>
            </CardContent>
          </Card>

          {/* Data Encryption */}
          <Card className="bg-gradient-to-br from-gray-800/50 via-gray-900/60 to-black/70 border border-amber-500/20">
            <CardContent className="p-3 text-center">
              <Eye className="h-6 w-6 text-purple-400 mx-auto mb-1" />
              <h3 className="text-xs font-semibold text-white mb-1">Encryption</h3>
              <div className="text-lg font-bold text-purple-400">A+</div>
            </CardContent>
          </Card>

          {/* Infrastructure Security */}
          <Card className="bg-gradient-to-br from-gray-800/50 via-gray-900/60 to-black/70 border border-amber-500/20">
            <CardContent className="p-3 text-center">
              <Award className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
              <h3 className="text-xs font-semibold text-white mb-1">Infrastructure</h3>
              <div className="text-lg font-bold text-yellow-400">A+</div>
            </CardContent>
          </Card>

          {/* Overall Security Score */}
          <Card className="bg-gradient-to-br from-gray-800/50 via-gray-900/60 to-black/70 border border-amber-500/20">
            <CardContent className="p-3 text-center">
              <Trophy className="h-6 w-6 text-amber-400 mx-auto mb-1" />
              <h3 className="text-xs font-semibold text-white mb-1">Overall</h3>
              <div className="text-lg font-bold text-amber-400">A+</div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}