import { memo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: any[] }) => React.ReactElement;
  className?: string;
}

// Optimized virtualized list for large datasets
export const VirtualizedList = memo<VirtualizedListProps>(({ 
  items, 
  itemHeight, 
  renderItem, 
  className = "h-96" 
}) => {
  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => (
    renderItem({ index, style, data: items })
  ), [items, renderItem]);

  if (!items.length) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <p className="text-gray-500">No items to display</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
            itemData={items}
          >
            {ItemRenderer}
          </List>
        )}
      </AutoSizer>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';