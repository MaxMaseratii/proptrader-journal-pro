import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, X, Tag, Gift } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { getUniversalValueColor, getStatusColor } from "@/lib/colorUtils";

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [isYearly, setIsYearly] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const applyPromoCode = () => {
    const validPromoCodes: Record<string, number> = {
      "WELCOME20": 0.20,
      "TRADER10": 0.10,
      "SAVE15": 0.15,
      "PROPFIRM25": 0.25,
      "ELITE30": 0.30
    };

    const discount = validPromoCodes[promoCode.toUpperCase()] || 0;
    setPromoDiscount(discount);
  };

  const getPrice = (basePrice: number) => {
    let price = basePrice;
    if (isYearly) {
      price = price * 12 * 0.83; // 17% yearly discount (2 months free)
    }
    if (promoDiscount > 0) {
      price = price * (1 - promoDiscount);
    }
    return price;
  };

  const plans = [
    {
      name: "Starter",
      price: 9,
      period: "/month",
      description: "Perfect for new prop traders getting started",
      popular: false,
      features: [
        "1 Trading Account",
        "Basic Performance Analytics (7-day history)",
        "Daily Trading Plans",
        "Mental Fitness Checks",
        "Basic Trading Journal (text only)",
        "30-day data retention",
        "Email Support"
      ],
      notIncluded: [
        "Advanced Reports",
        "AI Assistant",
        "Target Projections",
        "Multiple Accounts"
      ]
    },
    {
      name: "Professional",
      price: 14.99,
      period: "/month",
      description: "Most popular choice for serious prop traders",
      popular: true,
      features: [
        "Everything in Starter",
        "5 Trading Accounts",
        "Advanced Analytics & Reports",
        "AI Assistant (Marthy)",
        "Target Projections System",
        "Prop Spending Tracking",
        "Enhanced Trading Journal (photos, links, tags)",
        "90-day data retention",
        "Priority Support"
      ],
      notIncluded: [
        "Monte Carlo Simulations",
        "Unlimited Accounts",
        "Professional Analytics"
      ]
    },
    {
      name: "Elite",
      price: 24.99,
      period: "/month",
      description: "For Professional Traders",
      popular: false,
      features: [
        "Everything in Professional",
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
      notIncluded: []
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Start your prop trading journey with the plan that fits your needs. 
            All plans include a 3-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <span className={`text-sm ${!isYearly ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-yellow-500"
            />
            <span className={`text-sm ${isYearly ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
              Yearly
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-700 ml-2">
              Save 17%
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-yellow-500 shadow-xl scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl text-gray-900 dark:text-white">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${getPrice(plan.price).toFixed(2)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-1">
                      {isYearly ? '/year' : plan.period}
                    </span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      <s className="text-gray-400">${(isYearly ? plan.price * 12 * 0.83 : plan.price).toFixed(2)}</s>
                      <span className="ml-2 font-medium">{Math.round(promoDiscount * 100)}% off applied!</span>
                    </div>
                  )}
                  {isYearly && (
                    <div className="text-sm text-green-600 mt-1">
                      Save ${(plan.price * 12 * 0.17).toFixed(2)} per year
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent>
                <Button 
                  onClick={() => setSelectedPlan(plan.name.toLowerCase())}
                  variant={selectedPlan === plan.name.toLowerCase() ? "default" : "outline"}
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white' 
                      : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
                  }`}
                >
                  Start Free Trial
                </Button>
                
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                  
                  {plan.notIncluded.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <X className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-400">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Promo Code Section */}
        {selectedPlan && (
          <div className="max-w-md mx-auto mb-16">
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-yellow-600" />
                  Have a Promo Code?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={applyPromoCode}
                    variant="outline"
                    size="icon"
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                {promoDiscount > 0 && (
                  <div className="mt-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    🎉 Promo code applied! You're saving {Math.round(promoDiscount * 100)}%
                  </div>
                )}
                <div className="mt-4">
                  <Button 
                    onClick={() => setLocation('/signup')}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Start Your 3-Day Free Trial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Can I change plans anytime?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All plans include a 3-day free trial with full access to features. No credit card required.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes, we offer a 30-day money-back guarantee for all plans. No questions asked.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise CTA */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Need a custom solution?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Contact our team to discuss custom pricing and features for your prop firm or trading team.
            </p>
            <Button variant="outline">
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}