import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MemoizedCardProps {
  title: string;
  content: React.ReactNode;
  className?: string;
  loading?: boolean;
}

// Optimized card component with memoization
export const MemoizedCard = memo<MemoizedCardProps>(({ 
  title, 
  content, 
  className = "", 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
});

MemoizedCard.displayName = 'MemoizedCard';