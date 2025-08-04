import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function WidgetCard({ 
  title, 
  children, 
  className,
  headerClassName,
  contentClassName
}: WidgetCardProps) {
  const { theme } = useTheme();
  const resolvedTheme = theme === 'auto' ? 
    (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
    theme;

  const cardBackground = resolvedTheme === 'light' 
    ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-50 border-amber-200'
    : 'bg-gray-900/80 border-gray-700';

  return (
    <Card className={cn(cardBackground, "backdrop-blur-sm", className)}>
      {title && (
        <CardHeader className={cn("pb-2", headerClassName)}>
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("pt-2", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}