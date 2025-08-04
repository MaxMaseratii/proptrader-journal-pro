import { useTheme } from "@/components/theme-provider";

export function useWidgetStyling() {
  const { theme } = useTheme();
  
  const getWidgetBackground = () => {
    if (theme === 'light') {
      return 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border-amber-200/50';
    }
    return 'bg-black/30 border-gray-700/50';
  };

  const getContentBackground = () => {
    if (theme === 'light') {
      return 'bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100';
    }
    return 'bg-background';
  };

  return {
    getWidgetBackground,
    getContentBackground
  };
}