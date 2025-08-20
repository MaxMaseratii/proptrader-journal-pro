import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, CreditCard, Crown, Star, Zap } from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  subscriptionPlan: z.enum(["trial", "basic", "premium", "pro"]),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
  captchaVerified: z.boolean().refine(val => val === true, "Please verify you're not a robot"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

const plans = [
  {
    id: "trial",
    name: "7-Day Trial",
    price: "Free",
    duration: "7 days",
    features: [
      "Full access to all features",
      "Up to 3 trading accounts",
      "Basic support",
      "Analytics & reporting"
    ],
    popular: false,
    requiresCard: true,
    description: "Try all features risk-free"
  },
  {
    id: "basic",
    name: "Basic Plan",
    price: "$29",
    duration: "per month",
    features: [
      "Unlimited trading accounts",
      "Advanced analytics",
      "Email support",
      "CSV import/export",
      "Risk management tools"
    ],
    popular: false,
    requiresCard: true,
    description: "Perfect for individual traders"
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "$49",
    duration: "per month",
    features: [
      "Everything in Basic",
      "Priority support",
      "Advanced reporting",
      "Custom alerts",
      "API access"
    ],
    popular: true,
    requiresCard: true,
    description: "Most popular for growing traders"
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: "$99",
    duration: "per month",
    features: [
      "Everything in Premium",
      "White-label options",
      "Dedicated support",
      "Custom integrations",
      "Team collaboration"
    ],
    popular: false,
    requiresCard: true,
    description: "For professional trading firms"
  }
];

function SimpleCaptcha({ onVerify }: { onVerify: (verified: boolean) => void }) {
  const [answer, setAnswer] = useState("");
  const [question] = useState(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { question: `${num1} + ${num2} = ?`, answer: num1 + num2 };
  });
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    const isCorrect = parseInt(answer) === question.answer;
    setVerified(isCorrect);
    onVerify(isCorrect);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha">Verify you're human: {question.question}</Label>
      <div className="flex space-x-2">
        <Input
          id="captcha"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the answer"
          className="flex-1"
        />
        <Button type="button" onClick={handleVerify} variant="outline">
          {verified ? <CheckCircle className="h-4 w-4 text-green-500" /> : "Verify"}
        </Button>
      </div>
    </div>
  );
}

function PaymentForm({ selectedPlan }: { selectedPlan: string }) {
  const stripe = useStripe();
  const elements = useElements();
  
  if (selectedPlan === "trial" || !stripe || !elements) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {selectedPlan === "trial" 
            ? "Card required for trial - no charges until trial ends" 
            : "Payment processing setup..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>Payment Information</Label>
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

function SignUpForm() {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      subscriptionPlan: "trial",
      agreeToTerms: false,
      captchaVerified: false,
    },
  });

  const selectedPlan = watch("subscriptionPlan");
  const selectedPlanInfo = plans.find(p => p.id === selectedPlan);

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpForm & { paymentMethodId?: string }) => {
      return apiRequest("POST", "/api/auth/signup", data);
    },
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    if (!captchaVerified) {
      toast({
        title: "Verification Required",
        description: "Please complete the captcha verification.",
        variant: "destructive",
      });
      return;
    }

    let paymentMethodId: string | undefined;

    // Handle payment for paid plans
    if (selectedPlan !== "trial" && stripe && elements) {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast({
          title: "Payment Error",
          description: "Please enter your payment information.",
          variant: "destructive",
        });
        return;
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast({
          title: "Payment Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      paymentMethodId = paymentMethod.id;
    }

    signUpMutation.mutate({ ...data, paymentMethodId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-gray-900/95 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Join PropTrader Journal
          </CardTitle>
          <CardDescription className="text-gray-300">
            Start your professional trading journey with advanced analytics and risk management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className="bg-gray-800 border-gray-600"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className="bg-gray-800 border-gray-600"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="bg-gray-800 border-gray-600"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="bg-gray-800 border-gray-600"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className="bg-gray-800 border-gray-600"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <Label className="text-lg font-semibold">Choose Your Plan</Label>
              <RadioGroup
                value={selectedPlan}
                onValueChange={(value) => setValue("subscriptionPlan", value as any)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
              >
                {plans.map((plan) => (
                  <div key={plan.id} className="relative">
                    <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                    <Label
                      htmlFor={plan.id}
                      className={`block p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{plan.name}</h3>
                        {plan.popular && (
                          <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-yellow-400 mb-2">
                        {plan.price}
                        <span className="text-sm text-gray-400 ml-1">{plan.duration}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">{plan.description}</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-300">
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.subscriptionPlan && (
                <p className="text-red-400 text-sm mt-1">{errors.subscriptionPlan.message}</p>
              )}
            </div>

            {/* Payment Information */}
            {selectedPlanInfo?.requiresCard && (
              <PaymentForm selectedPlan={selectedPlan} />
            )}

            {/* Captcha */}
            <SimpleCaptcha
              onVerify={(verified) => {
                setCaptchaVerified(verified);
                setValue("captchaVerified", verified);
              }}
            />

            {/* Terms Agreement */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                {...register("agreeToTerms")}
                onCheckedChange={(checked) => setValue("agreeToTerms", checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm text-gray-300">
                I agree to the{" "}
                <Link href="/terms" className="text-yellow-400 hover:text-yellow-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-yellow-400 hover:text-yellow-300">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-400 text-sm">{errors.agreeToTerms.message}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
              disabled={signUpMutation.isPending}
            >
              {signUpMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-yellow-400 hover:text-yellow-300">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignUp() {
  return (
    <Elements stripe={stripePromise}>
      <SignUpForm />
    </Elements>
  );
}