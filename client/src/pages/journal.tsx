import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { CalendarIcon, Book, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import type { Account, JournalEntry, InsertJournalEntry } from "@shared/schema";

export default function Journal() {
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    whatWentWrong: "",
    whatWentRight: "",
    improvementPlan: "",
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: entries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal", selectedAccount],
    enabled: !!selectedAccount,
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: InsertJournalEntry) => {
      const response = await apiRequest("POST", "/api/journal", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      setIsCreating(false);
      setFormData({ whatWentWrong: "", whatWentRight: "", improvementPlan: "" });
    },
  });

  const handleSubmit = () => {
    if (!selectedAccount) return;
    
    createEntryMutation.mutate({
      accountId: parseInt(selectedAccount),
      date: format(selectedDate, "yyyy-MM-dd"),
      ...formData,
    });
  };

  const todayEntry = entries?.find(entry => 
    entry.date === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <>
      <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Trading Journal</h2>
            <p className="text-gray-400 text-sm mt-1">Track your daily trading insights and improvements</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-dark-border">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "MMM dd, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-dark-surface border-dark-border">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <div className="p-6">
        {!selectedAccount ? (
          <div className="text-center py-12">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Select an account to start journaling</h3>
            <p className="text-gray-400">Choose an account from the dropdown to view and create journal entries</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today's Entry Form */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Book className="mr-2 h-5 w-5 text-accent-orange" />
                    Journal Entry for {format(selectedDate, "MMMM dd, yyyy")}
                  </CardTitle>
                  {todayEntry && !isCreating && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsCreating(true)}
                      className="border-dark-border"
                    >
                      Edit Entry
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {todayEntry && !isCreating ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">What went wrong?</h4>
                      <div className="bg-dark-surface p-4 rounded-lg border border-dark-border min-h-[120px]">
                        <p className="text-sm text-gray-300">
                          {todayEntry.whatWentWrong || "No issues noted for this day"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">What went right?</h4>
                      <div className="bg-dark-surface p-4 rounded-lg border border-dark-border min-h-[120px]">
                        <p className="text-sm text-gray-300">
                          {todayEntry.whatWentRight || "No successes noted for this day"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Improvement plan</h4>
                      <div className="bg-dark-surface p-4 rounded-lg border border-dark-border min-h-[120px]">
                        <p className="text-sm text-gray-300">
                          {todayEntry.improvementPlan || "No improvement plan for this day"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          What went wrong today?
                        </label>
                        <Textarea 
                          className="bg-dark-surface border-dark-border resize-none" 
                          rows={4} 
                          placeholder="Reflect on mistakes and lessons learned..."
                          value={formData.whatWentWrong}
                          onChange={(e) => setFormData(prev => ({ ...prev, whatWentWrong: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          What went right today?
                        </label>
                        <Textarea 
                          className="bg-dark-surface border-dark-border resize-none" 
                          rows={4} 
                          placeholder="Note successful strategies and decisions..."
                          value={formData.whatWentRight}
                          onChange={(e) => setFormData(prev => ({ ...prev, whatWentRight: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Tomorrow's improvement plan
                        </label>
                        <Textarea 
                          className="bg-dark-surface border-dark-border resize-none" 
                          rows={4} 
                          placeholder="Set goals for tomorrow's session..."
                          value={formData.improvementPlan}
                          onChange={(e) => setFormData(prev => ({ ...prev, improvementPlan: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      {isCreating && (
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreating(false)}
                          className="border-dark-border"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button 
                        onClick={handleSubmit}
                        disabled={createEntryMutation.isPending}
                        className="bg-accent-orange hover:bg-orange-600"
                      >
                        {createEntryMutation.isPending ? "Saving..." : "Save Journal Entry"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Journal History */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle>Journal History</CardTitle>
                <p className="text-gray-400 text-sm">Previous entries for this account</p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading journal entries...</p>
                  </div>
                ) : entries && entries.length > 0 ? (
                  <div className="space-y-4">
                    {entries
                      .filter(entry => entry.date !== format(selectedDate, "yyyy-MM-dd"))
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry) => (
                        <div key={entry.id} className="bg-dark-surface p-4 rounded-lg border border-dark-border">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{formatDate(entry.date)}</h4>
                            <Badge variant="outline" className="border-gray-600 text-gray-400">
                              Entry #{entry.id}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400 font-medium mb-1">Issues</p>
                              <p className="text-gray-300">{entry.whatWentWrong || "None noted"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium mb-1">Successes</p>
                              <p className="text-gray-300">{entry.whatWentRight || "None noted"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 font-medium mb-1">Plan</p>
                              <p className="text-gray-300">{entry.improvementPlan || "No plan set"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No journal entries found for this account</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
