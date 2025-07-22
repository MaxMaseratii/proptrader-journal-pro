import { apiRequest } from "@/lib/queryClient";
import type { InsertNotification } from "@shared/schema";

// Notification helper functions for creating common notifications
export class NotificationService {
  
  static async createAccountMilestone(
    title: string, 
    message: string, 
    accountData?: any,
    actionUrl?: string
  ) {
    const notification: Omit<InsertNotification, 'userId'> = {
      type: 'account_milestone',
      title,
      message,
      data: accountData ? JSON.stringify(accountData) : null,
      priority: 'high',
      actionUrl,
    };
    
    return apiRequest("/api/notifications", "POST", notification);
  }

  static async createPayoutAlert(
    title: string,
    message: string,
    payoutData?: any,
    actionUrl?: string
  ) {
    const notification: Omit<InsertNotification, 'userId'> = {
      type: 'payout_ready',
      title,
      message,
      data: payoutData ? JSON.stringify(payoutData) : null,
      priority: 'high',
      actionUrl,
    };
    
    return apiRequest("/api/notifications", "POST", notification);
  }

  static async createRiskWarning(
    title: string,
    message: string,
    riskData?: any,
    actionUrl?: string
  ) {
    const notification: Omit<InsertNotification, 'userId'> = {
      type: 'risk_warning',
      title,
      message,
      data: riskData ? JSON.stringify(riskData) : null,
      priority: 'urgent',
      actionUrl,
    };
    
    return apiRequest("/api/notifications", "POST", notification);
  }

  static async createAchievementNotification(
    title: string,
    message: string,
    achievementData?: any,
    actionUrl?: string
  ) {
    const notification: Omit<InsertNotification, 'userId'> = {
      type: 'achievement',
      title,
      message,
      data: achievementData ? JSON.stringify(achievementData) : null,
      priority: 'normal',
      actionUrl,
    };
    
    return apiRequest("/api/notifications", "POST", notification);
  }

  static async createSystemUpdate(
    title: string,
    message: string,
    updateData?: any,
    actionUrl?: string
  ) {
    const notification: Omit<InsertNotification, 'userId'> = {
      type: 'system_update',
      title,
      message,
      data: updateData ? JSON.stringify(updateData) : null,
      priority: 'normal',
      actionUrl,
    };
    
    return apiRequest("/api/notifications", "POST", notification);
  }

  // Monitor account progress and create notifications
  static async checkAccountMilestones(accountId: number, currentBalance: number, trades: any[]) {
    try {
      // This would typically be called after trade creation/update
      // Check for various milestones and create notifications accordingly
      
      // Example: Check if profit target is reached
      const account = await apiRequest(`/api/accounts/${accountId}`, "GET");
      if (account && currentBalance >= account.profitTarget) {
        await this.createAccountMilestone(
          "🎯 Profit Target Reached!",
          `Congratulations! You've reached your profit target of $${account.profitTarget.toLocaleString()}.`,
          { accountId, currentBalance, profitTarget: account.profitTarget },
          `/accounts/${accountId}`
        );
      }

      // Check for risk violations
      const dailyPnL = trades
        .filter(t => new Date(t.date).toDateString() === new Date().toDateString())
        .reduce((sum, t) => sum + t.pnl, 0);
      
      if (account.dailyLossLimit && Math.abs(dailyPnL) >= account.dailyLossLimit * 0.8) {
        await this.createRiskWarning(
          "⚠️ Daily Loss Limit Warning",
          `You're approaching your daily loss limit. Current daily P&L: $${dailyPnL.toFixed(2)}`,
          { accountId, dailyPnL, dailyLossLimit: account.dailyLossLimit },
          `/accounts/${accountId}`
        );
      }

    } catch (error) {
      console.error("Error checking account milestones:", error);
    }
  }
}