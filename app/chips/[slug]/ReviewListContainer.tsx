"use client";

import { useState, useTransition } from "react";
import ReviewList from "./ReviewList";
import { fetchReviews } from "./actions";
import type { ReviewWithProfile, SortableReviewColumn } from "./queries";

const SORT_OPTIONS: { label: string; value: SortableReviewColumn }[] = [
  { label: "Most Liked", value: "likes_count" },
  { label: "Date Created", value: "created_at" },
];

export default function ReviewListContainer({
  initialReviews,
  userId,
  chipId,
}: {
  initialReviews: ReviewWithProfile[];
  userId: string | null;
  chipId: string;
}) {
  const [sortBy, setSortBy] = useState<SortableReviewColumn>("likes_count");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortKey, setSortKey] = useState(0);
  const [reviews, setReviews] = useState(initialReviews);
  const [isPending, startTransition] = useTransition();

  async function applySort(
    newSortBy: SortableReviewColumn,
    newSortOrder: "asc" | "desc",
  ) {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    startTransition(async () => {
      const newReviews = await fetchReviews(chipId, 0, newSortBy, newSortOrder);
      setReviews(newReviews);
      setSortKey((k) => k + 1);
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Sort by</span>
          <select
            className="select select-sm select-bordered"
            value={sortBy}
            disabled={isPending}
            onChange={(e) => applySort(e.target.value as SortableReviewColumn, sortOrder)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">Order</span>
          <select
            className="select select-sm select-bordered"
            value={sortOrder}
            disabled={isPending}
            onChange={(e) => applySort(sortBy, e.target.value as "asc" | "desc")}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {isPending && <span className="loading loading-spinner loading-xs opacity-50" />}
      </div>

      <ReviewList
        key={sortKey}
        initialReviews={reviews}
        userId={userId}
        chipId={chipId}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    </>
  );
}
