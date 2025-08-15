import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { type Account, type Spending as SpendingRecord, type BudgetCategory, type BudgetPlan } from "@shared/schema";
import { 
  CreditCard, 
  DollarSign, 
  TrendingDown, 
  TrendingUp,
  ShoppingCart,
  Plus,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Professional color coding utility function
const getValueColor = (value: number, isExpense: boolean = false) => {
  if (value === 0) return 'text-gray-400';
  
  if (isExpense) {
    // For expenses/costs (always negative impact)
    return 'text-red-400'; // All expenses are RED
  } else {
    // For profits/gains/income
    if (value > 0) return 'text-green-400'; // Positive = GREEN
    if (value < 0) return 'text-red-400';   // Negative = RED
  }
  return 'text-gray-400';
};

// Professional Budget Widget Component
const BudgetWidget = ({ title, icon: Icon, spent, total, iconColor, category }: {
  title: string;
  icon: any;
  spent: number;
  total: number;
  iconColor: string;
  category: string;
}) => {
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const remaining = total - spent;
  
  // Status determination
  const getStatusInfo = (percentage: number) => {
    if (percentage <= 50) return {
      status: 'On Track', color: 'green', icon: CheckCircle,
      bgGradient: 'from-green-500/20 to-emerald-600/20',
      progressGradient: 'from-green-400 to-emerald-500',
      borderColor: 'border-green-400/30',
      textColor: 'text-green-400'
    };
    if (percentage <= 80) return {
      status: 'Monitor', color: 'yellow', icon: Target,
      bgGradient: 'from-yellow-500/20 to-amber-600/20',
      progressGradient: 'from-yellow-400 to-amber-500',
      borderColor: 'border-yellow-400/30',
      textColor: 'text-yellow-400'
    };
    if (percentage < 100) return {
      status: 'Caution', color: 'orange', icon: AlertTriangle,
      bgGradient: 'from-orange-500/20 to-red-600/20',
      progressGradient: 'from-orange-400 to-red-500',
      borderColor: 'border-orange-400/30',
      textColor: 'text-orange-400'
    };
    return {
      status: 'Over Budget', color: 'red', icon: AlertTriangle,
      bgGradient: 'from-red-500/20 to-rose-600/20',
      progressGradient: 'from-red-400 to-rose-500',
      borderColor: 'border-red-400/30',
      textColor: 'text-red-400'
    };
  };

  const statusInfo = getStatusInfo(percentage);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${statusInfo.progressGradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
      
      <div className="budget-widget">
        
        {/* Header with Icon and Status Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${statusInfo.bgGradient} border ${statusInfo.borderColor}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <h3 className="text-gray-100 font-semibold text-lg">{title}</h3>
          </div>
          
          {/* Status Badge */}
          <div className={`status-badge ${percentage <= 50 ? 'status-badge-success' : percentage <= 80 ? 'status-badge-warning' : 'status-badge-danger'}`}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.status}
          </div>
        </div>

        {/* Main Amount Display */}
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold mb-2 ${spent > total ? 'text-red-400' : 'text-gray-100'}`}>
            {formatCurrency(spent)}
          </div>
          <p className="text-gray-400 text-sm">
            of {formatCurrency(total)} {category}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <div className="animated-progress">
              <div 
                className={`animated-progress-fill bg-gradient-to-r ${statusInfo.progressGradient}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
              </div>
            </div>
            
            {/* Over-budget indicator */}
            {percentage > 100 && (
              <div className="absolute right-0 top-0 transform translate-x-2 -translate-y-1">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Labels */}
          <div className="flex justify-between items-center text-sm">
            <span className={`font-medium ${statusInfo.textColor}`}>
              {percentage.toFixed(1)}% used
            </span>
            <span className={`${remaining >= 0 ? 'text-gray-400' : 'text-red-400'}`}>
              {remaining >= 0 ? formatCurrency(remaining) : formatCurrency(Math.abs(remaining))} 
              {remaining >= 0 ? ' remaining' : ' over budget'}
            </span>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Spent</div>
            <div className="text-lg font-semibold text-red-400">
              {formatCurrency(spent)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {remaining >= 0 ? 'Available' : 'Overspent'}
            </div>
            <div className={`text-lg font-semibold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(Math.abs(remaining))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Spending = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("monthly");
  const [showAddCategory, setShowAddCategory] = useState(false);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    emoji: '📊',
    budgetAmount: '',
    type: 'trading' as 'trading' | 'personal'
  });

  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: '',
    description: '',
    type: 'trading' as 'trading' | 'personal',
    receiptImage: null as File | null
  });
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

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

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return await apiRequest("/api/budget-categories", "POST", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget-categories"] });
      setNewCategory({ name: '', emoji: '📊', budgetAmount: '', type: 'trading' });
      toast({ title: "Category Created", description: "New budget category has been created." });
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

  // CORRECT CALCULATION: Calculate account-based costs using accountCost field
  const totalAccountCosts = filteredAccounts.reduce((sum, account) => {
    const accountPurchaseCost = account.accountCost || 0;
    return sum + accountPurchaseCost;
  }, 0);
  
  const totalActivationCosts = filteredAccounts.reduce((sum, account) => sum + (account.activationCost || 0), 0);
  const totalResetCosts = 0; // Will be implemented when reset tracking is added
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

  // Calculate actual profitability based on payouts (to be linked to payout records)
  const totalPayoutsReceived = 0; // Will be linked to actual payout records
  const actualProfitability = totalPayoutsReceived - totalPropTradingCosts;

  // Budget calculations
  const currentBudget = activeBudgetPlan?.totalBudget || 0;
  const tradingBudget = activeBudgetPlan?.tradingBudget || 0;
  const personalBudget = activeBudgetPlan?.personalBudget || 0;

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
      spendingType: 'other',
      description: newExpense.description,
      paymentMethod: 'credit_card',
      date: new Date().toISOString().split('T')[0],
      category: newExpense.category,
      isRecurring: false
    };

    addExpenseMutation.mutate(expenseData);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Prop Firm Spending
              </h1>
              <p className="text-gray-400 mt-2">Comprehensive prop trading and personal expense management</p>
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

        {/* PROFESSIONAL INVESTMENT SUMMARY - UPDATED WITH CORRECT COLORS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-white">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {formatCurrency(totalAccountCosts)}
              </div>
              <p className="text-xs text-gray-400">Challenge purchase costs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-white">Additional Costs</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {formatCurrency(totalActivationCosts + totalResetCosts)}
              </div>
              <p className="text-xs text-gray-400">Activations & resets</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-white">Total Payouts</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(totalPayoutsReceived)}
              </div>
              <p className="text-xs text-gray-400">From payout records</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-white">Net ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${actualProfitability >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(actualProfitability)}
              </div>
              <p className="text-xs text-gray-400">Payouts - total costs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-white">ROI Percentage</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${actualProfitability >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalAccountCosts > 0 ? ((actualProfitability / totalAccountCosts) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-gray-400">Return on investment</p>
            </CardContent>
          </Card>
        </div>

        {/* PROFESSIONAL BUDGET OVERVIEW WITH ENHANCED WIDGETS */}
        {activeBudgetPlan && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Budget Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BudgetWidget
                title="Monthly Budget"
                icon={CreditCard}
                spent={totalSpending}
                total={currentBudget}
                iconColor="text-yellow-400"
                category="total budget"
              />
              <BudgetWidget
                title="Trading Budget"
                icon={TrendingUp}
                spent={totalPropTradingCosts}
                total={tradingBudget}
                iconColor="text-blue-400"
                category="trading budget"
              />
              <BudgetWidget
                title="Personal Budget"
                icon={TrendingDown}
                spent={totalManualSpending}
                total={personalBudget}
                iconColor="text-orange-400"
                category="personal budget"
              />
            </div>
          </div>
        )}

        {/* CATEGORY MANAGEMENT SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Budget Categories
            </h2>
            <Button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Add Category Form */}
          {showAddCategory && (
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Create New Budget Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-gray-200">Emoji</Label>
                    <Select value={newCategory.emoji} onValueChange={(value) => setNewCategory({...newCategory, emoji: value})}>
                      <SelectTrigger className="bg-gray-800 border-yellow-400/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-yellow-400/20">
                        {['📊', '💰', '🏠', '🍔', '🚗', '💳', '📱', '🎯', '⚡', '🔥'].map(emoji => (
                          <SelectItem key={emoji} value={emoji} className="text-white hover:bg-gray-700">
                            {emoji}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="categoryName" className="text-gray-200">Category Name</Label>
                    <Input
                      id="categoryName"
                      placeholder="e.g., Education, Software"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="bg-gray-800 border-yellow-400/20 text-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetAmount" className="text-gray-200">Budget Amount</Label>
                    <Input
                      id="budgetAmount"
                      type="number"
                      placeholder="0.00"
                      value={newCategory.budgetAmount}
                      onChange={(e) => setNewCategory({...newCategory, budgetAmount: e.target.value})}
                      className="bg-gray-800 border-yellow-400/20 text-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200">Type</Label>
                    <Select value={newCategory.type} onValueChange={(value: 'trading' | 'personal') => setNewCategory({...newCategory, type: value})}>
                      <SelectTrigger className="bg-gray-800 border-yellow-400/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-yellow-400/20">
                        <SelectItem value="trading" className="text-white hover:bg-gray-700">Trading</SelectItem>
                        <SelectItem value="personal" className="text-white hover:bg-gray-700">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (newCategory.name && newCategory.budgetAmount) {
                        const categoryData = {
                          userId: (user as any)?.id || "",
                          name: newCategory.name,
                          type: newCategory.type,
                          emoji: newCategory.emoji,
                          budgetAmount: parseFloat(newCategory.budgetAmount),
                          isActive: true
                        };
                        createCategoryMutation.mutate(categoryData);
                        setShowAddCategory(false);
                      } else {
                        toast({ 
                          title: "Missing Information", 
                          description: "Please fill in category name and budget amount." 
                        });
                      }
                    }}
                    disabled={createCategoryMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddCategory(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Categories Display */}
          {budgetCategories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgetCategories.map((category) => {
                const categorySpending = spendingByCategory[category.name] || 0;
                return (
                  <BudgetWidget
                    key={category.id}
                    title={`${category.emoji} ${category.name}`}
                    icon={category.type === 'trading' ? TrendingUp : ShoppingCart}
                    spent={categorySpending}
                    total={category.budgetAmount}
                    iconColor={category.type === 'trading' ? 'text-blue-400' : 'text-orange-400'}
                    category={category.type}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* EXPENSE BREAKDOWN SECTION */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Expense Breakdown
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trading Expenses */}
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  Trading Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {defaultTradingExpenses.map((expense, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-gray-200">{expense.name}</span>
                      </div>
                      <span className="font-semibold text-red-400">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-white">Total Trading Expenses</span>
                      <span className="text-red-400 text-lg">
                        {formatCurrency(totalPropTradingCosts)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Expenses */}
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-orange-400" />
                  Personal Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(spendingByCategory).length > 0 ? (
                    Object.entries(spendingByCategory).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span className="text-gray-200">{category}</span>
                        </div>
                        <span className="font-semibold text-red-400">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No personal expenses recorded yet</p>
                      <p className="text-sm text-gray-500">Add your first expense below</p>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-white">Total Personal Expenses</span>
                      <span className="text-red-400 text-lg">
                        {formatCurrency(totalManualSpending)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Spending;