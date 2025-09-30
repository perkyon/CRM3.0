import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; item: T }) => React.ReactNode;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  onScroll,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback(({ scrollTop: newScrollTop }: { scrollTop: number }) => {
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    return renderItem({ index, style, item });
  }, [items, renderItem]);

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        onScroll={handleScroll}
        overscanCount={5}
      >
        {ItemRenderer}
      </List>
    </div>
  );
}

// Hook for virtualized data
export function useVirtualizedData<T>(
  data: T[],
  pageSize: number = 50
) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: pageSize });
  const [isLoading, setIsLoading] = useState(false);

  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end);
  }, [data, visibleRange]);

  const loadMore = useCallback(() => {
    if (isLoading || visibleRange.end >= data.length) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setVisibleRange(prev => ({
        start: prev.start,
        end: Math.min(prev.end + pageSize, data.length),
      }));
      setIsLoading(false);
    }, 100);
  }, [data.length, visibleRange.end, pageSize, isLoading]);

  return {
    visibleItems,
    hasMore: visibleRange.end < data.length,
    isLoading,
    loadMore,
    totalCount: data.length,
  };
}
