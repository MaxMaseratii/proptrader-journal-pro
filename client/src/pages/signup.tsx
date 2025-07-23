import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Mail, Lock, User, Check, Star } from "lucide-react";
import { Link } from "wouter";

const pricingPlans = [
  {
    name: "Basic",
    price: "$4.99",
    period: "per month",
    description: "Perfect for individual traders",
    features: [
      "Up to 5 trading accounts",
      "Basic performance tracking",
      "Journal entries",
      "Monthly reports",
      "Email support"
    ],
    popular: false
  },
  {
    name: "Pro Trader",
    price: "$9.99",
    period: "per month",
    description: "For serious prop traders",
    features: [
      "Up to 10 trading accounts",
      "Advanced analytics & discipline tracking",
      "AI trading companion",
      "Risk management tools",
      "Priority support",
      "Export capabilities"
    ],
    popular: true
  },
  {
    name: "Firm Elite",
    price: "$14.99",
    period: "per month",
    description: "For trading firms and professionals",
    features: [
      "Unlimited trading accounts",
      "Team management features",
      "Advanced reporting suite",
      "Custom integrations",
      "White-label options",
      "Dedicated account manager"
    ],
    popular: false
  }
];

export default function Signup() {
  const [selectedPlan, setSelectedPlan] = useState('Pro Trader');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-6 border-b border-amber-500/20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
                PropTraderJournal
              </h1>
              <p className="text-sm text-gray-400">#1 Elite PropTrader Journal</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
              Back to Login
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
            Start Your Trading Journey
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of successful prop traders who trust PropTraderJournal to track their performance and achieve consistency.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Signup Form */}
          <Card className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 border border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-amber-400">Create Your Account</CardTitle>
              <p className="text-center text-gray-400">Get started with your 15-day free trial</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white focus:border-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white pl-10 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white pl-10 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white pl-10 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Selected Plan */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-amber-400 font-semibold">{selectedPlan} Plan</h4>
                    <p className="text-sm text-gray-300">15-day free trial included</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">
                      {pricingPlans.find(p => p.name === selectedPlan)?.price}
                    </div>
                    <div className="text-sm text-gray-400">per month</div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                />
                <Label htmlFor="agreeToTerms" className="text-sm text-gray-300 leading-relaxed">
                  I agree to the <Link href="/terms" className="text-amber-400 hover:text-amber-300">Terms of Service</Link> and{' '}
                  <Link href="/privacy" className="text-amber-400 hover:text-amber-300">Privacy Policy</Link>
                </Label>
              </div>

              {/* Signup Button */}
              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold py-3 hover:from-amber-400 hover:to-amber-500"
                disabled={!formData.agreeToTerms}
              >
                Start Free Trial
              </Button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/" className="text-amber-400 hover:text-amber-300">
                  Sign in here
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-amber-400">Choose Your Plan</h3>
            
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.name
                    ? 'bg-gradient-to-br from-amber-900/40 via-amber-800/40 to-amber-900/40 border-amber-500/50 ring-2 ring-amber-500/30'
                    : 'bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 border-gray-600/30 hover:border-amber-500/30'
                }`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-amber-400 flex items-center gap-2">
                        {plan.name}
                        {plan.popular && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
                      </CardTitle>
                      <p className="text-sm text-gray-400">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{plan.price}</div>
                      <div className="text-sm text-gray-400">{plan.period}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {selectedPlan === plan.name && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-sm text-amber-300 font-medium">✓ Selected Plan</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trial Information */}
        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-amber-400 mb-4">15-Day Free Trial</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Start your journey risk-free. Cancel anytime during your trial period with no charges. 
              Experience the full power of PropTraderJournal before committing to a subscription.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Full feature access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}