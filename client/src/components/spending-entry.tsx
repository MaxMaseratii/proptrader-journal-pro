import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, DollarSign, CreditCard, Receipt, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Account } from "@shared/schema";

interface SpendingEntryProps {
  accounts: Account[];
}

interface SpendingData {
  accountId: number;
  spendingType: 'account_purchase' | 'account_reset' | 'activation_fee' | 'subscription' | 'other';
  amount: number;
  description: string;
  paymentMethod: string;
  date: string;
  isRecurring?: boolean;
  category?: string;
}

export default function SpendingEntry({ accounts }: SpendingEntryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<SpendingData>({
    accountId: 0,
    spendingType: 'account_purchase',
    amount: 0,
    description: '',
    paymentMethod: 'credit_card',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    category: ''
  });

  const mutation = useMutation({
    mutationFn: async (data: SpendingData) => {
      const response = await apiRequest("POST", "/api/spending", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Spending Entry Added",
        description: "Your spending entry has been recorded successfully.",
      });
      setIsDialogOpen(false);
      setFormData({
        accountId: 0,
        spendingType: 'account_purchase',
        amount: 0,
        description: '',
        paymentMethod: 'credit_card',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        category: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spending'] });
    },
    onError: (error) => {
      toast({
        title: "Error Adding Spending Entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId) {
      toast({
        title: "Validation Error",
        description: "Please select a trading account.",
        variant: "destructive",
      });
      return;
    }

    if (formData.amount <= 0) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a description for this expense.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(formData);
  };

  const spendingTypes = [
    { value: 'account_purchase', label: 'Account Purchase', icon: '💳' },
    { value: 'account_reset', label: 'Account Reset', icon: '🔄' },
    { value: 'activation_fee', label: 'Activation Fee', icon: '⚡' },
    { value: 'subscription', label: 'Platform Subscription', icon: '📅' },
    { value: 'other', label: 'Other Expense', icon: '💰' }
  ];

  const paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-prop-gradient-gold text-black hover-scale smooth-transition">
          <Plus className="mr-2 h-4 w-4" />
          Add Spending Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-prop-gold flex items-center">
            <Receipt className="mr-3 h-6 w-6" />
            Record Trading Expense
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[calc(95vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Account Selection */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-prop-gold" />
                  Account & Expense Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Trading Account</Label>
                    <Select 
                      value={formData.accountId?.toString() || ""} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: parseInt(value) }))}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-prop-gold">
                        <SelectValue placeholder="Select account for this expense" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()} className="text-white hover:bg-gray-600">
                            {account.name} ({account.firm})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Expense Type</Label>
                    <Select 
                      value={formData.spendingType} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, spendingType: value }))}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-prop-gold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {spendingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-600">
                            <div className="flex items-center">
                              <span className="mr-2">{type.icon}</span>
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Amount ($)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      className="bg-gray-700 border-gray-600 text-white focus:border-prop-gold"
                      placeholder="Enter expense amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Date</Label>
                    <Input 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white focus:border-prop-gold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}  
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-prop-blue" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Payment Method</Label>
                    <Select 
                      value={formData.paymentMethod} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-prop-blue">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value} className="text-white hover:bg-gray-600">
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Category (Optional)</Label>
                    <Input 
                      value={formData.category || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white focus:border-prop-blue"
                      placeholder="e.g., Challenge, Funded, Evaluation"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-gray-300 font-medium">Description</Label>
                    <Textarea 
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white focus:border-prop-blue min-h-[100px]"
                      placeholder="Describe this expense (e.g., FTMO Challenge purchase, Account reset fee, etc.)"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-2">
                    <Checkbox 
                      id="recurring"
                      checked={formData.isRecurring || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked as boolean }))}
                      className="border-gray-600"
                    />
                    <Label htmlFor="recurring" className="text-gray-300 cursor-pointer">
                      This is a recurring expense
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Card */}
            <Card className="bg-yellow-900/20 border-yellow-600/50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">Important Reminder</p>
                    <p>Keep track of all trading-related expenses for tax purposes and to calculate your true net profit. This includes account fees, platform subscriptions, and reset costs.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="bg-prop-gradient-gold text-black hover-scale smooth-transition"
              >
                {mutation.isPending ? "Recording..." : "Record Expense"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}