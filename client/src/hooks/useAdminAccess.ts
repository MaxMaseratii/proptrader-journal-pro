import { useAuth } from "@/hooks/useAuth";

export function useAdminAccess() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Type the user to include role
  const typedUser = user as { role?: string } | undefined;
  
  const isAdmin = typedUser?.role === 'admin';
  const isModerator = typedUser?.role === 'moderator';
  const hasAdminAccess = isAdmin || isModerator;

  return {
    isAdmin,
    isModerator,
    hasAdminAccess,
    isLoading: authLoading,
    isAuthenticated,
    user: typedUser
  };
}