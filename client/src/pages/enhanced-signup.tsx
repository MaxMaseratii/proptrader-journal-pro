import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Crown, ArrowLeft, CheckCircle, Star, CreditCard, Lock, Shield } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  subscriptionPlan: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
  captchaToken: string;
}

const subscriptionPlans = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    duration: '3 days',
    description: 'Perfect for getting started',
    features: [
      'Up to 3 trading accounts',
      'Basic analytics',
      'Journal entries',
      'CSV import'
    ],
    popular: false
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 19,
    duration: 'month',
    description: 'For individual traders',
    features: [
      'Unlimited trading accounts',
      'Advanced analytics',
      'Performance tracking',
      'Email support',
      'PDF reports'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 39,
    duration: 'month',
    description: 'For serious traders',
    features: [
      'Everything in Basic',
      'AI-powered insights',
      'Risk management tools',
      'Priority support',
      'Custom dashboards',
      'Multi-account analysis'
    ],
    popular: false
  }
];

const CaptchaComponent = ({ onVerify }: { onVerify: (token: string) => void }) => {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, text: `${a} + ${b} = ?` };
  });

  const handleVerify = () => {
    if (parseInt(answer) === question.a + question.b) {
      onVerify("verified");
    } else {
      alert("Incorrect answer. Please try again.");
      setAnswer("");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha">Security Check</Label>
      <div className="flex items-center space-x-2">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-center min-w-[80px]">
          {question.text}
        </div>
        <Input
          id="captcha"
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-20"
          placeholder="Answer"
        />
        <Button type="button" onClick={handleVerify} size="sm">
          Verify
        </Button>
      </div>
    </div>
  );
};

const PaymentForm = ({ 
  selectedPlan, 
  formData, 
  onSuccess 
}: { 
  selectedPlan: any;
  formData: SignupData;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    try {
      // First create the user account
      const userResponse = await apiRequest("/api/auth/signup", "POST", {
        ...formData,
        subscriptionPlan: selectedPlan.id
      });

      if (selectedPlan.price > 0) {
        // Process payment for paid plans
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/welcome?signup=success`,
          },
        });

        if (error) {
          toast({
            title: "Payment Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          onSuccess();
        }
      } else {
        // Free trial - no payment needed
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {selectedPlan.price > 0 && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h4 className="font-semibold mb-2">Payment Summary</h4>
            <div className="flex justify-between">
              <span>{selectedPlan.name}</span>
              <span>${selectedPlan.price}/{selectedPlan.duration}</span>
            </div>
          </div>
          <PaymentElement />
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
        disabled={isProcessing || (!stripe && selectedPlan.price > 0)}
      >
        {isProcessing ? (
          "Processing..."
        ) : selectedPlan.price > 0 ? (
          `Start ${selectedPlan.name} - $${selectedPlan.price}/${selectedPlan.duration}`
        ) : (
          `Start ${selectedPlan.duration} Free Trial`
        )}
      </Button>
    </form>
  );
};

export default function EnhancedSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState("");
  const [formData, setFormData] = useState<SignupData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    subscriptionPlan: "trial",
    acceptTerms: false,
    acceptMarketing: false,
    captchaToken: ""
  });

  const selectedPlan = subscriptionPlans.find(p => p.id === formData.subscriptionPlan) || subscriptionPlans[0];

  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      if (selectedPlan.price === 0) return { clientSecret: null };
      
      const response = await apiRequest("/api/create-subscription-payment", "POST", {
        subscriptionPlan: selectedPlan.id,
        amount: selectedPlan.price * 100 // Convert to cents
      });
      return response as unknown as { clientSecret: string | null };
    },
    onSuccess: (data) => {
      if (data && data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
      setStep(3);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment setup",
        variant: "destructive",
      });
    }
  });

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.captchaToken) {
      toast({
        title: "Security Check Required",
        description: "Please complete the security verification",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms of service to continue",
        variant: "destructive",
      });
      return;
    }
    
    setStep(2);
  };

  const handlePlanSelection = () => {
    createPaymentIntentMutation.mutate();
  };

  const handleSignupSuccess = () => {
    toast({
      title: "Account Created Successfully!",
      description: "Please check your email to verify your account",
    });
    setLocation('/welcome?signup=success');
  };

  const updateFormData = (field: keyof SignupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/welcome" className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                PropTrader
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Journal</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Already have an account?</span>
              <Button variant="outline" onClick={() => setLocation('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-yellow-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-20">
            <span className="text-sm text-gray-600">Account Info</span>
            <span className="text-sm text-gray-600">Choose Plan</span>
            <span className="text-sm text-gray-600">Payment</span>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card className="max-w-md mx-auto border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Create Your Account</CardTitle>
              <CardDescription>
                Enter your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    required
                  />
                </div>

                <CaptchaComponent 
                  onVerify={(token) => updateFormData('captchaToken', token)}
                />

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => updateFormData('acceptTerms', checked)}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm text-gray-600 dark:text-gray-400">
                      I agree to the{" "}
                      <Link href="/terms" className="text-yellow-600 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy-policy" className="text-yellow-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptMarketing"
                      checked={formData.acceptMarketing}
                      onCheckedChange={(checked) => updateFormData('acceptMarketing', checked)}
                    />
                    <Label htmlFor="acceptMarketing" className="text-sm text-gray-600 dark:text-gray-400">
                      I'd like to receive product updates and marketing emails
                    </Label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                >
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Plan Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Your Plan
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Select the plan that fits your trading needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    formData.subscriptionPlan === plan.id 
                      ? 'ring-2 ring-yellow-500 border-yellow-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  } ${plan.popular ? 'scale-105' : ''}`}
                  onClick={() => updateFormData('subscriptionPlan', plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      {plan.price > 0 && <span className="text-gray-600">/{plan.duration}</span>}
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={handlePlanSelection}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                disabled={createPaymentIntentMutation.isPending}
              >
                {createPaymentIntentMutation.isPending ? "Processing..." : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <Card className="max-w-md mx-auto border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Secure Payment
              </CardTitle>
              <CardDescription>
                {selectedPlan.price > 0 
                  ? "Complete your payment to activate your account" 
                  : "Complete your free trial setup"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPlan.price > 0 && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm 
                    selectedPlan={selectedPlan}
                    formData={formData}
                    onSuccess={handleSignupSuccess}
                  />
                </Elements>
              ) : (
                <PaymentForm 
                  selectedPlan={selectedPlan}
                  formData={formData}
                  onSuccess={handleSignupSuccess}
                />
              )}
              
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <Shield className="h-4 w-4 mr-1" />
                Secured by Stripe
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}