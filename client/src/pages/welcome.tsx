// Full welcome page with hero, features, pricing, and testimonials
// This is a landing page showing PropTraderJournal capabilities
// Features: PropTrader Header, Hero Section, Features Grid, Pricing Plans, Testimonials
// See Replit repository for full implementation
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, Target, Brain, DollarSign, BarChart3, 
  Award, ArrowRight, CheckCircle, Star, Zap,
  TrendingUp, Users, BookOpen, Shield
} from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Features array with icons and descriptions
  const features = [
    { icon: Brain, title: "Pre-Session Mental Fitness", description: "85% readiness score with metrics" },
    { icon: Target, title: "Profit Target Calculator", description: "Account-based simulations" },
    { icon: DollarSign, title: "Prop Firm Spending", description: "Payout eligibility tracking" },
    { icon: BarChart3, title: "Performance Analytics", description: "Advanced analytics" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with Logo */}
      <header className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-black" />
                <span className="font-bold text-black">PropTrader Journal</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation('/auth')} className="text-black">
                Log In
              </Button>
              <Button onClick={() => setLocation('/signup')} className="bg-black text-yellow-400">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-teal-900 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 text-white">
          Master Prop Trading With <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Precision</span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          The only trading journal engineered for prop firm success with 8 unique capabilities designed to maximize your funded account performance.
        </p>
        <div className="flex gap-6 justify-center">
          <Button size="lg" onClick={() => setLocation('/signup')} className="bg-yellow-400 text-black hover:bg-yellow-500">
            Start Your Free Trial
          </Button>
          <Button size="lg" variant="outline" className="border-teal-400 text-teal-400">
            Watch Demo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Built for <span className="text-yellow-500">Prop Traders</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-8 w-8 mb-4 text-yellow-500" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">Transparent Pricing</h2>
          <div className="flex justify-center gap-4 mb-12">
            <Button variant={billingPeriod === 'monthly' ? 'default' : 'outline'} onClick={() => setBillingPeriod('monthly')}>
              Monthly
            </Button>
            <Button variant={billingPeriod === 'annual' ? 'default' : 'outline'} onClick={() => setBillingPeriod('annual')}>
              Annual (Save 5%)
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '$9.99', features: ['1 Account', 'Basic Analytics'] },
              { name: 'Professional', price: '$14.99', features: ['5 Accounts', 'AI Assistant', 'Full Features'], popular: true },
              { name: 'Elite', price: '$24.99', features: ['Unlimited Accounts', 'Professional Tools'] }
            ].map((plan, i) => (
              <Card key={i} className={`${plan.popular ? 'border-yellow-400 scale-105' : ''} bg-gray-800 border-gray-700`}>
                <CardHeader>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-yellow-400 mt-4">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center text-gray-300">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 text-center">
        <p className="text-gray-600">© 2025 PropTraderJournal. The elite trading journal for prop firm traders.</p>
      </footer>
    </div>
  );
}
