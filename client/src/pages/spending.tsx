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
import { getUniversalValueColor, getPercentageColor, getStatusColor } from "@/lib/colorUtils";
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

// UNIVERSAL COLOR CODING SYSTEM - Applied across entire project
const getValueColor = (value: number, context: 'profit' | 'expense' | 'budget' | 'roi' | 'balance' | 'pnl' | 'drawdown' | 'risk' = 'pnl') => {
  const colorResult = getUniversalValueColor(value, context);
  return colorResult.textColor;
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
      
      <div className={`relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border ${statusInfo.borderColor} rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 group-hover:scale-[1.02] backdrop-blur-sm`}>
        
        {/* Header with Icon and Status Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${statusInfo.bgGradient} border ${statusInfo.borderColor}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <h3 className="text-gray-100 font-semibold text-lg">{title}</h3>
          </div>
          
          {/* Status Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.bgGradient} ${statusInfo.textColor} border ${statusInfo.borderColor} flex items-center gap-1.5`}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.status}
          </div>
        </div>

        {/* Main Amount Display */}
        <div className="text-center mb-6">
          <div className={`text-4xl font-bold mb-2 ${getUniversalValueColor(-spent, 'expense').textColor}`}>
            {formatCurrency(spent)}
          </div>
          <p className="text-gray-400 text-sm">
            of {formatCurrency(total)} {category}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <div className="w-full bg-gray-700/50 rounded-full h-3 shadow-inner overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${statusInfo.progressGradient} rounded-full transition-all duration-700 ease-out shadow-lg relative`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
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
            <span className={`${getUniversalValueColor(remaining, remaining >= 0 ? 'profit' : 'expense').textColor}`}>
              {remaining >= 0 ? formatCurrency(remaining) : formatCurrency(Math.abs(remaining))} 
              {remaining >= 0 ? ' remaining' : ' over budget'}
            </span>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Spent</div>
            <div style={{color: '#ef4444'}} className="text-lg font-semibold">
              {formatCurrency(spent)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {remaining >= 0 ? 'Available' : 'Overspent'}
            </div>
            <div className={`text-lg font-semibold ${remaining >= 0 ? 'style={{color: "#22c55e"}}' : 'style={{color: "#ef4444"}}'}`}>
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
            <CardHeader>
              <CardTitle className="text-gray-100">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getUniversalValueColor(-totalAccountCosts, 'expense').textColor}`}>
                {formatCurrency(totalAccountCosts)}
              </div>
              <p className="text-xs text-gray-400">Challenge purchase costs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-100">Additional Costs</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getUniversalValueColor(-(totalActivationCosts + totalResetCosts), 'expense').textColor}`}>
                {formatCurrency(totalActivationCosts + totalResetCosts)}
              </div>
              <p className="text-xs text-gray-400">Activations & resets</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-100">Total Payouts</CardTitle>
              <DollarSign className={`h-4 w-4 ${getUniversalValueColor(totalPayoutsReceived, 'profit').textColor}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getUniversalValueColor(totalPayoutsReceived, 'profit').textColor}`}>
                {formatCurrency(totalPayoutsReceived)}
              </div>
              <p className="text-xs text-gray-400">From payout page</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-100">Net ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getUniversalValueColor(actualProfitability, 'pnl').textColor}`}>
                {formatCurrency(actualProfitability)}
              </div>
              <p className="text-xs text-gray-400">Payouts - total costs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-100">ROI Percentage</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getUniversalValueColor(actualProfitability, 'pnl').textColor}`}>
                {totalPropTradingCosts > 0 ? ((actualProfitability / totalPropTradingCosts) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-gray-400">Return on investment</p>
            </CardContent>
          </Card>
        </div>

        {/* PROFESSIONAL BUDGET WIDGETS SECTION */}
        {activeBudgetPlan && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100">Budget Overview</h2>
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

        {/* ADD CATEGORY FUNCTIONALITY */}
        {showAddCategory && (
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-100">Add New Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryName" className="text-gray-200">Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder="Enter category name..."
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-gray-100"
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
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div>
                <Label className="text-gray-200">Type</Label>
                <Select value={newCategory.type} onValueChange={(value: 'trading' | 'personal') => setNewCategory({...newCategory, type: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
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
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Create Category
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddCategory(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Category
        </Button>

        {/* PROFESSIONAL EXPENSE CATEGORIES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trading Expenses */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Trading Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {defaultTradingExpenses.map((expense, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-gray-200">{expense.name}</span>
                    </div>
                    <span className={`font-semibold ${getUniversalValueColor(-expense.amount, 'expense').textColor}`}>
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-100">Total Trading Expenses</span>
                    <span className={`text-lg ${getUniversalValueColor(-totalPropTradingCosts, 'expense').textColor}`}>
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
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-400" />
                Personal Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(spendingByCategory).length > 0 ? (
                  Object.entries(spendingByCategory).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-gray-200">{category}</span>
                      </div>
                      <span className={`font-semibold ${getUniversalValueColor(-amount, 'expense').textColor}`}>
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No personal expenses recorded yet</p>
                )}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-100">Total Personal Expenses</span>
                    <span className={`text-lg ${getUniversalValueColor(-totalManualSpending, 'expense').textColor}`}>
                      {formatCurrency(totalManualSpending)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QUICK ADD EXPENSE */}
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-100">Quick Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="amount" className="text-gray-200">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-gray-200">Category</Label>
                <Input
                  id="category"
                  placeholder="Category name"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-200">Description</Label>
                <Input
                  id="description"
                  placeholder="What was this for?"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddExpense}
                  disabled={addExpenseMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {addExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};

export default Spending;