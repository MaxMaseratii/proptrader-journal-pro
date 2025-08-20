import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return await apiRequest('POST', '/api/auth/login', credentials);
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "Welcome back to PropTraderJournal!",
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PropTraderJournal</h1>
          <p className="text-gray-400">Welcome back to your trading journal</p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Sign In</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-semibold"
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <button 
                  onClick={() => setLocation('/enhanced-signup')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <button
            onClick={() => setLocation('/')}
            className="text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}