import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Shield, CheckCircle, ShieldCheck, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function AdminSetup() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePromoteUser = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to promote to admin.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/api/admin/promote-user', 'POST', {
        email: email.trim()
      });

      const result = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        toast({
          title: "Success!",
          description: `${email} has been promoted to admin.`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to promote user to admin.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      toast({
        title: "Error",
        description: "Failed to promote user to admin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <Card className="bg-gray-800 border-gray-600 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl text-white">Admin Setup</CardTitle>
          <CardDescription className="text-gray-400">
            Promote a user to administrator status
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!success ? (
            <>
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-medium text-sm">Development Setup</p>
                    <p className="text-yellow-200/80 text-xs mt-1">
                      This is a temporary setup tool. In production, admin access should be managed through your user management system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter email address to promote"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={isLoading}
                />
                <p className="text-gray-500 text-xs">
                  Enter the email address of the user you want to promote to admin
                </p>
              </div>

              <Button
                onClick={handlePromoteUser}
                disabled={isLoading || !email.trim()}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Promoting User...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Promote to Admin
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Success!</h3>
                <p className="text-gray-400">
                  The user has been promoted to admin. They now have access to the admin dashboard.
                </p>
              </div>
            </div>
          )}

          <div className="text-center pt-4 border-t border-gray-600 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link to="/admin">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Basic Admin
                </Button>
              </Link>
              <Link to="/admin-enhanced">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Enhanced Admin
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}