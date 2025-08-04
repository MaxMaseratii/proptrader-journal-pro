import { useTheme } from "@/components/theme-provider";

export function useWidgetStyling() {
  const { theme } = useTheme();
  
  const getWidgetBackground = () => {
    if (theme === 'light') {
      return 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-50 border-amber-200';
    }
    return 'bg-gray-900/80 border-gray-700 backdrop-blur-sm';
  };

  const getWidgetTextColor = (type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning') => {
    switch (type) {
      case 'primary':
        return theme === 'light' ? 'text-gray-900' : 'text-white';
      case 'secondary':
        return theme === 'light' ? 'text-gray-600' : 'text-gray-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return theme === 'light' ? 'text-gray-900' : 'text-white';
    }
  };

  return {
    getWidgetBackground,
    getWidgetTextColor
  };
}