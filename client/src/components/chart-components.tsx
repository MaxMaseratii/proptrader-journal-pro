import { useEffect, useRef } from "react";
import { useTheme } from '@/contexts/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EquityChartProps {
  data: { date: string; balance: number }[];
}

export function EquityChart({ data }: EquityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Theme-aware colors - CRITICAL FIX FOR LIGHT MODE TEXT
    const isLight = theme === 'light';
    const colors = {
      borderColor: isLight ? '#1976D2' : '#B78E35',
      backgroundColor: isLight ? 'rgba(25, 118, 210, 0.1)' : 'rgba(183, 142, 53, 0.1)',
      gridColor: isLight ? '#E0E0E0' : '#404040',
      textColor: isLight ? '#000000' : '#FFFFFF', // BLACK TEXT FOR LIGHT MODE
      tooltipBg: isLight ? '#FFFFFF' : '#2D2D2D',
      tooltipText: isLight ? '#000000' : '#FFFFFF',
      tooltipBorder: isLight ? '#E0E0E0' : '#404040'
    };

    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Account Balance',
          data: data.map(d => d.balance),
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor,
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `$${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: colors.gridColor
            },
            ticks: {
              color: colors.textColor
            }
          },
          y: {
            grid: {
              color: colors.gridColor
            },
            ticks: {
              color: colors.textColor,
              callback: function(value) {
                return '$' + (value as number).toLocaleString();
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, theme]);

  return <canvas ref={canvasRef} />;
}

interface MonthlyPerformanceChartProps {
  data: { month: string; pnl: number }[];
}

export function MonthlyPerformanceChart({ data }: MonthlyPerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Theme-aware colors
    const isLight = theme === 'light';
    const colors = {
      positiveColor: isLight ? '#28a745' : '#4ade80',
      negativeColor: isLight ? '#dc3545' : '#f87171',
      gridColor: isLight ? '#E0E0E0' : '#404040',
      textColor: isLight ? '#000000' : '#FFFFFF', // BLACK TEXT FOR LIGHT MODE
      tooltipBg: isLight ? '#FFFFFF' : '#2D2D2D',
      tooltipText: isLight ? '#000000' : '#FFFFFF',
      tooltipBorder: isLight ? '#E0E0E0' : '#404040'
    };

    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Monthly P&L',
          data: data.map(d => d.pnl),
          backgroundColor: data.map(d => d.pnl >= 0 ? colors.positiveColor : colors.negativeColor),
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `$${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: colors.textColor
            }
          },
          y: {
            grid: {
              color: colors.gridColor
            },
            ticks: {
              color: colors.textColor,
              callback: function(value) {
                return '$' + (value as number).toLocaleString();
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, theme]);

  return <canvas ref={canvasRef} />;
}
