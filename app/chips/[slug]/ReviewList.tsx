"use client";

import { useCallback } from "react";
import ReviewCard from "./ReviewCard";
import type { ReviewWithProfile, SortableReviewColumn } from "./queries";
import { REVIEWS_PAGE_SIZE } from "./constants";
import { fetchReviews } from "./actions";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";

function ReviewCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-base-100 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="skeleton w-8 h-8 rounded-full" />
        <div className="skeleton h-4 w-24" />
      </div>
      <div className="skeleton h-4 w-20" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
    </div>
  );
}

export default function ReviewList({
  initialReviews,
  userId,
  chipId,
  sortBy,
  sortOrder,
}: {
  initialReviews: ReviewWithProfile[];
  userId: string | null;
  chipId: string;
  sortBy: SortableReviewColumn;
  sortOrder: "asc" | "desc";
}) {
  const fetchFn = useCallback(
    (offset: number) => fetchReviews(chipId, offset, sortBy, sortOrder),
    [chipId, sortBy, sortOrder],
  );

  const { items: reviews, isLoading, hasMore, sentinelRef } = useInfiniteScroll({
    initialItems: initialReviews,
    pageSize: REVIEWS_PAGE_SIZE,
    fetchFn,
  });

  if (!reviews.length && !isLoading) {
    return <p className="text-sm opacity-50">No reviews yet. Be the first!</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {reviews.map((r) => (
          <ReviewCard key={r.id} review={r} userId={userId} />
        ))}
        {isLoading && (
          <>
            <ReviewCardSkeleton />
            <ReviewCardSkeleton />
          </>
        )}
      </div>

      <div ref={sentinelRef} />

      {!hasMore && reviews.length > 0 && (
        <p className="text-center text-sm opacity-50 py-4">No more reviews</p>
      )}
    </>
  );
}
