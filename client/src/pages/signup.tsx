import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, ArrowLeft, CheckCircle, Star } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, redirect to auth (this would be implemented with actual signup logic)
    setLocation('/auth');
  };

  const features = [
    "3-day free trial",
    "No credit card required",
    "Setup in under 5 minutes",
    "Cancel anytime"
  ];

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
              <Button variant="outline" onClick={() => setLocation('/auth')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Form */}
          <div className="max-w-md mx-auto lg:mx-0">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/welcome')}
              className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Start Your Trading Journey
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Join thousands of successful prop traders using PropTraderJournal
              </p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>
                  Get started with your 3-day free trial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                  >
                    Create Account
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-yellow-600 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" className="text-yellow-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Benefits */}
          <div className="lg:pl-12">
            <div className="mb-8">
              <Badge className="mb-4 bg-yellow-100 text-yellow-800">
                🚀 Trusted Platform
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose PropTraderJournal?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Built specifically for prop traders who want to pass challenges and scale their funded accounts.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">4.9/5 Rating</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                "PropTraderJournal helped me pass my $200K FTMO challenge in just 3 weeks. The risk management tools are incredible!"
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  MC
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Michael Chen</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">FTMO Funded Trader</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}