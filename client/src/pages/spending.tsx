import { useQuery } from "@tanstack/react-query";
import SpendingEntry from "@/components/spending-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { type Account, type Spending } from "@shared/schema";

export default function SpendingPage() {
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: spendingRecords = [], isLoading: spendingLoading } = useQuery<Spending[]>({
    queryKey: ["/api/spending"],
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

  // Calculate total spending by category
  const totalSpending = spendingRecords.reduce((sum, record) => sum + record.amount, 0);
  const spendingByType = spendingRecords.reduce((acc, record) => {
    acc[record.spendingType] = (acc[record.spendingType] || 0) + record.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Spending Management</h1>
      </div>

      {/* Spending Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{formatCurrency(totalSpending)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Account Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {formatCurrency(spendingByType['account_purchase'] || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Account Resets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {formatCurrency(spendingByType['account_reset'] || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(spendingByType['subscription'] || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Entry Form */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">Add New Spending Record</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingEntry accounts={accounts} />
        </CardContent>
      </Card>

      {/* Recent Spending Records */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">Recent Spending Records</CardTitle>
        </CardHeader>
        <CardContent>
          {spendingRecords.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No spending records found. Add your first record above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 text-gray-300">Account</th>
                    <th className="text-left py-3 px-4 text-gray-300">Type</th>
                    <th className="text-left py-3 px-4 text-gray-300">Description</th>
                    <th className="text-left py-3 px-4 text-gray-300">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-300">Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {spendingRecords
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((record) => {
                      const account = accounts.find(acc => acc.id === record.accountId);
                      return (
                        <tr key={record.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                          <td className="py-3 px-4 text-gray-300">{record.date}</td>
                          <td className="py-3 px-4 text-gray-300">{account?.name || 'Unknown'}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-gray-300">
                              {record.spendingType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{record.description}</td>
                          <td className="py-3 px-4 text-red-400 font-semibold">
                            {formatCurrency(record.amount)}
                          </td>
                          <td className="py-3 px-4 text-gray-300">{record.paymentMethod}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}