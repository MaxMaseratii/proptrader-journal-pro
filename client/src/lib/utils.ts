import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  if (amount === 0 || amount === '' || amount === null || amount === undefined) return '';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === 0) return '';
  return numAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export function formatCurrencyWithZero(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export function formatPercentage(value: number): string {
  if (value === 0) return '';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatPercentageWithZero(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  if (value === 0) return '';
  return value.toLocaleString();
}

export function formatNumberWithZero(value: number): string {
  return value.toLocaleString();
}

export function formatDate(date: string | Date): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
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
