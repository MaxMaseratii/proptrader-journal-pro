import { apiRequest } from "@/lib/queryClient";

export class NotificationService {
  static async createAccountMilestone(title: string, message: string, accountData?: any, actionUrl?: string) {
    return apiRequest("/api/notifications", "POST", { type: 'account_milestone', title, message, data: accountData ? JSON.stringify(accountData) : null, priority: 'high', actionUrl });
  }

  static async createPayoutAlert(title: string, message: string, payoutData?: any, actionUrl?: string) {
    return apiRequest("/api/notifications", "POST", { type: 'payout_ready', title, message, data: payoutData ? JSON.stringify(payoutData) : null, priority: 'high', actionUrl });
  }

  static async createRiskWarning(title: string, message: string, riskData?: any, actionUrl?: string) {
    return apiRequest("/api/notifications", "POST", { type: 'risk_warning', title, message, data: riskData ? JSON.stringify(riskData) : null, priority: 'urgent', actionUrl });
  }

  static async checkAccountMilestones(accountId: number, currentBalance: number, trades: any[]) {
    try {
      const account = await apiRequest(`/api/accounts/${accountId}`, "GET");
      if (account && currentBalance >= account.profitTarget) {
        await this.createAccountMilestone("🎯 Profit Target!", `Reached $${account.profitTarget.toLocaleString()}`, { accountId, currentBalance }, `/accounts/${accountId}`);
      }
    } catch (error) {
      console.error("Error checking milestones:", error);
    }
  }
}
