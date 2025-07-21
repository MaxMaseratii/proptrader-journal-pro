import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, BookOpen, TrendingUp, TrendingDown, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import type { Account, JournalEntry } from '@shared/schema';

const Journal = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    accountId: null as number | null,
    whatWentWrong: '',
    whatWentRight: '',
    lessonsLearned: '',
    improvementPlan: '',
    emotionalState: 'neutral',
    marketConditions: ''
  });

  // Load from localStorage for form persistence
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const saved = localStorage.getItem(`journal-form-${dateKey}`);
    if (saved) {
      setFormData(JSON.parse(saved));
    } else {
      setFormData({
        accountId: null,
        whatWentWrong: '',
        whatWentRight: '',
        lessonsLearned: '',
        improvementPlan: '',
        emotionalState: 'neutral',
        marketConditions: ''
      });
    }
  }, [selectedDate]);

  // Save form data whenever it changes
  useEffect(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`journal-form-${dateKey}`, JSON.stringify(formData));
  }, [formData, selectedDate]);

  // Queries
  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: journalEntries } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal'],
  });

  // Mutations
  const createJournalEntry = useMutation({
    mutationFn: (data: any) => apiRequest('/api/journal', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      // Clear form after successful save
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      localStorage.removeItem(`journal-form-${dateKey}`);
      setFormData({
        accountId: null,
        whatWentWrong: '',
        whatWentRight: '',
        lessonsLearned: '',
        improvementPlan: '',
        emotionalState: 'neutral',
        marketConditions: ''
      });
    },
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.accountId) {
      alert('Please select an account');
      return;
    }

    const entry = {
      accountId: formData.accountId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      whatWentWrong: formData.whatWentWrong,
      whatWentRight: formData.whatWentRight,
      lessonsLearned: formData.lessonsLearned,
      improvementPlan: formData.improvementPlan,
      emotionalState: formData.emotionalState,
      marketConditions: formData.marketConditions
    };

    createJournalEntry.mutate(entry);
  };

  const getTodaysEntry = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return journalEntries?.find(entry => entry.date === dateKey);
  };

  const getEmotionalStateColor = (state: string) => {
    switch (state) {
      case 'confident': return 'bg-green-100 text-green-800';
      case 'excited': return 'bg-green-100 text-green-800';
      case 'calm': return 'bg-gray-100 text-gray-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      case 'nervous': return 'bg-yellow-100 text-yellow-800';
      case 'frustrated': return 'bg-red-100 text-red-800';
      case 'angry': return 'bg-red-100 text-red-800';
      case 'fearful': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const todaysEntry = getTodaysEntry();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 bg-clip-text">
            Trading Journal
          </h1>
          <p className="text-gray-400 mt-2">Reflect on your trading performance and emotions</p>
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, 'MMM dd, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-yellow-400/20" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="bg-gray-800"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Journal Entry Form */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                <BookOpen className="h-5 w-5 text-yellow-400" />
                Journal Entry - {format(selectedDate, 'MMMM dd, yyyy')}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {todaysEntry ? 'Update your journal entry for this day' : 'Create a journal entry for this day'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account" className="text-white">Account</Label>
                  <Select value={formData.accountId?.toString() || ''} onValueChange={(value) => updateFormData('accountId', parseInt(value))}>
                    <SelectTrigger className="bg-white border-gray-300 text-black">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()} className="text-black">
                          {account.name} ({account.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emotionalState" className="text-white">Emotional State</Label>
                  <Select value={formData.emotionalState} onValueChange={(value) => updateFormData('emotionalState', value)}>
                    <SelectTrigger className="bg-white border-gray-300 text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="confident" className="text-black">😎 Confident</SelectItem>
                      <SelectItem value="excited" className="text-black">🚀 Excited</SelectItem>
                      <SelectItem value="calm" className="text-black">😌 Calm</SelectItem>
                      <SelectItem value="neutral" className="text-black">😐 Neutral</SelectItem>
                      <SelectItem value="nervous" className="text-black">😰 Nervous</SelectItem>
                      <SelectItem value="frustrated" className="text-black">😤 Frustrated</SelectItem>
                      <SelectItem value="angry" className="text-black">😡 Angry</SelectItem>
                      <SelectItem value="fearful" className="text-black">😨 Fearful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketConditions" className="text-white">Market Conditions</Label>
                <Textarea
                  id="marketConditions"
                  value={formData.marketConditions}
                  onChange={(e) => updateFormData('marketConditions', e.target.value)}
                  placeholder="Describe the market conditions today (trending, ranging, volatile, news events, etc.)"
                  rows={2}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatWentRight" className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  What Went Right
                </Label>
                <Textarea
                  id="whatWentRight"
                  value={formData.whatWentRight}
                  onChange={(e) => updateFormData('whatWentRight', e.target.value)}
                  placeholder="What did you do well today? Good entries, risk management, discipline, etc."
                  rows={3}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatWentWrong" className="flex items-center gap-2 text-white">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  What Went Wrong
                </Label>
                <Textarea
                  id="whatWentWrong"
                  value={formData.whatWentWrong}
                  onChange={(e) => updateFormData('whatWentWrong', e.target.value)}
                  placeholder="What mistakes did you make? Poor entries, breaking rules, emotional trading, etc."
                  rows={3}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessonsLearned" className="flex items-center gap-2 text-white">
                  <Brain className="h-4 w-4 text-yellow-400" />
                  Lessons Learned
                </Label>
                <Textarea
                  id="lessonsLearned"
                  value={formData.lessonsLearned}
                  onChange={(e) => updateFormData('lessonsLearned', e.target.value)}
                  placeholder="What key insights did you gain from today's trading?"
                  rows={3}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvementPlan" className="text-white">Improvement Plan</Label>
                <Textarea
                  id="improvementPlan"
                  value={formData.improvementPlan}
                  onChange={(e) => updateFormData('improvementPlan', e.target.value)}
                  placeholder="What specific actions will you take to improve your trading?"
                  rows={3}
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-yellow-400/20">
                <Button 
                  onClick={handleSubmit} 
                  disabled={createJournalEntry.isPending}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                >
                  {createJournalEntry.isPending ? 'Saving...' : (todaysEntry ? 'Update Entry' : 'Save Entry')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Recent Entries</CardTitle>
              <CardDescription className="text-gray-400">Your latest journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journalEntries
                  ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 cursor-pointer transition-colors border border-yellow-400/10"
                      onClick={() => setSelectedDate(new Date(entry.date))}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm text-white">
                          {format(new Date(entry.date), 'MMM dd')}
                        </div>
                        <Badge className={getEmotionalStateColor(entry.emotionalState)} variant="secondary">
                          {entry.emotionalState}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {entry.lessonsLearned || entry.whatWentRight || 'No content'}
                      </p>
                    </div>
                  ))}
                {(!journalEntries || journalEntries.length === 0) && (
                  <div className="text-center py-6 text-gray-400">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No journal entries yet</p>
                    <p className="text-xs">Start reflecting on your trades</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Entry Preview */}
          {todaysEntry && (
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Today's Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-gray-400">Emotional State</Label>
                  <Badge className={getEmotionalStateColor(todaysEntry.emotionalState)} variant="secondary">
                    {todaysEntry.emotionalState}
                  </Badge>
                </div>
                {todaysEntry.lessonsLearned && (
                  <div>
                    <Label className="text-xs font-medium text-gray-400">Key Lessons</Label>
                    <p className="text-sm text-gray-300">{todaysEntry.lessonsLearned}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;