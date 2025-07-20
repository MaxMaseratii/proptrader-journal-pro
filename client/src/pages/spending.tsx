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
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { type Account, type Spending as SpendingRecord } from "@shared/schema";
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
  AlertTriangle
} from 'lucide-react';

const Spending = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const queryClient = useQueryClient();
  
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: '',
    description: '',
    type: 'trading' // trading or personal
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: spendingRecords = [], isLoading: spendingLoading } = useQuery<SpendingRecord[]>({
    queryKey: ["/api/spending"],
  });

  // Mutation for adding new expense
  const addExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      return await apiRequest("/api/spending", "POST", expenseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spending"] });
      setNewExpense({ amount: '', category: '', description: '', type: 'trading' });
    },
  });

  if (accountsLoading || spendingLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-96 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Filter accounts and spending records based on selection
  const filteredAccounts = selectedAccountId === "all" 
    ? accounts 
    : accounts.filter(account => account.id === parseInt(selectedAccountId));
  
  const filteredSpendingRecords = selectedAccountId === "all" 
    ? spendingRecords 
    : spendingRecords.filter(record => record.accountId === parseInt(selectedAccountId));

  // Calculate investment tracking from filtered account data
  const totalAccountCosts = filteredAccounts.reduce((sum, account) => sum + (account.accountCost || 0), 0);
  const totalActivationCosts = filteredAccounts.reduce((sum, account) => sum + (account.activationCost || 0), 0);
  const totalResetCosts = filteredAccounts.reduce((sum, account) => sum + (account.totalResetsCost || 0), 0);
  const totalInvestmentTracking = totalAccountCosts + totalActivationCosts + totalResetCosts;
  
  // Calculate manual spending entries from filtered records
  const totalManualSpending = filteredSpendingRecords.reduce((sum, record) => sum + record.amount, 0);
  const spendingByType = filteredSpendingRecords.reduce((acc, record) => {
    acc[record.spendingType] = (acc[record.spendingType] || 0) + record.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Combined total spending
  const totalSpending = totalInvestmentTracking + totalManualSpending;

  // Calculate spending by categories
  const categories = [
    { 
      name: 'Trading Tools & Software', 
      amount: spendingByType['trading_software'] || 0, 
      budget: 1000, 
      icon: Monitor, 
      color: 'text-blue-500' 
    },
    { 
      name: 'Education & Courses', 
      amount: spendingByType['education'] || 0, 
      budget: 500, 
      icon: ShoppingCart, 
      color: 'text-purple-500' 
    },
    { 
      name: 'Food & Entertainment', 
      amount: spendingByType['food_entertainment'] || 0, 
      budget: 800, 
      icon: Coffee, 
      color: 'text-orange-500' 
    },
    { 
      name: 'Transportation', 
      amount: spendingByType['transportation'] || 0, 
      budget: 600, 
      icon: Car, 
      color: 'text-green-500' 
    },
    { 
      name: 'Rent & Utilities', 
      amount: spendingByType['housing'] || 0, 
      budget: 2000, 
      icon: Home, 
      color: 'text-red-500' 
    },
    { 
      name: 'Account Costs', 
      amount: totalAccountCosts + spendingByType['account_purchase'] || 0, 
      budget: 5000, 
      icon: CreditCard, 
      color: 'text-yellow-500' 
    }
  ];

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const budgetUsagePercentage = (totalSpending / totalBudget) * 100;
  const remainingBudget = totalBudget - totalSpending;

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.category || !newExpense.description) return;
    
    const expenseData = {
      accountId: selectedAccountId === "all" ? (accounts[0]?.id || 1) : parseInt(selectedAccountId),
      amount: parseFloat(newExpense.amount),
      spendingType: newExpense.category,
      description: newExpense.description,
      date: new Date().toISOString().split('T')[0]
    };

    addExpenseMutation.mutate(expenseData);
  };

  // Recent expenses (last 10)
  const recentExpenses = filteredSpendingRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Prop Spending Tracker</h1>
          <p className="text-gray-400">Track your prop trading and personal expenses</p>
        </div>
        <div className="flex items-center space-x-4">
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

      {/* Spending Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Monthly Spending</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{formatCurrency(totalSpending)}</div>
            <p className="text-xs text-gray-400">of {formatCurrency(totalBudget)} budget</p>
            <Progress value={Math.min(budgetUsagePercentage, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Trading Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{formatCurrency(totalInvestmentTracking)}</div>
            <p className="text-xs text-gray-400">Business investments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Personal Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatCurrency(totalManualSpending)}</div>
            <p className="text-xs text-gray-400">Lifestyle costs</p>
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
            <p className="text-xs text-gray-400">Available this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <PieChart className="h-5 w-5 text-yellow-400" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category, index) => {
              const usage = category.budget > 0 ? (category.amount / category.budget) * 100 : 0;
              const IconComponent = category.icon;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${category.color}`} />
                      <span className="font-medium text-white">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-white">{formatCurrency(category.amount)}</span>
                      <span className="text-sm text-gray-400"> / {formatCurrency(category.budget)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min(usage, 100)} className="flex-1" />
                    <Badge variant={usage > 90 ? 'destructive' : usage > 75 ? 'secondary' : 'outline'}>
                      {usage.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add New Expense */}
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
                  <SelectItem value="trading_software">Trading Tools & Software</SelectItem>
                  <SelectItem value="education">Education & Courses</SelectItem>
                  <SelectItem value="food_entertainment">Food & Entertainment</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="housing">Rent & Utilities</SelectItem>
                  <SelectItem value="account_purchase">Account Purchase</SelectItem>
                  <SelectItem value="account_reset">Account Reset</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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

      {/* Recent Expenses */}
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-yellow-400" />
            Recent Expenses
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
                      <div className="text-sm text-gray-400">{expense.date} • {expense.spendingType.replace('_', ' ')}</div>
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
                <p className="text-sm text-gray-500">Add your first expense above to start tracking</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legacy Spending Entry Component */}
      <SpendingEntry />
    </div>
  );
};

export default Spending;