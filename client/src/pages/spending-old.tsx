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
  FileImage,
  RotateCcw,
  CheckCircle,
  Star,
  Zap
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
  
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [newTradingCategoryName, setNewTradingCategoryName] = useState("");
  const [newPersonalCategoryName, setNewPersonalCategoryName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📊");
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    emoji: '📊',
    budgetAmount: '',
    type: 'trading'
  });
  
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

  // Fetch trades for proper profitability calculation
  const { data: trades = [] } = useQuery({
    queryKey: ["/api/trades"],
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
      setNewCategory({ name: '', emoji: '📊', budgetAmount: '', type: 'trading' });
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

  // FIXED: Calculate account-based costs correctly (accountCost field, NOT startingBalance)
  const totalAccountCosts = filteredAccounts.reduce((sum, account) => {
    // accountCost is the actual cost to purchase the account
    // startingBalance is the account size, NOT the cost
    const accountPurchaseCost = account.accountCost || 0;
    return sum + accountPurchaseCost;
  }, 0);
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

  // FIXED: Calculate actual profitability based on payouts, not P&L
  // In prop trading, profitability = actual payouts received - total costs
  const totalPayoutsReceived = 0; // TODO: Link to actual payout records when implemented
  const actualProfitability = totalPayoutsReceived - totalPropTradingCosts;

  // Budget calculations
  const currentBudget = activeBudgetPlan?.totalBudget || 0;
  const tradingBudget = activeBudgetPlan?.tradingBudget || 0;
  const personalBudget = activeBudgetPlan?.personalBudget || 0;
  const budgetUsagePercentage = currentBudget > 0 ? (totalSpending / currentBudget) * 100 : 0;
  const remainingBudget = currentBudget - totalSpending;

  // Category-specific calculations
  const tradingCategories = budgetCategories.filter(cat => cat.type === 'trading' && cat.isActive);
  const personalCategories = budgetCategories.filter(cat => cat.type === 'personal' && cat.isActive);

  // FIXED: Debug and display account costs properly
  console.log('💳 Account Cost Debug:', {
    totalAccountCosts,
    totalActivationCosts,
    totalResetCosts,
    accountsData: filteredAccounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      accountCost: acc.accountCost,
      activationCost: acc.activationCost,
      totalResetsCost: acc.totalResetsCost,
      startingBalance: acc.startingBalance
    }))
  });

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

  const handleCreateBudgetPlan = () => {
    if (!budgetSetup.totalBudget || !budgetSetup.tradingBudget || !budgetSetup.personalBudget) return;
    
    const planData = {
      userId: (user as any)?.id || "",
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
    const categoryName = type === 'trading' ? newTradingCategoryName : newPersonalCategoryName;
    if (!categoryName) return;
    
    const categoryData = {
      userId: (user as any)?.id || "",
      name: categoryName,
      type,
      emoji: selectedEmoji,
      icon: selectedEmoji,
      budgetAmount: 0,
      isActive: true
    };

    createCategoryMutation.mutate(categoryData);
    
    // Clear the appropriate field
    if (type === 'trading') {
      setNewTradingCategoryName("");
    } else {
      setNewPersonalCategoryName("");
    }
    setSelectedEmoji("📊");
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
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient-rainbow">
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
            <div className="text-2xl font-bold text-red-400">
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
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(totalActivationCosts + totalResetCosts)}
            </div>
            <p className="text-xs text-gray-400">Activations & resets</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-100">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
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
            <div className={`text-2xl font-bold ${actualProfitability >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
            <div className={`text-2xl font-bold ${actualProfitability >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
                  <span className="font-semibold text-red-400">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-gray-100">Total Trading Expenses</span>
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
                    <span className="font-semibold text-red-400">
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
                  <span className="text-red-400 text-lg">
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
            <CardTitle className="text-sm font-medium widget-header">Payout Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 widget-value">
              {formatCurrency(0)}
            </div>
            <p className="text-xs widget-text opacity-70">Total payouts received</p>
          </CardContent>
        </Card>

        <Card className="widget-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium widget-header">Profitability</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            {totalPayoutsReceived > 0 ? (
              <>
                <div className={`text-2xl font-bold widget-value ${actualProfitability >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(actualProfitability)}
                </div>
                <p className="text-xs widget-text opacity-70">Payouts received - total costs</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold widget-value text-gray-400">
                  No payouts yet
                </div>
                <p className="text-xs widget-text opacity-70">Profitability calculated after payouts</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget Management Section - Always Visible */}
      <Card className="widget-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between widget-header">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow-400" />
              Budget Management
            </div>
            {activeBudgetPlan && (
              <Badge className="bg-green-600 text-white">
                Active Budget Plan
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {!activeBudgetPlan ? "Create Budget Plan" : "Update Budget Plan"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-black border-yellow-400/30">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {!activeBudgetPlan ? "Create New Budget Plan" : "Update Budget Plan"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Budget Period</Label>
                      <Select value={budgetSetup.period} onValueChange={(value) => setBudgetSetup({...budgetSetup, period: value})}>
                        <SelectTrigger className="bg-gray-800 border-yellow-400/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-yellow-400/20">
                          <SelectItem value="weekly" className="text-white hover:bg-yellow-400/20">Weekly</SelectItem>
                          <SelectItem value="monthly" className="text-white hover:bg-yellow-400/20">Monthly</SelectItem>
                          <SelectItem value="yearly" className="text-white hover:bg-yellow-400/20">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Total Budget</Label>
                      <Input
                        type="number"
                        placeholder="Total monthly budget"
                        value={budgetSetup.totalBudget}
                        onChange={(e) => setBudgetSetup({...budgetSetup, totalBudget: e.target.value})}
                        className="bg-gray-800 border-yellow-400/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Trading Budget</Label>
                      <Input
                        type="number"
                        placeholder="Budget for trading"
                        value={budgetSetup.tradingBudget}
                        onChange={(e) => setBudgetSetup({...budgetSetup, tradingBudget: e.target.value})}
                        className="bg-gray-800 border-yellow-400/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Personal Budget</Label>
                      <Input
                        type="number"
                        placeholder="Personal expenses budget"
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
                    {createBudgetPlanMutation.isPending ? "Creating..." : (!activeBudgetPlan ? "Create Budget Plan" : "Update Budget Plan")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Add Spending Entry Form - In Same Row */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-teal-400 to-teal-600 text-black hover:from-teal-500 hover:to-teal-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Spending Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-black border-yellow-400/30">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Expense</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
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
                          <SelectItem key={category.id} value={category.name} className="text-white hover:bg-yellow-400/20">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <Button 
                    onClick={handleAddExpense}
                    className="w-full bg-gradient-to-r from-teal-400 to-teal-600 text-black hover:from-teal-500 hover:to-teal-700"
                    disabled={!newExpense.amount || !newExpense.category || !newExpense.description || addExpenseMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-yellow-400/20 text-white hover:bg-gray-800">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-black border-yellow-400/30">
                <DialogHeader>
                  <DialogTitle className="text-white">Manage Budget Categories</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Trading Categories in Dialog */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Trading Categories
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add trading category..."
                        value={newTradingCategoryName}
                        onChange={(e) => setNewTradingCategoryName(e.target.value)}
                        className="bg-gray-800 border-yellow-400/20 text-white"
                      />
                      <Button 
                        onClick={() => handleCreateCategory('trading')}
                        className="bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700"
                        disabled={!newTradingCategoryName || createCategoryMutation.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {tradingCategories.map((category) => (
                        <div key={category.id} className="widget-card flex items-center justify-between p-2 rounded">
                          <span className="widget-value text-sm">{category.name}</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => setEditingCategory(category)}>
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteCategoryMutation.mutate(category.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Personal Categories in Dialog */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-orange-500" />
                      Personal Categories
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add personal category..."
                        value={newPersonalCategoryName}
                        onChange={(e) => setNewPersonalCategoryName(e.target.value)}
                        className="bg-gray-800 border-yellow-400/20 text-white"
                      />
                      <Button 
                        onClick={() => handleCreateCategory('personal')}
                        className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700"
                        disabled={!newPersonalCategoryName || createCategoryMutation.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {personalCategories.map((category) => (
                        <div key={category.id} className="widget-card flex items-center justify-between p-2 rounded">
                          <span className="widget-value text-sm">{category.name}</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => setEditingCategory(category)}>
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteCategoryMutation.mutate(category.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

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
                    <div className={`text-2xl font-bold ${totalSpending > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(totalSpending)}</div>
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
                    <div className={`text-2xl font-bold ${totalPropTradingCosts > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(totalPropTradingCosts)}</div>
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
                    <div className={`text-2xl font-bold ${totalManualSpending > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(totalManualSpending)}</div>
                    <p className="text-xs text-gray-400">of {formatCurrency(personalBudget)} budget</p>
                    <Progress value={Math.min((totalManualSpending / personalBudget) * 100, 100)} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Remaining Budget</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
                            <span className={`font-semibold text-red-500`}>
                              {expense.amount > 0 ? formatCurrency(expense.amount) : '$0.00'}
                            </span>
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
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Select value={selectedEmoji} onValueChange={setSelectedEmoji}>
                    <SelectTrigger className="w-16 bg-gray-800 border-yellow-400/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-yellow-400/20">
                      <SelectItem value="📊">📊</SelectItem>
                      <SelectItem value="💹">💹</SelectItem>
                      <SelectItem value="📈">📈</SelectItem>
                      <SelectItem value="💰">💰</SelectItem>
                      <SelectItem value="🎯">🎯</SelectItem>
                      <SelectItem value="⚙️">⚙️</SelectItem>
                      <SelectItem value="📱">📱</SelectItem>
                      <SelectItem value="💻">💻</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Add trading category..."
                    value={newTradingCategoryName}
                    onChange={(e) => setNewTradingCategoryName(e.target.value)}
                    className="bg-gray-800 border-yellow-400/20 text-white"
                  />
                </div>
                <Button 
                  onClick={() => handleCreateCategory('trading')}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700"
                  disabled={!newTradingCategoryName || createCategoryMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {tradingCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.emoji || '📊'}</span>
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
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Select value={selectedEmoji} onValueChange={setSelectedEmoji}>
                    <SelectTrigger className="w-16 bg-gray-800 border-yellow-400/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-yellow-400/20">
                      <SelectItem value="🍔">🍔</SelectItem>
                      <SelectItem value="🚗">🚗</SelectItem>
                      <SelectItem value="🏠">🏠</SelectItem>
                      <SelectItem value="🛒">🛒</SelectItem>
                      <SelectItem value="🎬">🎬</SelectItem>
                      <SelectItem value="👕">👕</SelectItem>
                      <SelectItem value="⚡">⚡</SelectItem>
                      <SelectItem value="📚">📚</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Add personal category..."
                    value={newPersonalCategoryName}
                    onChange={(e) => setNewPersonalCategoryName(e.target.value)}
                    className="bg-gray-800 border-yellow-400/20 text-white"
                  />
                </div>
                <Button 
                  onClick={() => handleCreateCategory('personal')}
                  className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700"
                  disabled={!newPersonalCategoryName || createCategoryMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {personalCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.emoji || '🍕'}</span>
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
                className="bg-white border-yellow-400/20 text-black"
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
                      <FileImage className="h-8 w-8 text-green-500 mx-auto" />
                      <p className="text-green-500 font-medium">{newExpense.receiptImage.name}</p>
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
                  className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
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
                      <div className="font-semibold text-red-500">-{formatCurrency(expense.amount)}</div>
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

      {/* Legacy Spending Entry Component - Hidden since Add Expense is in header */}
      {/* <SpendingEntry accounts={accounts} /> */}
      </div>
    </div>
  );
};

export default Spending;