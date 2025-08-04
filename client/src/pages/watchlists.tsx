import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Eye, Plus, Star, TrendingUp, TrendingDown, MoreVertical, Edit, Trash2, Bell, BellOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Watchlist {
  id: number;
  name: string;
  description?: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  symbolsCount?: number;
}

interface WatchlistSymbol {
  id: number;
  watchlistId: number;
  symbol: string;
  exchange?: string;
  name?: string;
  category?: string;
  alertPrice?: number;
  alertEnabled: boolean;
  notes?: string;
  addedAt: string;
  // Mock price data
  currentPrice?: number;
  change?: number;
  changePercent?: number;
}

const watchlistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().default("default"),
  isPublic: z.boolean().default(false),
});

const symbolSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  exchange: z.string().optional(),
  name: z.string().optional(),
  category: z.string().optional(),
  alertPrice: z.number().optional(),
  alertEnabled: z.boolean().default(false),
  notes: z.string().optional(),
});

type WatchlistFormData = z.infer<typeof watchlistSchema>;
type SymbolFormData = z.infer<typeof symbolSchema>;

const CategoryBadge = ({ category }: { category: string }) => {
  const colors = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    forex: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    crypto: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    indices: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    commodities: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    stocks: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };

  return (
    <Badge className={colors[category as keyof typeof colors] || colors.default}>
      {category.toUpperCase()}
    </Badge>
  );
};

// Mock price data generator
const generateMockPrice = (symbol: string) => {
  const hash = symbol.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const basePrice = 100 + (hash % 900); // Price between 100-1000
  const change = (Math.sin(hash) * 10).toFixed(2);
  const changePercent = ((parseFloat(change) / basePrice) * 100).toFixed(2);
  
  return {
    currentPrice: basePrice,
    change: parseFloat(change),
    changePercent: parseFloat(changePercent),
  };
};

export default function WatchlistsPage() {
  const [selectedWatchlist, setSelectedWatchlist] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddSymbolDialog, setShowAddSymbolDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch watchlists
  const { data: watchlists = [], isLoading: watchlistsLoading } = useQuery({
    queryKey: ['/api/watchlists'],
  });

  // Fetch symbols for selected watchlist
  const { data: symbols = [], isLoading: symbolsLoading } = useQuery({
    queryKey: ['/api/watchlists', selectedWatchlist, 'symbols'],
    enabled: !!selectedWatchlist,
  });

  // Create watchlist mutation
  const createWatchlistMutation = useMutation({
    mutationFn: (data: WatchlistFormData) =>
      fetch('/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlists'] });
      setShowCreateDialog(false);
    },
  });

  // Add symbol mutation
  const addSymbolMutation = useMutation({
    mutationFn: (data: SymbolFormData & { watchlistId: number }) =>
      fetch(`/api/watchlists/${data.watchlistId}/symbols`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlists', selectedWatchlist, 'symbols'] });
      setShowAddSymbolDialog(false);
    },
  });

  // Delete watchlist mutation
  const deleteWatchlistMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/watchlists/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlists'] });
      setSelectedWatchlist(null);
    },
  });

  // Remove symbol mutation
  const removeSymbolMutation = useMutation({
    mutationFn: ({ watchlistId, symbolId }: { watchlistId: number; symbolId: number }) =>
      fetch(`/api/watchlists/${watchlistId}/symbols/${symbolId}`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlists', selectedWatchlist, 'symbols'] });
    },
  });

  // Forms
  const watchlistForm = useForm<WatchlistFormData>({
    resolver: zodResolver(watchlistSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "default",
      isPublic: false,
    },
  });

  const symbolForm = useForm<SymbolFormData>({
    resolver: zodResolver(symbolSchema),
    defaultValues: {
      symbol: "",
      exchange: "",
      name: "",
      category: "",
      alertEnabled: false,
      notes: "",
    },
  });

  const onCreateWatchlist = (data: WatchlistFormData) => {
    createWatchlistMutation.mutate(data);
  };

  const onAddSymbol = (data: SymbolFormData) => {
    if (selectedWatchlist) {
      addSymbolMutation.mutate({ ...data, watchlistId: selectedWatchlist });
    }
  };

  const selectedWatchlistData = (watchlists as Watchlist[]).find((w: Watchlist) => w.id === selectedWatchlist);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Eye className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Watchlists</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track and monitor your favorite trading instruments
              </p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Watchlist</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Watchlist</DialogTitle>
              </DialogHeader>
              <form onSubmit={watchlistForm.handleSubmit(onCreateWatchlist)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...watchlistForm.register("name")}
                    placeholder="My Forex Pairs"
                  />
                  {watchlistForm.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {watchlistForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    {...watchlistForm.register("description")}
                    placeholder="Description (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={watchlistForm.watch("category")}
                    onValueChange={(value) => watchlistForm.setValue("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="indices">Indices</SelectItem>
                      <SelectItem value="commodities">Commodities</SelectItem>
                      <SelectItem value="stocks">Stocks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={watchlistForm.watch("isPublic")}
                    onCheckedChange={(checked) => watchlistForm.setValue("isPublic", checked)}
                  />
                  <Label htmlFor="isPublic">Make public</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createWatchlistMutation.isPending}
                  >
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Watchlists Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Watchlists</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {watchlistsLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading...</p>
                  </div>
                ) : (watchlists as Watchlist[]).length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No watchlists yet</p>
                    <p className="text-sm text-gray-500 mt-1">Create your first watchlist to get started</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(watchlists as Watchlist[]).map((watchlist: Watchlist) => (
                      <div
                        key={watchlist.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 ${
                          selectedWatchlist === watchlist.id
                            ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-l-transparent'
                        }`}
                        onClick={() => setSelectedWatchlist(watchlist.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {watchlist.name}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <CategoryBadge category={watchlist.category} />
                              {watchlist.isPublic && (
                                <Badge variant="outline" className="text-xs">
                                  Public
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteWatchlistMutation.mutate(watchlist.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Watchlist Content */}
          <div className="lg:col-span-2">
            {selectedWatchlist ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{selectedWatchlistData?.name}</span>
                      {selectedWatchlistData && (
                        <CategoryBadge category={selectedWatchlistData.category} />
                      )}
                    </CardTitle>
                    {selectedWatchlistData?.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedWatchlistData.description}
                      </p>
                    )}
                  </div>
                  <Dialog open={showAddSymbolDialog} onOpenChange={setShowAddSymbolDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Symbol
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Symbol</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={symbolForm.handleSubmit(onAddSymbol)} className="space-y-4">
                        <div>
                          <Label htmlFor="symbol">Symbol</Label>
                          <Input
                            id="symbol"
                            {...symbolForm.register("symbol")}
                            placeholder="EURUSD, BTCUSD, etc."
                            className="uppercase"
                          />
                          {symbolForm.formState.errors.symbol && (
                            <p className="text-sm text-red-600 mt-1">
                              {symbolForm.formState.errors.symbol.message}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="exchange">Exchange</Label>
                            <Input
                              id="exchange"
                              {...symbolForm.register("exchange")}
                              placeholder="MT5, Binance, etc."
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={symbolForm.watch("category") || ""}
                              onValueChange={(value) => symbolForm.setValue("category", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="forex">Forex</SelectItem>
                                <SelectItem value="crypto">Crypto</SelectItem>
                                <SelectItem value="indices">Indices</SelectItem>
                                <SelectItem value="commodities">Commodities</SelectItem>
                                <SelectItem value="stocks">Stocks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="name">Name (Optional)</Label>
                          <Input
                            id="name"
                            {...symbolForm.register("name")}
                            placeholder="EUR/USD Euro vs US Dollar"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="alertEnabled"
                            checked={symbolForm.watch("alertEnabled")}
                            onCheckedChange={(checked) => symbolForm.setValue("alertEnabled", checked)}
                          />
                          <Label htmlFor="alertEnabled">Enable price alerts</Label>
                        </div>
                        {symbolForm.watch("alertEnabled") && (
                          <div>
                            <Label htmlFor="alertPrice">Alert Price</Label>
                            <Input
                              id="alertPrice"
                              type="number"
                              step="0.00001"
                              {...symbolForm.register("alertPrice", { valueAsNumber: true })}
                              placeholder="1.0500"
                            />
                          </div>
                        )}
                        <div>
                          <Label htmlFor="notes">Notes</Label>
                          <Input
                            id="notes"
                            {...symbolForm.register("notes")}
                            placeholder="Trading notes..."
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddSymbolDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={addSymbolMutation.isPending}
                          >
                            Add Symbol
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {symbolsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading symbols...</p>
                    </div>
                  ) : (symbols as WatchlistSymbol[]).length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No symbols in this watchlist
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Add your first symbol to start tracking
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(symbols as WatchlistSymbol[]).map((symbol: WatchlistSymbol) => {
                        const mockData = generateMockPrice(symbol.symbol);
                        return (
                          <div
                            key={symbol.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border"
                          >
                            <div className="flex items-center space-x-3">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium text-gray-900 dark:text-white">
                                    {symbol.symbol}
                                  </h3>
                                  {symbol.category && (
                                    <CategoryBadge category={symbol.category} />
                                  )}
                                  {symbol.alertEnabled && (
                                    <Bell className="h-4 w-4 text-blue-500" />
                                  )}
                                </div>
                                {symbol.name && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {symbol.name}
                                  </p>
                                )}
                                {symbol.exchange && (
                                  <p className="text-xs text-gray-500">
                                    {symbol.exchange}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  ${mockData.currentPrice.toFixed(5)}
                                </p>
                                <div className="flex items-center space-x-1">
                                  {mockData.change >= 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                  )}
                                  <span
                                    className={`text-sm ${
                                      mockData.change >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}
                                  >
                                    {mockData.change >= 0 ? '+' : ''}
                                    {mockData.changePercent}%
                                  </span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  removeSymbolMutation.mutate({
                                    watchlistId: selectedWatchlist,
                                    symbolId: symbol.id,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a watchlist
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a watchlist from the sidebar to view its symbols
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}