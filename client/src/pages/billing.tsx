import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { useBillingQuery } from "@/hooks/useOptimizedQuery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Calendar, 
  Check, 
  Star, 
  Download,
  ArrowUpRight,
  AlertCircle
} from "lucide-react";

// Note: Stripe components would be lazy loaded when needed
// const StripeComponents = lazy(() => import("@/components/stripe-components"));

// Performance optimized billing skeleton
const BillingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-64 bg-gray-300 rounded"></div>
      ))}
    </div>
    <div className="h-48 bg-gray-300 rounded"></div>
  </div>
);

export default function Billing() {
  const [currentPlan, setCurrentPlan] = useState("Pro");

  // Use optimized billing query hook
  const { data: billingData, isLoading } = useBillingQuery();

  // Memoized plan change handler
  const handlePlanChange = useCallback((planName: string) => {
    setCurrentPlan(planName);
    // Add API call to change plan
  }, []);

  // Memoized plans data for performance
  const memoizedPlans = useMemo(() => plans, []);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Basic trading journal",
        "5 trades per month",
        "Basic performance analytics",
        "Community support"
      ],
      current: false,
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      features: [
        "Unlimited trades",
        "Advanced analytics",
        "Risk management tools",
        "CSV import/export",
        "Email support",
        "Custom strategies"
      ],
      current: true,
      popular: true
    },
    {
      name: "Elite",
      price: "$99",
      period: "per month",
      features: [
        "Everything in Pro",
        "AI trading companion",
        "Advanced discipline tracking",
        "Priority support",
        "Custom integrations",
        "Multi-account management"
      ],
      current: false,
      popular: false
    }
  ];

  const billingHistory = [
    {
      id: 1,
      date: "2025-08-01",
      amount: "$29.00",
      plan: "Pro Plan",
      status: "Paid",
      invoice: "INV-2025-001"
    },
    {
      id: 2,
      date: "2025-07-01",
      amount: "$29.00",
      plan: "Pro Plan",
      status: "Paid",
      invoice: "INV-2025-002"
    },
    {
      id: 3,
      date: "2025-06-01",
      amount: "$29.00",
      plan: "Pro Plan",
      status: "Paid",
      invoice: "INV-2025-003"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
          <p className="text-gray-400">Manage your subscription and billing information</p>
        </div>

        {/* Current Plan */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-white">Current Plan</CardTitle>
                <CardDescription className="text-gray-400">
                  You are currently on the {currentPlan} plan
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-prop-gold text-black font-bold">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-prop-gold/20 p-3 rounded-lg">
                <Star className="h-6 w-6 text-prop-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{currentPlan} Plan</h3>
                <p className="text-gray-400">$29/month • Next billing: August 31, 2025</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex space-x-4">
                <Button variant="outline" className="border-prop-gold text-prop-gold hover:bg-prop-gold hover:text-black">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${
                  plan.current 
                    ? "bg-gradient-to-br from-prop-gold/10 to-yellow-900/10 border-prop-gold/30" 
                    : "bg-gray-800/50 border-gray-700"
                } ${plan.popular ? "ring-2 ring-prop-gold/20" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-prop-gold text-black font-bold">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-white">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-400">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.current 
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
                        : "bg-prop-gold text-black hover:bg-prop-gold/90"
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Payment Method</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your payment information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-2 rounded">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">•••• •••• •••• 4242</p>
                  <p className="text-gray-400 text-sm">Expires 12/2027</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-white">Billing History</CardTitle>
                <CardDescription className="text-gray-400">
                  Download your past invoices and receipts
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-600/20 p-2 rounded">
                      <Calendar className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.plan}</p>
                      <p className="text-gray-400 text-sm">{item.date} • {item.invoice}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-white font-medium">{item.amount}</p>
                      <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
                        {item.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Usage Statistics</CardTitle>
            <CardDescription className="text-gray-400">
              Current month usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-prop-gold">247</div>
                <div className="text-sm text-gray-400">Trades Logged</div>
                <div className="text-xs text-gray-500">Unlimited</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">12</div>
                <div className="text-sm text-gray-400">Reports Generated</div>
                <div className="text-xs text-gray-500">Unlimited</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">5.2GB</div>
                <div className="text-sm text-gray-400">Data Storage</div>
                <div className="text-xs text-gray-500">10GB Limit</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}