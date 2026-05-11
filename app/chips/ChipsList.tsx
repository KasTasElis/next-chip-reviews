"use client";

import Link from "next/link";
import { ChipCard } from "../components/ChipCard";
import { routes } from "@/app/routes";
import { ChipsWithStats } from "@/supabase/types";
import { PAGE_SIZE } from "./constants";
import { fetchChips, SortableChipColumn } from "./actions";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";
import { useCallback } from "react";

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

export function ChipsList({
  initialChips,
  sortBy,
  sortOrder,
  minRating,
}: {
  initialChips: ChipsWithStats[];
  sortBy?: SortableChipColumn;
  sortOrder?: "asc" | "desc";
  minRating?: number;
}) {
  const fetchFn = useCallback(
    (offset: number) => fetchChips({ offset, sortBy, sortOrder, minRating }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const {
    items: chips,
    isLoading,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll({
    initialItems: initialChips,
    pageSize: PAGE_SIZE,
    fetchFn,
    rootMargin: "400px",
  });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {chips.map((chip) => (
          <Link
            href={`${routes.chips}/${chip.slug}`}
            key={chip.id}
            className="hover:opacity-80 transition h-full"
          >
            <ChipCard chip={chip} />
          </Link>
        ))}

        {isLoading
          ? Array.from({ length: 16 }).map((_, i) => (
              <ChipCardSkeleton key={i} />
            ))
          : null}
      </div>

      <div ref={sentinelRef} />

      {!hasMore && chips.length > 0 && (
        <p className="text-center text-sm opacity-50 py-4">No more chips</p>
      )}
    </>
  );
}
