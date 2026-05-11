"use client";

import { useState } from "react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { ChipCard } from "../components/ChipCard";
import { routes } from "@/app/routes";
import { ChipsWithStats } from "@/supabase/types";
import { PAGE_SIZE } from "./constants";
import { fetchChips } from "./actions";

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
}: {
  initialChips: ChipsWithStats[];
}) {
  const [chips, setChips] = useState<ChipsWithStats[]>(initialChips);
  const [offset, setOffset] = useState(initialChips.length);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialChips.length >= PAGE_SIZE);
  //const [isPending, startTransition] = useTransition();

  const { ref: sentinelRef } = useInView({
    threshold: 1,
    rootMargin: "400px",
    onChange: async (inView) => {
      if (hasMore && inView && !isLoading) {
        setIsLoading(true);
        const newChips = await fetchChips(offset);
        if (newChips.length < PAGE_SIZE) setHasMore(false);
        setChips((prev) => [...prev, ...newChips]);
        setOffset((prev) => newChips.length + prev);
        setIsLoading(false);
      }
    },
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
