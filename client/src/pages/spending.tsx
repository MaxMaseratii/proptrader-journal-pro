import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { type Account, type Spending as SpendingRecord, type BudgetCategory, type BudgetPlan } from "@shared/schema";
import SpendingEntry from "@/components/spending-entry";
import { 
  CreditCard, 
  DollarSign, 
  TrendingDown, 
  TrendingUp,
  PieChart,
  Calendar,
  ShoppingCart,
  Coffee,
  Car,
  Home,
  Monitor,
  Plus,
  Wallet,
  Target,
  AlertTriangle,
  Settings,
  Edit3,
  Trash2,
  Save,
  X,
  Upload,
  Camera,
  FileImage
} from 'lucide-react';

const Spending = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("monthly");

  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: '',
    description: '',
    type: 'trading', // trading or personal
    receiptImage: null as File | null
  });

  const [budgetSetup, setBudgetSetup] = useState({
    totalBudget: '',
    tradingBudget: '',
    personalBudget: '',
    period: 'monthly'
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: spendingRecords = [], isLoading: spendingLoading } = useQuery<SpendingRecord[]>({
    queryKey: ["/api/spending"],
  });

  const { data: budgetCategories = [], isLoading: categoriesLoading } = useQuery<BudgetCategory[]>({
    queryKey: ["/api/budget-categories"],
  });

  const { data: activeBudgetPlan, isLoading: planLoading } = useQuery<BudgetPlan>({
    queryKey: ["/api/budget-plan"],
  });

  // Mutations
  const addExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      return await apiRequest("/api/spending", "POST", expenseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spending"] });
      setNewExpense({ amount: '', category: '', description: '', type: 'trading', receiptImage: null });
      toast({ title: "Expense Added", description: "Your expense has been recorded successfully." });
    },
  });

  const createBudgetPlanMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      return await apiRequest("/api/budget-plan", "POST", budgetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget-plan"] });
      setBudgetSetup({ totalBudget: '', tradingBudget: '', personalBudget: '', period: 'monthly' });
      toast({ title: "Budget Plan Created", description: "Your budget plan has been created successfully." });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return await apiRequest("/api/budget-categories", "POST", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget-categories"] });
      setNewCategoryName("");
      toast({ title: "Category Created", description: "New budget category has been created." });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return await apiRequest(`/api/budget-categories/${categoryData.id}`, "PATCH", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget-categories"] });
      setEditingCategory(null);
      toast({ title: "Category Updated", description: "Budget category has been updated." });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return await apiRequest(`/api/budget-categories/${categoryId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget-categories"] });
      toast({ title: "Category Deleted", description: "Budget category has been deleted." });
    },
  });

  if (accountsLoading || spendingLoading || categoriesLoading || planLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-96 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Filter data based on selections
  const filteredAccounts = selectedAccountId === "all" 
    ? accounts 
    : accounts.filter(account => account.id === parseInt(selectedAccountId));
  
  const filteredSpendingRecords = selectedAccountId === "all" 
    ? spendingRecords 
    : spendingRecords.filter(record => record.accountId === parseInt(selectedAccountId));

  // Calculate account-based costs (prop trading costs)
  const totalAccountCosts = filteredAccounts.reduce((sum, account) => sum + (account.accountCost || 0), 0);
  const totalActivationCosts = filteredAccounts.reduce((sum, account) => sum + (account.activationCost || 0), 0);
  const totalResetCosts = filteredAccounts.reduce((sum, account) => sum + (account.totalResetsCost || 0), 0);
  const totalPropTradingCosts = totalAccountCosts + totalActivationCosts + totalResetCosts;
  
  // Calculate manual spending entries
  const totalManualSpending = filteredSpendingRecords.reduce((sum, record) => sum + record.amount, 0);
  const spendingByCategory = filteredSpendingRecords.reduce((acc, record) => {
    const categoryName = record.category || 'Other';
    acc[categoryName] = (acc[categoryName] || 0) + record.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Total spending across all sources
  const totalSpending = totalPropTradingCosts + totalManualSpending;

  // Budget calculations
  const currentBudget = activeBudgetPlan?.totalBudget || 0;
  const tradingBudget = activeBudgetPlan?.tradingBudget || 0;
  const personalBudget = activeBudgetPlan?.personalBudget || 0;
  const budgetUsagePercentage = currentBudget > 0 ? (totalSpending / currentBudget) * 100 : 0;
  const remainingBudget = currentBudget - totalSpending;

  // Category-specific calculations
  const tradingCategories = budgetCategories.filter(cat => cat.type === 'trading' && cat.isActive);
  const personalCategories = budgetCategories.filter(cat => cat.type === 'personal' && cat.isActive);

  // Default trading expense categories for prop trading
  const defaultTradingExpenses = [
    { name: 'Prop Account Purchases', amount: totalAccountCosts, icon: 'CreditCard' },
    { name: 'Account Activations', amount: totalActivationCosts, icon: 'Target' },
    { name: 'Account Resets', amount: totalResetCosts, icon: 'AlertTriangle' },
  ];

  // Helper functions
  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.description) return;
    
    const expenseData = {
      accountId: selectedAccountId === "all" ? (accounts[0]?.id || 1) : parseInt(selectedAccountId),
      amount: parseFloat(newExpense.amount),
      spendingType: newExpense.category,
      description: newExpense.description,
      date: new Date().toISOString().split('T')[0],
      category: newExpense.category
    };

    addExpenseMutation.mutate(expenseData);
  };

  const handleCreateBudgetPlan = () => {
    if (!budgetSetup.totalBudget || !budgetSetup.tradingBudget || !budgetSetup.personalBudget) return;
    
    const planData = {
      userId: user?.id,
      name: `${budgetSetup.period.charAt(0).toUpperCase() + budgetSetup.period.slice(1)} Budget Plan`,
      budgetPeriod: budgetSetup.period,
      totalBudget: parseFloat(budgetSetup.totalBudget),
      tradingBudget: parseFloat(budgetSetup.tradingBudget),
      personalBudget: parseFloat(budgetSetup.personalBudget),
      startDate: new Date().toISOString().split('T')[0],
      endDate: getEndDate(budgetSetup.period),
      isActive: true
    };

    createBudgetPlanMutation.mutate(planData);
  };

  const handleCreateCategory = (type: 'trading' | 'personal') => {
    if (!newCategoryName) return;
    
    const categoryData = {
      userId: user?.id,
      name: newCategoryName,
      type,
      budgetAmount: 0,
      isActive: true
    };

    createCategoryMutation.mutate(categoryData);
  };

  const getEndDate = (period: string) => {
    const now = new Date();
    switch (period) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      case 'yearly':
        return new Date(now.getFullYear() + 1, 0, 0).toISOString().split('T')[0];
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }
  };

  // Recent expenses (last 10)
  const recentExpenses = filteredSpendingRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Budget Planner & Spending Tracker</h1>
            <p className="text-gray-400">Comprehensive prop trading and personal expense management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 bg-gray-800 border-yellow-400/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-yellow-400/20">
                <SelectItem value="weekly" className="text-white hover:bg-gray-700">Weekly</SelectItem>
                <SelectItem value="monthly" className="text-white hover:bg-gray-700">Monthly</SelectItem>
                <SelectItem value="yearly" className="text-white hover:bg-gray-700">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="w-64 bg-gray-800 border-yellow-400/20 text-white">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-yellow-400/20">
                <SelectItem value="all" className="text-white hover:bg-gray-700">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem 
                    key={account.id} 
                    value={account.id.toString()} 
                    className="text-white hover:bg-gray-700"
                  >
                    {account.name} ({account.type} - {account.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Budget Setup Section */}
      {!activeBudgetPlan && (
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5 text-yellow-400" />
                  Set Up Your Budget Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Budget Period</Label>
                    <Select value={budgetSetup.period} onValueChange={(value) => setBudgetSetup({...budgetSetup, period: value})}>
                      <SelectTrigger className="bg-gray-800 border-yellow-400/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-yellow-400/20">
                        <SelectItem value="weekly" className="text-white hover:bg-gray-700">Weekly</SelectItem>
                        <SelectItem value="monthly" className="text-white hover:bg-gray-700">Monthly</SelectItem>
                        <SelectItem value="yearly" className="text-white hover:bg-gray-700">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Total Budget</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={budgetSetup.totalBudget}
                      onChange={(e) => setBudgetSetup({...budgetSetup, totalBudget: e.target.value})}
                      className="bg-gray-800 border-yellow-400/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Trading Budget</Label>
                    <Input
                      type="number"
                      placeholder="3000"
                      value={budgetSetup.tradingBudget}
                      onChange={(e) => setBudgetSetup({...budgetSetup, tradingBudget: e.target.value})}
                      className="bg-gray-800 border-yellow-400/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Personal Budget</Label>
                    <Input
                      type="number"
                      placeholder="2000"
                      value={budgetSetup.personalBudget}
                      onChange={(e) => setBudgetSetup({...budgetSetup, personalBudget: e.target.value})}
                      className="bg-gray-800 border-yellow-400/20 text-white"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCreateBudgetPlan}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                  disabled={!budgetSetup.totalBudget || !budgetSetup.tradingBudget || !budgetSetup.personalBudget || createBudgetPlanMutation.isPending}
                >
                  {createBudgetPlanMutation.isPending ? "Creating..." : "Create Budget Plan"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Budget Overview Cards */}
          {activeBudgetPlan && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Spending</CardTitle>
                    <CreditCard className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-400">{formatCurrency(totalSpending)}</div>
                    <p className="text-xs text-gray-400">of {formatCurrency(currentBudget)} budget</p>
                    <Progress value={Math.min(budgetUsagePercentage, 100)} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Trading Expenses</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">{formatCurrency(totalPropTradingCosts)}</div>
                    <p className="text-xs text-gray-400">of {formatCurrency(tradingBudget)} budget</p>
                    <Progress value={Math.min((totalPropTradingCosts / tradingBudget) * 100, 100)} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Personal Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-500">{formatCurrency(totalManualSpending)}</div>
                    <p className="text-xs text-gray-400">of {formatCurrency(personalBudget)} budget</p>
                    <Progress value={Math.min((totalManualSpending / personalBudget) * 100, 100)} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Remaining Budget</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(remainingBudget)}
                    </div>
                    <p className="text-xs text-gray-400">Available this {selectedPeriod.slice(0, -2)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Prop Trading Expense Breakdown */}
              <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <PieChart className="h-5 w-5 text-yellow-400" />
                    Prop Trading Expenses Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {defaultTradingExpenses.map((expense, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              {expense.icon === 'CreditCard' && <CreditCard className="h-4 w-4 text-blue-500" />}
                              {expense.icon === 'Target' && <Target className="h-4 w-4 text-blue-500" />}
                              {expense.icon === 'AlertTriangle' && <AlertTriangle className="h-4 w-4 text-blue-500" />}
                            </div>
                            <span className="font-medium text-white">{expense.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-white">{formatCurrency(expense.amount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

      {/* Category Management Section */}
      <div className="space-y-6">
          {/* Trading Categories */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Trading Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Add trading category..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-gray-800 border-yellow-400/20 text-white"
                />
                <Button 
                  onClick={() => handleCreateCategory('trading')}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700"
                  disabled={!newCategoryName || createCategoryMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {tradingCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-blue-500" />
                      {editingCategory?.id === category.id ? (
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                          className="bg-gray-700 border-yellow-400/20 text-white"
                        />
                      ) : (
                        <span className="font-medium text-white">{category.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingCategory?.id === category.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateCategoryMutation.mutate(editingCategory)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={updateCategoryMutation.isPending}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCategory(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
                            disabled={deleteCategoryMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Categories */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                Personal Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Add personal category..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-gray-800 border-yellow-400/20 text-white"
                />
                <Button 
                  onClick={() => handleCreateCategory('personal')}
                  className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700"
                  disabled={!newCategoryName || createCategoryMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {personalCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center gap-3">
                      <Coffee className="h-5 w-5 text-orange-500" />
                      {editingCategory?.id === category.id ? (
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                          className="bg-gray-700 border-yellow-400/20 text-white"
                        />
                      ) : (
                        <span className="font-medium text-white">{category.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingCategory?.id === category.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateCategoryMutation.mutate(editingCategory)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={updateCategoryMutation.isPending}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCategory(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
                            disabled={deleteCategoryMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Add New Expense Section */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Plus className="h-5 w-5 text-yellow-400" />
              Add New Expense
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="bg-gray-800 border-yellow-400/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">Category</Label>
                <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                  <SelectTrigger className="bg-gray-800 border-yellow-400/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-yellow-400/20">
                    {[...tradingCategories, ...personalCategories].map((category) => (
                      <SelectItem key={category.id} value={category.name} className="text-white hover:bg-gray-700">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                placeholder="What did you spend money on?"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                className="bg-gray-800 border-yellow-400/20 text-white"
              />
            </div>

            {/* Receipt Upload Section */}
            <div className="space-y-2">
              <Label className="text-white">Receipt Upload (Optional)</Label>
              <div className="border-2 border-dashed border-yellow-400/30 rounded-lg p-6 text-center hover:border-yellow-400/50 transition-colors">
                <input
                  type="file"
                  id="receipt"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewExpense({...newExpense, receiptImage: file});
                  }}
                  className="hidden"
                />
                <label htmlFor="receipt" className="cursor-pointer">
                  {newExpense.receiptImage ? (
                    <div className="space-y-2">
                      <FileImage className="h-8 w-8 text-green-400 mx-auto" />
                      <p className="text-green-400 font-medium">{newExpense.receiptImage.name}</p>
                      <p className="text-sm text-gray-400">Click to change receipt</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-8 w-8 text-yellow-400 mx-auto" />
                      <p className="text-yellow-400 font-medium">Upload Receipt</p>
                      <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
              {newExpense.receiptImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewExpense({...newExpense, receiptImage: null})}
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Receipt
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white">Expense Type</Label>
              <div className="flex gap-4">
                <Button
                  variant={newExpense.type === 'trading' ? 'default' : 'outline'}
                  onClick={() => setNewExpense({...newExpense, type: 'trading'})}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                >
                  Trading Related
                </Button>
                <Button
                  variant={newExpense.type === 'personal' ? 'default' : 'outline'}
                  onClick={() => setNewExpense({...newExpense, type: 'personal'})}
                  className="flex-1 border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10"
                >
                  Personal
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleAddExpense}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
              disabled={!newExpense.amount || !newExpense.category || !newExpense.description || addExpenseMutation.isPending}
            >
              {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </CardContent>
      </Card>

      {/* Expense History Section */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-yellow-400" />
              Expense History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${expense.spendingType.includes('trading') || expense.spendingType.includes('account') ? 'bg-blue-500' : 'bg-orange-500'}`} />
                      <div>
                        <div className="font-medium text-white">{expense.description}</div>
                        <div className="text-sm text-gray-400">{expense.date} • {expense.category || expense.spendingType.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-400">-{formatCurrency(expense.amount)}</div>
                      <Badge variant="outline" className={`text-xs ${expense.spendingType.includes('trading') || expense.spendingType.includes('account') ? 'border-blue-500 text-blue-500' : 'border-orange-500 text-orange-500'}`}>
                        {expense.spendingType.includes('trading') || expense.spendingType.includes('account') ? 'trading' : 'personal'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No expenses recorded yet</p>
                  <p className="text-sm text-gray-500">Add your first expense to start tracking</p>
                </div>
              )}
            </div>
          </CardContent>
      </Card>

      {/* Legacy Spending Entry Component */}
      <SpendingEntry accounts={accounts} />
    </div>
  );
};

export default Spending;