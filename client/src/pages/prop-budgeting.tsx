import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Account } from "@shared/schema";
import { 
  Wallet, DollarSign, TrendingUp, TrendingDown, AlertCircle, 
  Plus, PieChart, BarChart3, Calendar, Target, CreditCard,
  Receipt, Home, Car, GraduationCap, Coffee, Calculator
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

// Budget categories with icons and colors
const budgetCategories = [
  { id: 'trading-tools', name: 'Trading Tools', icon: Calculator, color: 'from-blue-500 to-blue-600' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'from-purple-500 to-purple-600' },
  { id: 'food', name: 'Food & Entertainment', icon: Coffee, color: 'from-orange-500 to-orange-600' },
  { id: 'transportation', name: 'Transportation', icon: Car, color: 'from-green-500 to-green-600' },
  { id: 'housing', name: 'Housing', icon: Home, color: 'from-red-500 to-red-600' },
  { id: 'account-costs', name: 'Account Costs', icon: CreditCard, color: 'from-amber-500 to-amber-600' }
];

export default function PropBudgeting() {
  const queryClient = useQueryClient();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedMonth] = useState(new Date());

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: spending = [] } = useQuery({
    queryKey: ["/api/spending"],
  });

  // Calculate budget metrics
  const budgetMetrics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filter spending for current month
    const monthlySpending = spending.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    // Calculate totals by category
    const categoryTotals = budgetCategories.map(category => {
      const categorySpending = monthlySpending.filter((expense: any) => 
        expense.category === category.id || expense.description?.toLowerCase().includes(category.name.toLowerCase())
      );
      const total = categorySpending.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);
      return { ...category, spent: total, budget: 1000 }; // Default budget of $1000
    });

    const totalBudget = categoryTotals.reduce((sum, cat) => sum + cat.budget, 0);
    const totalSpent = categoryTotals.reduce((sum, cat) => sum + cat.spent, 0);

    return {
      categoryTotals,
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      percentUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  }, [spending]);

  // Account investment tracking
  const accountInvestments = useMemo(() => {
    const totalAccountCosts = accounts.reduce((sum, acc) => sum + (acc.accountCost || 0), 0);
    const totalActivationCosts = accounts.reduce((sum, acc) => sum + (acc.activationCost || 0), 0);
    const totalResetCosts = accounts.reduce((sum, acc) => sum + (acc.totalResetsCost || 0), 0);
    
    return {
      accountCosts: totalAccountCosts,
      activationCosts: totalActivationCosts,
      resetCosts: totalResetCosts,
      totalInvestment: totalAccountCosts + totalActivationCosts + totalResetCosts
    };
  }, [accounts]);

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/spending", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spending"] });
      setShowExpenseModal(false);
      setExpenseForm({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    },
  });

  const handleAddExpense = () => {
    if (!expenseForm.amount || !expenseForm.description) return;
    
    addExpenseMutation.mutate({
      type: 'spending',
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description,
      date: expenseForm.date,
      category: expenseForm.category
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
            Prop Budgeting
          </h1>
          <p className="text-gray-400 mt-2">
            Comprehensive expense tracking and budget management for prop traders
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => setShowExpenseModal(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:from-amber-400 hover:to-amber-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-800/50 border border-gray-600/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">
            Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">
            Categories
          </TabsTrigger>
          <TabsTrigger value="investments" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">
            Account Investments
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Budget Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400 flex items-center">
                  <Wallet className="w-4 h-4 mr-2" />
                  Total Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(budgetMetrics.totalBudget)}
                </div>
                <Badge variant="outline" className="mt-2 text-gray-400">Monthly</Badge>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {formatCurrency(budgetMetrics.totalSpent)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {budgetMetrics.percentUsed.toFixed(1)}% used
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${budgetMetrics.remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(budgetMetrics.remaining)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {budgetMetrics.remaining >= 0 ? 'Under budget' : 'Over budget'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Budget Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{budgetMetrics.percentUsed.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={budgetMetrics.percentUsed} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 border border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetMetrics.categoryTotals.map((category) => {
                  const Icon = category.icon;
                  const percentUsed = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
                  const isOverBudget = category.spent > category.budget;

                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`bg-gradient-to-r ${category.color} p-2 rounded-lg`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{category.name}</div>
                            <div className="text-sm text-gray-400">
                              {formatCurrency(category.spent)} of {formatCurrency(category.budget)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${isOverBudget ? 'text-red-400' : 'text-gray-300'}`}>
                            {percentUsed.toFixed(0)}%
                          </div>
                          {isOverBudget && (
                            <Badge variant="destructive" className="text-xs">
                              Over budget
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(percentUsed, 100)} 
                        className="h-2"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          {/* Account Investment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-amber-900/20 via-amber-800/20 to-amber-900/20 border border-amber-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-amber-400">Account Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(accountInvestments.accountCosts)}
                </div>
                <div className="text-xs text-amber-300 mt-1">Initial purchases</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 via-blue-800/20 to-blue-900/20 border border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-400">Activation Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(accountInvestments.activationCosts)}
                </div>
                <div className="text-xs text-blue-300 mt-1">Account activations</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/20 via-red-800/20 to-red-900/20 border border-red-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-red-400">Reset Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(accountInvestments.resetCosts)}
                </div>
                <div className="text-xs text-red-300 mt-1">Failed attempts</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/20 via-green-800/20 to-green-900/20 border border-green-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-400">Total Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(accountInvestments.totalInvestment)}
                </div>
                <div className="text-xs text-green-300 mt-1">All-time total</div>
              </CardContent>
            </Card>
          </div>

          {/* Account Investment Breakdown */}
          <Card className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 border border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-amber-400">Account Investment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                  <p className="text-gray-400">No accounts found. Add an account to track investments.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="border border-gray-600/30 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-white">{account.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={account.type === 'funded' ? 'default' : 'secondary'}>
                              {account.type}
                            </Badge>
                            <Badge variant={account.status === 'active' ? 'default' : 'outline'}>
                              {account.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {formatCurrency((account.accountCost || 0) + (account.activationCost || 0) + (account.totalResetsCost || 0))}
                          </div>
                          <div className="text-sm text-gray-400">Total invested</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Account Cost</div>
                          <div className="font-medium text-amber-400">{formatCurrency(account.accountCost || 0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Activation</div>
                          <div className="font-medium text-blue-400">{formatCurrency(account.activationCost || 0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Resets</div>
                          <div className="font-medium text-red-400">{formatCurrency(account.totalResetsCost || 0)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Expense Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-400">Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {budgetCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What was this expense for?"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAddExpense}
                disabled={addExpenseMutation.isPending || !expenseForm.amount || !expenseForm.description}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-black"
              >
                {addExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExpenseModal(false)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}