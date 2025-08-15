/**
 * UNIVERSAL COLOR CODING SYSTEM FOR PROPTRADERJOURNAL
 * Applied across ALL pages and components
 */

export interface ColorResult {
  textColor: string;
  bgColor?: string;
  borderColor?: string;
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline';
}

/**
 * Universal color coding for financial values
 * GREEN: Profits, payouts, positive ROI, remaining budget
 * RED: ALL expenses, costs, negative ROI, over-budget, losses
 * YELLOW: Budget warnings (50-80% used), low threshold, dangerous risk
 * LIGHT BLUE: Zero values only
 * BLACK text on WHITE background / WHITE text on BLACK background when colors don't apply
 */
export const getUniversalValueColor = (
  value: number, 
  context: 'profit' | 'expense' | 'budget' | 'roi' | 'balance' | 'pnl' | 'drawdown' | 'risk',
  threshold?: { warning?: number; danger?: number }
): ColorResult => {
  
  // Zero values - LIGHT BLUE
  if (value === 0) {
    return {
      textColor: 'text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950',
      borderColor: 'border-sky-300',
      badgeVariant: 'secondary'
    };
  }

  switch (context) {
    case 'profit':
    case 'pnl':
      return value > 0 
        ? { textColor: 'text-green-400', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-300', badgeVariant: 'default' }
        : { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };

    case 'expense':
      // ALL expenses are RED
      return { 
        textColor: 'text-red-400', 
        bgColor: 'bg-red-50 dark:bg-red-950', 
        borderColor: 'border-red-300', 
        badgeVariant: 'destructive' 
      };

    case 'budget':
      if (threshold) {
        const percentage = threshold.warning ? (value / threshold.warning) * 100 : 0;
        if (percentage <= 50) {
          return { textColor: 'text-green-400', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-300', badgeVariant: 'default' };
        } else if (percentage <= 80) {
          return { textColor: 'text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950', borderColor: 'border-yellow-300', badgeVariant: 'secondary' };
        } else {
          return { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };
        }
      }
      return value > 0 
        ? { textColor: 'text-green-400', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-300', badgeVariant: 'default' }
        : { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };

    case 'roi':
      return value >= 0 
        ? { textColor: 'text-green-400', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-300', badgeVariant: 'default' }
        : { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };

    case 'balance':
      return value > 0 
        ? { textColor: 'text-green-400', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-300', badgeVariant: 'default' }
        : { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };

    case 'drawdown':
      // Drawdown is always negative impact
      if (threshold) {
        const percentage = Math.abs(value / (threshold.danger || threshold.warning || 1)) * 100;
        if (percentage <= 50) {
          return { textColor: 'text-green-400', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-300', badgeVariant: 'default' };
        } else if (percentage <= 80) {
          return { textColor: 'text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950', borderColor: 'border-yellow-300', badgeVariant: 'secondary' };
        } else {
          return { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };
        }
      }
      return { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };

    case 'risk':
      if (threshold) {
        if (value <= (threshold.warning || 50)) {
          return { textColor: 'text-green-400', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-300', badgeVariant: 'default' };
        } else if (value <= (threshold.danger || 80)) {
          return { textColor: 'text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950', borderColor: 'border-yellow-300', badgeVariant: 'secondary' };
        } else {
          return { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };
        }
      }
      return { textColor: 'text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-300', badgeVariant: 'destructive' };

    default:
      // Fallback: BLACK text on WHITE background / WHITE text on BLACK background
      return { 
        textColor: 'text-gray-900 dark:text-gray-100', 
        bgColor: 'bg-white dark:bg-gray-900', 
        borderColor: 'border-gray-300 dark:border-gray-700', 
        badgeVariant: 'outline' 
      };
  }
};

/**
 * Get color for percentage-based values (budget usage, risk levels, etc.)
 */
export const getPercentageColor = (percentage: number): ColorResult => {
  if (percentage === 0) {
    return { textColor: 'text-sky-400', badgeVariant: 'secondary' };
  }
  
  if (percentage <= 50) {
    return { textColor: 'text-green-400', badgeVariant: 'default' };
  } else if (percentage <= 80) {
    return { textColor: 'text-yellow-400', badgeVariant: 'secondary' };
  } else {
    return { textColor: 'text-red-400', badgeVariant: 'destructive' };
  }
};

/**
 * Get color for status-based values
 */
export const getStatusColor = (status: string): ColorResult => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'funded':
    case 'passed':
    case 'profitable':
    case 'success':
      return { textColor: 'text-green-400', badgeVariant: 'default' };
    
    case 'failed':
    case 'breached':
    case 'loss':
    case 'negative':
      return { textColor: 'text-red-400', badgeVariant: 'destructive' };
    
    case 'warning':
    case 'caution':
    case 'pending':
      return { textColor: 'text-yellow-400', badgeVariant: 'secondary' };
    
    case 'neutral':
    case 'zero':
      return { textColor: 'text-sky-400', badgeVariant: 'secondary' };
    
    default:
      return { textColor: 'text-gray-900 dark:text-gray-100', badgeVariant: 'outline' };
  }
};

/**
 * Helper function to apply colors to currency formatting
 */
export const formatCurrencyWithColor = (
  value: number, 
  context: 'profit' | 'expense' | 'budget' | 'roi' | 'balance' | 'pnl' | 'drawdown' | 'risk',
  formatter: (value: number) => string,
  threshold?: { warning?: number; danger?: number }
): { formatted: string; color: ColorResult } => {
  const color = getUniversalValueColor(value, context, threshold);
  const formatted = formatter(value);
  
  return { formatted, color };
};