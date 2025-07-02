import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Grip, X, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface DashboardWidgetProps {
  id: string;
  title: string;
  type: 'chart' | 'stats' | 'table' | 'custom';
  children: React.ReactNode;
  isEditing?: boolean;
  isExpanded?: boolean;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onExpand?: (id: string) => void;
  className?: string;
  dragHandleProps?: any;
}

export function DashboardWidget({
  id,
  title,
  type,
  children,
  isEditing = false,
  isExpanded = false,
  onRemove,
  onEdit,
  onExpand,
  className = "",
  dragHandleProps
}: DashboardWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={`
        relative transition-all duration-200 hover:shadow-lg
        ${isEditing ? 'border-prop-gold ring-2 ring-prop-gold/20' : 'border-gray-600'}
        ${isExpanded ? 'col-span-2 row-span-2' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isEditing && (
              <div 
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-700 rounded"
              >
                <Grip className="h-4 w-4 text-gray-400" />
              </div>
            )}
            <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {type}
            </Badge>
          </div>
          
          {(isEditing || isHovered) && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onExpand?.(id)}
                className="h-8 w-8 p-0 hover:bg-gray-700"
              >
                {isExpanded ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-700"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600">
                  <DropdownMenuItem 
                    onClick={() => onEdit?.(id)}
                    className="text-white hover:bg-gray-700"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onRemove?.(id)}
                    className="text-red-400 hover:bg-red-900/20"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={`${isExpanded ? 'h-96' : 'h-48'} overflow-hidden`}>
        {children}
      </CardContent>
    </Card>
  );
}

export default DashboardWidget;