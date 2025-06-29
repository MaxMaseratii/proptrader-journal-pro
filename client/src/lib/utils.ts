import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function calculateWinRate(wins: number, total: number): number {
  return total > 0 ? (wins / total) * 100 : 0;
}

export function calculateDrawdown(starting: number, current: number): number {
  return ((starting - current) / starting) * 100;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-success-green';
    case 'warning':
      return 'text-warning-orange';
    case 'danger':
      return 'text-error-red';
    default:
      return 'text-gray-400';
  }
}
