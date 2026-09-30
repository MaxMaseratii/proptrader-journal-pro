import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Bell, Check, Settings, X, AlertTriangle, CheckCircle, Info, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";

interface NotificationDropdownProps {
  className?: string;
}

const getNotificationIcon = (type: string, priority: string) => {
  if (priority === 'urgent') return <AlertTriangle className="h-4 w-4 text-red-500" />;
  
  switch (type) {
    case 'account_milestone':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'payout_ready':
      return <Star className="h-4 w-4 text-yellow-400" />;
    case 'risk_warning':
      return <AlertTriangle className="h-4 w-4 text-orange-400" />;
    case 'achievement':
      return <Star className="h-4 w-4 text-purple-400" />;
    default:
      return <Info className="h-4 w-4 text-blue-400" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'normal': return 'bg-blue-500';
    case 'low': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

export default function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest(`/api/notifications/${notificationId}/read`, "PATCH", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/notifications/mark-all-read", "PATCH", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative p-2 hover:bg-gray-800 ${className}`}
        >
          <Bell className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
          {hasUnread && (
            <Badge 
              className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold text-white ${
                unreadCount > 9 ? 'text-[10px]' : ''
              } bg-red-500 hover:bg-red-500`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-gray-900 border-gray-700 text-white max-h-96"
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <DropdownMenuLabel className="text-white font-semibold">
            Notifications
          </DropdownMenuLabel>
          <div className="flex items-center gap-2">
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 h-auto p-1"
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white h-auto p-1"
              onClick={() => {
                // Navigate to notification settings page
                window.location.href = '/profile#notifications';
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">You'll see important updates here</p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.slice(0, 20).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`
                    flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-800 border-l-2 transition-colors
                    ${notification.isRead ? 'border-transparent' : `border-l-2 ${getPriorityColor(notification.priority)}`}
                    ${!notification.isRead ? 'bg-gray-800/50' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    
                    <p className={`text-xs mt-1 ${!notification.isRead ? 'text-gray-300' : 'text-gray-400'}`}>
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
              
              {notifications.length > 20 && (
                <DropdownMenuItem className="text-center py-3 text-blue-400 hover:text-blue-300 hover:bg-gray-800">
                  <Button variant="ghost" size="sm" className="w-full text-blue-400 hover:text-blue-300">
                    View all notifications
                  </Button>
                </DropdownMenuItem>
              )}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-gray-700" />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
                onClick={() => {
                  // Navigate to notification settings
                  window.location.href = '/profile#notifications';
                }}
              >
                <Settings className="h-3 w-3 mr-2" />
                Notification Settings
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}