import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Tag, Users, DollarSign, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  description: string;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  expiresAt?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    discount: 0,
    description: '',
    maxUsage: undefined as number | undefined,
    expiresAt: undefined as string | undefined
  });

  // Mock data for now - in real app this would come from API
  const mockPromoCodes: PromoCode[] = [
    {
      id: '1',
      code: 'LAUNCH50',
      discount: 0.50,
      description: '50% off launch special',
      isActive: true,
      usageCount: 145,
      maxUsage: 500,
      expiresAt: '2025-12-31',
      createdAt: '2025-01-01'
    },
    {
      id: '2',
      code: 'WELCOME25',
      discount: 0.25,
      description: '25% off welcome bonus',
      isActive: true,
      usageCount: 89,
      maxUsage: 200,
      createdAt: '2025-01-15'
    },
    {
      id: '3',
      code: 'TRADER15',
      discount: 0.15,
      description: '15% off for traders',
      isActive: true,
      usageCount: 234,
      createdAt: '2025-01-20'
    },
    {
      id: '4',
      code: 'PROPTRADER',
      discount: 0.30,
      description: '30% off for prop traders',
      isActive: false,
      usageCount: 67,
      maxUsage: 100,
      createdAt: '2025-01-10'
    }
  ];

  const handleCreatePromoCode = () => {
    if (!newPromoCode.code || !newPromoCode.description || newPromoCode.discount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    // In real app, this would make an API call
    toast({
      title: "Promo Code Created",
      description: `Successfully created promo code "${newPromoCode.code}"`,
    });

    setNewPromoCode({
      code: '',
      discount: 0,
      description: '',
      maxUsage: undefined,
      expiresAt: undefined
    });
  };

  const handleToggleActive = (promoId: string) => {
    // In real app, this would make an API call
    toast({
      title: "Status Updated",
      description: "Promo code status has been updated.",
    });
  };

  const handleDeletePromo = (promoId: string, promoCode: string) => {
    if (confirm(`Are you sure you want to delete promo code "${promoCode}"?`)) {
      // In real app, this would make an API call
      toast({
        title: "Promo Code Deleted",
        description: `Successfully deleted promo code "${promoCode}"`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Manage promo codes, discounts, and campaign settings
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
                    {mockPromoCodes.filter(p => p.isActive).length}
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
                    {mockPromoCodes.reduce((sum, p) => sum + p.usageCount, 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Total Usage</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    ${(mockPromoCodes.reduce((sum, p) => sum + (p.usageCount * p.discount * 15), 0)).toFixed(0)}
                  </p>
                  <p className="text-gray-400 text-sm">Total Savings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Settings className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {((mockPromoCodes.filter(p => p.isActive).length / mockPromoCodes.length) * 100).toFixed(0)}%
                  </p>
                  <p className="text-gray-400 text-sm">Active Rate</p>
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
              Create New Promo Code
            </CardTitle>
            <CardDescription className="text-gray-400">
              Add a new promotional discount code for users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Promo Code *
                </label>
                <Input
                  placeholder="e.g., SUMMER30"
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
                  placeholder="e.g., 30"
                  value={newPromoCode.discount * 100 || ''}
                  onChange={(e) => setNewPromoCode(prev => ({ 
                    ...prev, 
                    discount: parseInt(e.target.value) / 100 || 0
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Usage (Optional)
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g., 500"
                  value={newPromoCode.maxUsage || ''}
                  onChange={(e) => setNewPromoCode(prev => ({ 
                    ...prev, 
                    maxUsage: parseInt(e.target.value) || undefined
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expires At (Optional)
                </label>
                <Input
                  type="date"
                  value={newPromoCode.expiresAt || ''}
                  onChange={(e) => setNewPromoCode(prev => ({ 
                    ...prev, 
                    expiresAt: e.target.value || undefined
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <Input
                placeholder="e.g., Summer special discount"
                value={newPromoCode.description}
                onChange={(e) => setNewPromoCode(prev => ({ 
                  ...prev, 
                  description: e.target.value
                }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button 
              onClick={handleCreatePromoCode}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Promo Code
            </Button>
          </CardContent>
        </Card>

        {/* Existing Promo Codes */}
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Existing Promo Codes
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your current promotional discount codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPromoCodes.map((promo) => (
                <div key={promo.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{promo.code}</h3>
                        <Badge variant={promo.isActive ? "default" : "secondary"}>
                          {promo.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="border-yellow-600 text-yellow-400">
                          {(promo.discount * 100).toFixed(0)}% OFF
                        </Badge>
                      </div>
                      <p className="text-gray-300">{promo.description}</p>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>Used: {promo.usageCount}{promo.maxUsage ? ` / ${promo.maxUsage}` : ''}</span>
                        <span>Created: {new Date(promo.createdAt).toLocaleDateString()}</span>
                        {promo.expiresAt && (
                          <span>Expires: {new Date(promo.expiresAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(promo.id)}
                        className="border-gray-600 text-gray-300"
                      >
                        {promo.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => handleDeletePromo(promo.id, promo.code)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}