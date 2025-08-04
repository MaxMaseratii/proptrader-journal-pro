import { useTheme } from "@/components/theme-provider";

export function useWidgetStyling() {
  const { theme } = useTheme();
  
  const getWidgetBackground = () => {
    // Return empty string to let widgets use their original specific colors
    return '';
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