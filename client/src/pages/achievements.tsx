import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import EnhancedAchievementSystem from "@/components/enhanced-achievement-system";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AchievementsPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Fetch trades and accounts data
  const { data: trades = [] } = useQuery({
    queryKey: ['/api/trades'],
    enabled: isAuthenticated
  });
  
  const { data: accounts = [] } = useQuery({
    queryKey: ['/api/accounts'],
    enabled: isAuthenticated
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <EnhancedAchievementSystem trades={trades as any[]} accounts={accounts as any[]} />
    </div>
  );
}