import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, BellOff, CheckCircle, Circle, Settings, TrendingUp, TrendingDown, AlertTriangle, Trophy, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

interface NotificationSettings {
  id: number;
  userId: string;
  emailNotifications: boolean;
  accountMilestones: boolean;
  payoutAlerts: boolean;
  riskWarnings: boolean;
  systemUpdates: boolean;
  achievementNotifications: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly';
}

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'account_milestone':
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case 'payout_ready':
      return <DollarSign className="h-5 w-5 text-blue-500" />;
    case 'risk_warning':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'achievement':
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 'system_update':
      return <Settings className="h-5 w-5 text-gray-500" />;
    default:
      return <Bell className="h-5 w-5 text-blue-500" />;
  }
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const variants = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  return (
    <Badge className={variants[priority as keyof typeof variants] || variants.medium}>
      {priority.toUpperCase()}
    </Badge>
  );
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/notifications'],
  });

  // Fetch notification settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/notification-settings'],
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Update notification settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<NotificationSettings>) => 
      fetch('/api/notification-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-settings'] });
    }
  });

  // Generate sample notifications mutation
  const generateSampleMutation = useMutation({
    mutationFn: () => 
      fetch('/api/notifications/sample', {
        method: 'POST',
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const unreadCount = (notifications as Notification[]).filter((n: Notification) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Bell className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with your trading performance and account status
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white px-3 py-1 text-sm">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('notifications')}
            className="flex items-center space-x-2"
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                  variant="outline"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
                <Button
                  onClick={() => generateSampleMutation.mutate()}
                  disabled={generateSampleMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  Generate Sample Notifications
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {notificationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading notifications...</p>
                </div>
              ) : (notifications as Notification[]).length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No notifications yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      You're all caught up! We'll notify you of important updates here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                (notifications as Notification[]).map((notification: Notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all duration-200 hover:shadow-md ${
                      !notification.isRead 
                        ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                        : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <NotificationIcon type={notification.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </h3>
                              <PriorityBadge priority={notification.priority} />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              <Circle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure which notifications you'd like to receive
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {settingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading settings...</p>
                  </div>
                ) : (
                  <>
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={(settings as NotificationSettings)?.emailNotifications || false}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ emailNotifications: checked })
                        }
                      />
                    </div>

                    <Separator />

                    {/* Account Milestones */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Account Milestones</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Notifications for profit targets, drawdown limits, etc.
                        </p>
                      </div>
                      <Switch
                        checked={(settings as NotificationSettings)?.accountMilestones || false}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ accountMilestones: checked })
                        }
                      />
                    </div>

                    <Separator />

                    {/* Payout Alerts */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Payout Alerts</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Notifications when payouts are ready or processed
                        </p>
                      </div>
                      <Switch
                        checked={(settings as NotificationSettings)?.payoutAlerts || false}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ payoutAlerts: checked })
                        }
                      />
                    </div>

                    <Separator />

                    {/* Risk Warnings */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Risk Warnings</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Critical alerts for risk management and violations
                        </p>
                      </div>
                      <Switch
                        checked={(settings as NotificationSettings)?.riskWarnings || false}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ riskWarnings: checked })
                        }
                      />
                    </div>

                    <Separator />

                    {/* Achievement Notifications */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Achievement Notifications</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Celebrate your trading milestones and achievements
                        </p>
                      </div>
                      <Switch
                        checked={(settings as NotificationSettings)?.achievementNotifications || false}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ achievementNotifications: checked })
                        }
                      />
                    </div>

                    <Separator />

                    {/* System Updates */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">System Updates</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Platform updates, maintenance, and new features
                        </p>
                      </div>
                      <Switch
                        checked={(settings as NotificationSettings)?.systemUpdates || false}
                        onCheckedChange={(checked) =>
                          updateSettingsMutation.mutate({ systemUpdates: checked })
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}