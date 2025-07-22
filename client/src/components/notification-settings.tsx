import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Bell, Shield, TrendingUp, Award, Settings } from "lucide-react";
import type { UserNotificationSettings } from "@shared/schema";

export default function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<UserNotificationSettings>({
    queryKey: ["/api/notification-settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<UserNotificationSettings>) => {
      return apiRequest("/api/notification-settings", "PATCH", updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-settings"] });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: keyof UserNotificationSettings, value: boolean | string) => {
    if (!settings) return;
    
    updateSettingsMutation.mutate({
      [key]: value,
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gradient-rainbow">Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-gradient-rainbow flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Manage how and when you receive notifications about your trading activities.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-400" />
            <h3 className="text-white font-medium">Email Notifications</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="text-gray-300">
              Enable email notifications
            </Label>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          {settings.emailNotifications && (
            <div className="ml-4 space-y-2">
              <Label className="text-gray-400 text-sm">Email frequency</Label>
              <Select
                value={settings.emailFrequency}
                onValueChange={(value) => handleSettingChange('emailFrequency', value)}
                disabled={updateSettingsMutation.isPending}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily summary</SelectItem>
                  <SelectItem value="weekly">Weekly summary</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Notification Categories */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-yellow-400" />
            <h3 className="text-white font-medium">Notification Types</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <div>
                  <Label className="text-gray-300">Account Milestones</Label>
                  <p className="text-xs text-gray-500">Profit targets, passing challenges, account upgrades</p>
                </div>
              </div>
              <Switch
                checked={settings.accountMilestones}
                onCheckedChange={(checked) => handleSettingChange('accountMilestones', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-400" />
                <div>
                  <Label className="text-gray-300">Payout Alerts</Label>
                  <p className="text-xs text-gray-500">Payout eligibility and payout completions</p>
                </div>
              </div>
              <Switch
                checked={settings.payoutAlerts}
                onCheckedChange={(checked) => handleSettingChange('payoutAlerts', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-400" />
                <div>
                  <Label className="text-gray-300">Risk Warnings</Label>
                  <p className="text-xs text-gray-500">Daily loss limits, drawdown warnings, rule violations</p>
                </div>
              </div>
              <Switch
                checked={settings.riskWarnings}
                onCheckedChange={(checked) => handleSettingChange('riskWarnings', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-400" />
                <div>
                  <Label className="text-gray-300">System Updates</Label>
                  <p className="text-xs text-gray-500">Platform updates, new features, maintenance notices</p>
                </div>
              </div>
              <Switch
                checked={settings.systemUpdates}
                onCheckedChange={(checked) => handleSettingChange('systemUpdates', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-400" />
                <div>
                  <Label className="text-gray-300">Achievement Notifications</Label>
                  <p className="text-xs text-gray-500">Unlocked achievements and milestone rewards</p>
                </div>
              </div>
              <Switch
                checked={settings.achievementNotifications}
                onCheckedChange={(checked) => handleSettingChange('achievementNotifications', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
          </div>
        </div>

        {/* Test Notification */}
        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={() => {
              // Create a test notification
              const testNotification = {
                type: 'system_update',
                title: 'Test Notification',
                message: 'This is a test notification to verify your settings are working correctly.',
                priority: 'normal',
              };
              
              apiRequest("/api/notifications", "POST", testNotification)
                .then(() => {
                  toast({
                    title: "Test Notification Sent",
                    description: "Check your notifications to see the test message.",
                  });
                })
                .catch(() => {
                  toast({
                    title: "Test Failed",
                    description: "Failed to send test notification.",
                    variant: "destructive",
                  });
                });
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            disabled={updateSettingsMutation.isPending}
          >
            Send Test Notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}