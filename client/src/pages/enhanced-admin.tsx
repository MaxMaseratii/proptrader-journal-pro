import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Tag, Users, DollarSign, Settings, ShieldAlert, Lock, Target, UserCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { Link } from "wouter";

interface PromoCode {
  id: number;
  code: string;
  discount: number;
  description: string;
  isActive: boolean;
  currentUsage: number;
  maxUsage?: number;
  userEligibility: string;
  planEligibility: string;
  expiresAt?: string;
  createdAt: string;
}

export default function EnhancedAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasAdminAccess, isLoading, isAuthenticated } = useAdminAccess();
  
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    discount: 0,
    description: '',
    maxUsage: undefined as number | undefined,
    expiresAt: undefined as string | undefined,
    userEligibility: 'everyone',
    planEligibility: 'all_plans'
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not admin
  if (!isAuthenticated || !hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
        <Card className="bg-gray-800 border-red-600 max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
              <p className="text-gray-400 mb-4">
                You don't have permission to access the admin dashboard.
              </p>
              {!isAuthenticated ? (
                <p className="text-gray-500 text-sm">
                  Please log in to continue.
                </p>
              ) : (
                <p className="text-gray-500 text-sm">
                  Administrator privileges are required to access this page.
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              {!isAuthenticated ? (
                <Link to="/auth">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Lock className="h-4 w-4 mr-2" />
                    Login to Continue
                  </Button>
                </Link>
              ) : (
                <Link to="/">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                    Return to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const createPromoCode = useMutation({
    mutationFn: async (data: typeof newPromoCode) => {
      return await apiRequest('/api/admin/promo-codes', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promo-codes'] });
      toast({
        title: "Success!",
        description: `Promo code "${newPromoCode.code}" created successfully.`,
      });
      setNewPromoCode({
        code: '',
        discount: 0,
        description: '',
        maxUsage: undefined,
        expiresAt: undefined,
        userEligibility: 'everyone',
        planEligibility: 'all_plans'
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create promo code.",
        variant: "destructive",
      });
    }
  });

  const { data: promoCodes = [] } = useQuery<PromoCode[]>({
    queryKey: ['/api/admin/promo-codes'],
    retry: false,
  });

  const handleCreatePromo = () => {
    if (!newPromoCode.code.trim() || newPromoCode.discount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createPromoCode.mutate(newPromoCode);
  };

  const getUserEligibilityDisplay = (eligibility: string) => {
    switch (eligibility) {
      case 'new_users': return { text: 'New Users Only', color: 'bg-green-500' };
      case 'existing_users': return { text: 'Existing Users Only', color: 'bg-blue-500' };
      default: return { text: 'Everyone', color: 'bg-gray-500' };
    }
  };

  const getPlanEligibilityDisplay = (eligibility: string) => {
    switch (eligibility) {
      case 'starter': return { text: 'Starter Plan', color: 'bg-emerald-500' };
      case 'professional': return { text: 'Professional Plan', color: 'bg-indigo-500' };
      case 'elite': return { text: 'Elite Plan', color: 'bg-purple-500' };
      default: return { text: 'All Plans', color: 'bg-gray-500' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
            Enhanced Admin Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Advanced promo code management with user and plan targeting
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Tag className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {promoCodes.filter(p => p.isActive).length}
                  </p>
                  <p className="text-gray-400 text-sm">Active Codes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {promoCodes.reduce((sum, p) => sum + p.currentUsage, 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Total Usage</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {promoCodes.filter(p => p.userEligibility !== 'everyone').length}
                  </p>
                  <p className="text-gray-400 text-sm">Targeted Codes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {promoCodes.filter(p => p.planEligibility !== 'all_plans').length}
                  </p>
                  <p className="text-gray-400 text-sm">Plan-Specific</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create New Promo Code */}
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Targeted Promo Code
            </CardTitle>
            <CardDescription className="text-gray-400">
              Create promotional codes with specific user and plan targeting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Promo Code *
                </label>
                <Input
                  placeholder="e.g., NEWUSER50"
                  value={newPromoCode.code}
                  onChange={(e) => setNewPromoCode(prev => ({ 
                    ...prev, 
                    code: e.target.value.toUpperCase() 
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discount % *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g., 50"
                  value={newPromoCode.discount || ''}
                  onChange={(e) => setNewPromoCode(prev => ({ 
                    ...prev, 
                    discount: parseInt(e.target.value) || 0
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Usage
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={newPromoCode.maxUsage || ''}
                  onChange={(e) => setNewPromoCode(prev => ({ 
                    ...prev, 
                    maxUsage: parseInt(e.target.value) || undefined
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <Input
                placeholder="e.g., Special discount for new traders"
                value={newPromoCode.description}
                onChange={(e) => setNewPromoCode(prev => ({ 
                  ...prev, 
                  description: e.target.value
                }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Targeting Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <UserCheck className="h-4 w-4 inline mr-1" />
                  User Eligibility
                </label>
                <select
                  value={newPromoCode.userEligibility}
                  onChange={(e) => setNewPromoCode({...newPromoCode, userEligibility: e.target.value})}
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
                >
                  <option value="everyone">Everyone</option>
                  <option value="new_users">New Users Only</option>
                  <option value="existing_users">Existing Users Only</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newPromoCode.userEligibility === 'new_users' && 'Only users who haven\'t had a subscription before'}
                  {newPromoCode.userEligibility === 'existing_users' && 'Only users who have had a subscription before'}
                  {newPromoCode.userEligibility === 'everyone' && 'All users can use this code'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Target className="h-4 w-4 inline mr-1" />
                  Plan Eligibility
                </label>
                <select
                  value={newPromoCode.planEligibility}
                  onChange={(e) => setNewPromoCode({...newPromoCode, planEligibility: e.target.value})}
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
                >
                  <option value="all_plans">All Plans</option>
                  <option value="starter">Starter Plan Only ($9.99/month)</option>
                  <option value="professional">Professional Plan Only ($14.99/month)</option>
                  <option value="elite">Elite Plan Only ($24.99/month)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newPromoCode.planEligibility === 'starter' && 'Only applies to Starter plan subscriptions'}
                  {newPromoCode.planEligibility === 'professional' && 'Only applies to Professional plan subscriptions'}
                  {newPromoCode.planEligibility === 'elite' && 'Only applies to Elite plan subscriptions'}
                  {newPromoCode.planEligibility === 'all_plans' && 'Can be used with any plan'}
                </p>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expiry Date (Optional)
              </label>
              <Input
                type="date"
                value={newPromoCode.expiresAt || ''}
                onChange={(e) => setNewPromoCode({...newPromoCode, expiresAt: e.target.value || undefined})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <Button 
              onClick={handleCreatePromo}
              disabled={createPromoCode.isPending || !newPromoCode.code.trim() || newPromoCode.discount <= 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {createPromoCode.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Targeted Promo Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Promo Codes */}
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">Existing Promo Codes</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your targeted promotional campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {promoCodes.map((promo) => {
                const userElig = getUserEligibilityDisplay(promo.userEligibility);
                const planElig = getPlanEligibilityDisplay(promo.planEligibility);
                
                return (
                  <div key={promo.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-bold text-white">{promo.code}</h3>
                        <p className="text-gray-400 text-sm">{promo.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={`${userElig.color} text-white text-xs`}>
                            {userElig.text}
                          </Badge>
                          <Badge className={`${planElig.color} text-white text-xs`}>
                            {planElig.text}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-green-400 font-bold">{promo.discount}% OFF</p>
                        <p className="text-gray-400 text-sm">
                          {promo.currentUsage}{promo.maxUsage ? `/${promo.maxUsage}` : ''} uses
                        </p>
                      </div>
                      <Badge className={promo.isActive ? "bg-green-500" : "bg-red-500"}>
                        {promo.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              
              {promoCodes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No promo codes created yet. Create your first targeted promotional campaign above!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}