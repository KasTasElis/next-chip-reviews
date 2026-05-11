"use client";

import { useState } from "react";
import { useInView } from "react-intersection-observer";

export function useInfiniteScroll<T>({
  initialItems,
  pageSize,
  fetchFn,
  threshold = 1,
  rootMargin = "200px",
}: {
  initialItems: T[];
  pageSize: number;
  fetchFn: (offset: number) => Promise<T[]>;
  threshold?: number;
  rootMargin?: string;
}) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [offset, setOffset] = useState(initialItems.length);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= pageSize);

  const { ref: sentinelRef } = useInView({
    threshold,
    rootMargin,
    onChange: async (inView) => {
      if (hasMore && inView && !isLoading) {
        setIsLoading(true);
        const newItems = await fetchFn(offset);
        if (newItems.length < pageSize) setHasMore(false);
        setItems((prev) => [...prev, ...newItems]);
        setOffset((prev) => prev + newItems.length);
        setIsLoading(false);
      }
    },
  });

  return { items, isLoading, hasMore, sentinelRef };
}
