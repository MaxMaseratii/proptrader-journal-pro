import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  // Keep original widget colors - use default background that inherits proper colors
  return (
    <Card className={cn("backdrop-blur-sm", className)}>
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