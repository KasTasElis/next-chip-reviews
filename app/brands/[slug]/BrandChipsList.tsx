"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ChipCard } from "@/app/components/ChipCard";
import { ChipsEmptyState } from "@/app/components/ChipsEmptyState";
import { routes } from "@/app/routes";
import type { ChipsWithStats } from "@/supabase/types";
import { PAGE_SIZE } from "@/app/chips/constants";
import { fetchBrandChips } from "./actions";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";

function ChipCardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-sm">
      <figure className="relative h-48">
        <div className="skeleton w-full h-full rounded-none" />
      </figure>
      <div className="card-body gap-2">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-4 w-32" />
      </div>
    </div>
  );
}

export function BrandChipsList({
  initialChips,
  brandId,
}: {
  initialChips: ChipsWithStats[];
  brandId: string;
}) {
  const fetchFn = useCallback(
    (offset: number) => fetchBrandChips(brandId, offset),
    [brandId],
  );

  const { items: chips, isLoading, hasMore, sentinelRef } = useInfiniteScroll({
    initialItems: initialChips,
    pageSize: PAGE_SIZE,
    fetchFn,
    rootMargin: "400px",
  });

  if (!chips.length && !isLoading) {
    return <ChipsEmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {chips.map((chip) => (
          <Link
            key={chip.id}
            href={`${routes.chips}/${chip.slug}`}
            className="hover:opacity-80 transition"
          >
            <ChipCard chip={chip} />
          </Link>
        ))}
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <ChipCardSkeleton key={i} />
          ))}
      </div>

      <div ref={sentinelRef} />

      {!hasMore && chips.length > 0 && (
        <p className="text-center text-sm opacity-50 py-4">No more chips</p>
      )}
    </>
  );
}
