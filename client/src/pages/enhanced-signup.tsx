import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, Shield, CheckCircle, Star, Crown, CreditCard, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import StripeTestCards from "@/components/StripeTestCards";

// Load Stripe public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

// Validation schemas
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
  captchaToken: z.string().min(1, "Please complete the captcha verification"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

// Plan options with updated pricing
const plans = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 9.99,
    annualPrice: 113.89,
    period: "/month",
    description: "Perfect for new prop traders",
    features: [
      "1 Trading Account",
      "Basic Analytics (7-day history)",
      "Daily Trading Plans",
      "Mental Fitness Checks", 
      "Basic Trading Journal",
      "30-day data retention",
      "Email Support"
    ],
    gradient: "from-gray-500 to-gray-600",
    popular: false,
    trialDays: 3
  },
  {
    id: "professional",
    name: "Professional",
    monthlyPrice: 14.99,
    annualPrice: 170.89,
    period: "/month",
    description: "Most popular for active traders",
    features: [
      "5 Trading Accounts",
      "Advanced Analytics & Reports",
      "AI Assistant (Marthy)",
      "Target Projections System",
      "Prop Spending Tracking",
      "Enhanced Trading Journal",
      "90-day data retention",
      "Priority Support"
    ],
    gradient: "from-blue-500 to-blue-600",
    popular: true,
    trialDays: 3
  },
  {
    id: "elite",
    name: "Elite",
    monthlyPrice: 24.99,
    annualPrice: 284.89,
    period: "/month",
    description: "For professional traders",
    features: [
      "Unlimited Trading Accounts",
      "Professional Dashboard",
      "Monte Carlo Simulations",
      "Institutional Charts & Analytics",
      "AI-Powered Mental Check",
      "Professional Flow State Programs",
      "Multi-Firm ROI Analysis",
      "Tax-Ready Payout Reports"
    ],
    gradient: "from-yellow-500 to-orange-500",
    popular: false,
    trialDays: 3
  }
];

// Simple captcha component (in production, use reCAPTCHA)
const SimpleCaptcha = ({ onVerify }: { onVerify: (token: string) => void }) => {
  const [num1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(Math.floor(Math.random() * 10) + 1);
  const [answer, setAnswer] = useState("");
  const [verified, setVerified] = useState(false);

  const checkAnswer = () => {
    if (parseInt(answer) === num1 + num2) {
      setVerified(true);
      onVerify(`captcha-${Date.now()}`);
    } else {
      setVerified(false);
      onVerify("");
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-200">Security Verification</Label>
      <div className="flex items-center space-x-2">
        <div className="bg-gray-800 px-3 py-2 rounded border text-gray-200 font-mono">
          {num1} + {num2} = ?
        </div>
        <Input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onBlur={checkAnswer}
          className="w-20 bg-gray-700 border-gray-600 text-white"
          placeholder="?"
        />
        {verified && <CheckCircle className="h-5 w-5 text-green-500" />}
      </div>
    </div>
  );
};

// Payment form component
const PaymentForm = ({ selectedPlan, billingPeriod, onSuccess }: { selectedPlan: any, billingPeriod: 'monthly' | 'annual', onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const currentPrice = billingPeriod === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    // For trial plans, just process without payment
    if (currentPrice === 0) {
      toast({
        title: "Trial Started",
        description: `Your ${selectedPlan.trialDays}-day trial has begun!`,
      });
      onSuccess();
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    try {
      // Create payment intent
      const response = await apiRequest("/api/create-payment-intent", "POST", {
        planId: selectedPlan.id,
        billingPeriod: billingPeriod
      });
      const { clientSecret } = await response.json();

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (result.error) {
        toast({
          title: "Payment Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Welcome to PropTraderJournal!",
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
        <Label className="text-sm text-gray-200 mb-2 block">Payment Information</Label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#fff',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      >
        {processing ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          currentPrice === 0 ? `Start ${selectedPlan.trialDays}-Day Trial` : 
          `Pay $${currentPrice.toFixed(2)}${billingPeriod === 'monthly' ? '/month' : '/year'}`
        )}
      </Button>
    </form>
  );
};

export default function EnhancedSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to Professional
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
      captchaToken: "",
    },
  });

  // Update captcha token in form
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    form.setValue("captchaToken", token);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      const response = await apiRequest("/api/auth/register", "POST", {
        ...data,
        planId: selectedPlan.id,
        captchaToken
      });
      return response.json();
    },
    onSuccess: () => {
      setEmailVerificationSent(true);
      setCurrentStep(4);
      toast({
        title: "Account Created",
        description: "Please check your email to verify your account",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: SignupForm) => {
    if (currentStep === 3) {
      signupMutation.mutate(data);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              Join PropTraderJournal
            </h1>
            <p className="text-gray-300">Start your journey to funded trading success</p>
            
            {/* Progress bar */}
            <div className="mt-6 max-w-md mx-auto">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span className={currentStep >= 1 ? "text-yellow-400" : ""}>Plan</span>
                <span className={currentStep >= 2 ? "text-yellow-400" : ""}>Details</span>
                <span className={currentStep >= 3 ? "text-yellow-400" : ""}>Payment</span>
                <span className={currentStep >= 4 ? "text-yellow-400" : ""}>Verify</span>
              </div>
            </div>
          </div>

          <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Step 1: Plan Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CardTitle className="text-2xl text-white mb-2">Choose Your Plan</CardTitle>
                    <CardDescription className="text-gray-400">
                      Select the plan that best fits your trading goals
                    </CardDescription>
                    
                    {/* Billing Period Toggle */}
                    <div className="flex justify-center mt-6 mb-6">
                      <div className="bg-gray-800/60 backdrop-blur-sm p-2 rounded-lg border border-gray-600">
                        <div className="flex">
                          <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${
                              billingPeriod === 'monthly'
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg'
                                : 'text-gray-300 hover:text-white'
                            }`}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setBillingPeriod('annual')}
                            className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 relative ${
                              billingPeriod === 'annual'
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg'
                                : 'text-gray-300 hover:text-white'
                            }`}
                          >
                            Annual
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              Save 5%
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all duration-300 ${
                          selectedPlan.id === plan.id
                            ? "border-yellow-400 bg-yellow-400/10"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        {plan.popular && (
                          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                            Most Popular
                          </Badge>
                        )}
                        
                        <div className="p-6">
                          <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                            <p className="text-gray-400 text-sm">{plan.description}</p>
                          </div>
                          
                          <div className="text-center mb-6">
                            <div className="flex items-baseline justify-center">
                              <span className="text-3xl font-bold text-white">
                                ${billingPeriod === 'monthly' ? plan.monthlyPrice.toFixed(2) : (plan.annualPrice / 12).toFixed(2)}
                              </span>
                              <span className="text-gray-400 ml-1">
                                {billingPeriod === 'monthly' ? '/month' : '/month (billed annually)'}
                              </span>
                            </div>
                            {billingPeriod === 'annual' && (
                              <div className="space-y-1">
                                <p className="text-green-400 text-sm">
                                  Save ${((plan.monthlyPrice * 12) - plan.annualPrice).toFixed(2)} per year!
                                </p>
                                <p className="text-xs text-gray-400">
                                  Billed ${plan.annualPrice} annually
                                </p>
                              </div>
                            )}
                            {plan.trialDays > 0 && (
                              <p className="text-green-400 text-sm mt-2">
                                {plan.trialDays}-day free trial
                              </p>
                            )}
                          </div>
                          
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center text-sm text-gray-300">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={nextStep} className="px-8 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                      Continue with {selectedPlan.name}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Account Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CardTitle className="text-2xl text-white mb-2">Account Details</CardTitle>
                    <CardDescription className="text-gray-400">
                      Create your PropTraderJournal account
                    </CardDescription>
                  </div>

                  <Form {...form}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">First Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  {...field}
                                  placeholder="John"
                                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Last Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  {...field}
                                  placeholder="Doe"
                                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="trader@example.com"
                                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-200">Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-200">Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                                  >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Captcha */}
                    <SimpleCaptcha onVerify={handleCaptchaVerify} />

                    {/* Terms agreement */}
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-gray-600"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-gray-200">
                              I agree to the{" "}
                              <a href="/terms" className="text-yellow-400 hover:underline">
                                Terms of Service
                              </a>{" "}
                              and{" "}
                              <a href="/privacy" className="text-yellow-400 hover:underline">
                                Privacy Policy
                              </a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </Form>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} className="border-gray-600 text-gray-300">
                      Back
                    </Button>
                    <Button 
                      onClick={nextStep} 
                      disabled={!form.formState.isValid || !captchaToken}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CardTitle className="text-2xl text-white mb-2">Payment Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      Complete your {selectedPlan.name} plan setup
                    </CardDescription>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">{selectedPlan.name} Plan</span>
                      <span className="text-white font-semibold">
                        ${billingPeriod === 'monthly' ? selectedPlan.monthlyPrice.toFixed(2) : (selectedPlan.annualPrice / 12).toFixed(2)}
                        {billingPeriod === 'monthly' ? '/month' : '/month (billed annually)'}
                      </span>
                    </div>
                    {billingPeriod === 'annual' && (
                      <p className="text-green-400 text-sm mt-2">
                        Save ${((selectedPlan.monthlyPrice * 12) - selectedPlan.annualPrice).toFixed(2)} per year!
                      </p>
                    )}
                    {selectedPlan.trialDays > 0 && (
                      <p className="text-green-400 text-sm mt-2">
                        Includes {selectedPlan.trialDays}-day free trial
                      </p>
                    )}
                  </div>

                  {/* Test Cards Information */}
                  <StripeTestCards />
                  
                  <PaymentForm 
                    selectedPlan={selectedPlan} 
                    billingPeriod={billingPeriod}
                    onSuccess={() => form.handleSubmit(handleSubmit)()}
                  />

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} className="border-gray-600 text-gray-300">
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Email Verification */}
              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-green-500" />
                  </div>
                  
                  <div>
                    <CardTitle className="text-2xl text-white mb-2">Check Your Email</CardTitle>
                    <CardDescription className="text-gray-400">
                      We've sent a verification link to your email address. Please click the link to activate your account.
                    </CardDescription>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <p className="text-gray-300 mb-4">
                      Didn't receive the email? Check your spam folder or click below to resend.
                    </p>
                    <Button variant="outline" className="border-gray-600 text-gray-300">
                      Resend Verification Email
                    </Button>
                  </div>

                  <Button 
                    onClick={() => window.location.href = "/auth"}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    Continue to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <div className="flex justify-center items-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">10,000+ Traders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
}