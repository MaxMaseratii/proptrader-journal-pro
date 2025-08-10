import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for new prop traders getting started",
      popular: false,
      features: [
        "Basic journaling and trade tracking",
        "Pre-session mental fitness check",
        "Daily trading plan builder",
        "Up to 2 prop firm accounts",
        "Basic analytics and reporting",
        "Email support"
      ],
      notIncluded: [
        "Target projection system",
        "Prop firm spending tracker",
        "AI trading assistant",
        "Advanced analytics",
        "Priority support"
      ]
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Most popular choice for serious prop traders",
      popular: true,
      features: [
        "Everything in Starter",
        "Advanced mental fitness assessments",
        "Target projection system",
        "Prop firm spending & payout tracking",
        "AI trading assistant (Marthy)",
        "Real-time performance vs plan analysis",
        "Prop trader news calendar",
        "Strategy builder & community sharing",
        "Advanced analytics and reports",
        "Unlimited prop firm accounts",
        "Priority support"
      ],
      notIncluded: [
        "Team collaboration features",
        "Custom integrations",
        "Dedicated account manager"
      ]
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For prop firms and trading teams",
      popular: false,
      features: [
        "Everything in Professional",
        "Team collaboration tools",
        "Custom prop firm integrations",
        "Advanced team analytics",
        "Bulk user management",
        "Custom branding options",
        "API access and webhooks",
        "Dedicated account manager",
        "Phone support",
        "Custom training sessions"
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
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {plan.period}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent>
                <Button 
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