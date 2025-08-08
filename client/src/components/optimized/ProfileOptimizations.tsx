import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Lightweight profile components to improve loading speed

export const ProfileSkeleton = memo(() => (
  <div className="min-h-screen bg-dark-bg text-white p-6">
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2 mb-8"></div>
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

export const ProfileCardSkeleton = memo(() => (
  <Card className="bg-gray-800 border-gray-700">
    <CardContent className="p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </CardContent>
  </Card>
));

ProfileSkeleton.displayName = 'ProfileSkeleton';
ProfileCardSkeleton.displayName = 'ProfileCardSkeleton';