import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  firm: z.string().min(1, "Prop firm is required"),
  type: z.enum(["challenge", "funded", "live"]),
  status: z.enum(["active", "inactive", "paused"]).default("active"),
  startingBalance: z.number().min(1, "Starting balance must be greater than 0"),
  profitTarget: z.number().min(1, "Profit target must be greater than 0"),
  maxDrawdown: z.number().min(1, "Max drawdown must be greater than 0"),
  hasDailyLossLimit: z.boolean().default(false),
  dailyLossLimit: z.number().nullable().optional(),
  riskPerTrade: z.number().min(0.1).max(10).default(2),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  buttonText?: string;
  buttonClassName?: string;
  triggerButton?: boolean;
}

export function AccountFormModal({ 
  isOpen, 
  onClose, 
  buttonText = "Create New Account", 
  buttonClassName = "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700",
  triggerButton = false 
}: AccountFormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      firm: "",
      type: "challenge",
      status: "active",
      startingBalance: 25000,
      profitTarget: 2500,
      maxDrawdown: 2500,
      hasDailyLossLimit: false,
      dailyLossLimit: null,
      riskPerTrade: 2,
    },
  });

  const isModalOpen = triggerButton ? internalOpen : isOpen;
  const closeModal = triggerButton ? () => setInternalOpen(false) : onClose;

  const createAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      return apiRequest('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      form.reset();
      closeModal();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountFormData) => {
    createAccountMutation.mutate(data);
  };

  const TriggerButtonComponent = triggerButton ? (
    <Button 
      onClick={() => setInternalOpen(true)}
      className={buttonClassName}
    >
      <Plus className="w-4 h-4 mr-2" />
      {buttonText}
    </Button>
  ) : null;

  return (
    <>
      {TriggerButtonComponent}
      
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Create New Trading Account</DialogTitle>
            <DialogDescription className="text-gray-400">
              Set up a new trading account with proper risk management and financial tracking.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[80vh] px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                    <TabsTrigger value="rules">Rules & Risk</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Account Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="My Trading Account" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="firm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Prop Firm</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="FTMO, TopstepTrader, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Account Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="challenge">Challenge</SelectItem>
                                <SelectItem value="funded">Funded</SelectItem>
                                <SelectItem value="live">Live</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="financial" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="startingBalance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Starting Balance ($)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number"
                                className="bg-gray-800 border-gray-600 text-white"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="profitTarget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Profit Target ($)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number"
                                className="bg-gray-800 border-gray-600 text-white"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxDrawdown"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Max Drawdown ($)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number"
                                className="bg-gray-800 border-gray-600 text-white"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="hasDailyLossLimit"
                          checked={form.watch("hasDailyLossLimit")}
                          onChange={(e) => form.setValue("hasDailyLossLimit", e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="hasDailyLossLimit" className="text-white">
                          Enable Daily Loss Limit
                        </Label>
                      </div>
                      {form.watch("hasDailyLossLimit") && (
                        <FormField
                          control={form.control}
                          name="dailyLossLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Daily Loss Limit ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number"
                                  value={field.value || ""}
                                  className="bg-gray-800 border-gray-600 text-white"
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="rules" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="riskPerTrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Risk Per Trade (%)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              step="0.1"
                              min="0.1"
                              max="10"
                              className="bg-gray-800 border-gray-600 text-white"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createAccountMutation.isPending}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700"
                  >
                    {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper components for different button variations
export function CreateFirstAccountButton({ className = "" }: { className?: string }) {
  return (
    <AccountFormModal
      isOpen={false}
      onClose={() => {}}
      buttonText="+ Create First Account"
      buttonClassName={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700 ${className}`}
      triggerButton={true}
    />
  );
}

export function AddAccountButton({ className = "" }: { className?: string }) {
  return (
    <AccountFormModal
      isOpen={false}
      onClose={() => {}}
      buttonText="+ Add Account"
      buttonClassName={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700 ${className}`}
      triggerButton={true}
    />
  );
}

export function NewAccountButton({ className = "" }: { className?: string }) {
  return (
    <AccountFormModal
      isOpen={false}
      onClose={() => {}}
      buttonText="+ New Account"
      buttonClassName={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700 ${className}`}
      triggerButton={true}
    />
  );
}

export default AccountFormModal;