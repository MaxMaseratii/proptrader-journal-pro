export interface ColorResult {
  textColor: string;
  bgColor?: string;
  borderColor?: string;
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline';
}

// COLOR CODING: GREEN=profits, RED=expenses/losses, YELLOW=warnings, BLUE=zero
export const getUniversalValueColor = (
  value: number, 
  context: 'profit' | 'expense' | 'budget' | 'roi' | 'balance' | 'pnl' | 'drawdown' | 'risk',
  threshold?: { warning?: number; danger?: number }
): ColorResult => {
  if (value === 0) {
    return { textColor: 'text-sky-400', bgColor: 'bg-sky-50 dark:bg-sky-950', borderColor: 'border-sky-300', badgeVariant: 'secondary' };
  }

  switch (context) {
    case 'profit':
    case 'pnl':
      return value > 0 
        ? { textColor: 'text-green-400', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-300', badgeVariant: 'default' }
        : { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };
    case 'expense':
      return { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };
    case 'budget':
      if (threshold) {
        const percentage = threshold.warning ? (value / threshold.warning) * 100 : 0;
        if (percentage <= 50) return { textColor: 'text-green-400', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-300', badgeVariant: 'default' };
        if (percentage <= 80) return { textColor: 'text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950', borderColor: 'border-yellow-300', badgeVariant: 'secondary' };
        return { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };
      }
      return value > 0 ? { textColor: 'text-green-400', badgeVariant: 'default' } : { textColor: 'text-red-400', badgeVariant: 'destructive' };
    default:
      return { textColor: 'text-gray-900 dark:text-gray-100', bgColor: 'bg-white dark:bg-gray-900', badgeVariant: 'outline' };
  }
};

export const getStatusColor = (status: string): ColorResult => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'funded':
    case 'success': return { textColor: 'text-green-400', badgeVariant: 'default' };
    case 'failed':
    case 'loss': return { textColor: 'text-red-400', badgeVariant: 'destructive' };
    case 'warning':
    case 'pending': return { textColor: 'text-yellow-400', badgeVariant: 'secondary' };
    default: return { textColor: 'text-gray-900 dark:text-gray-100', badgeVariant: 'outline' };
  }
};
