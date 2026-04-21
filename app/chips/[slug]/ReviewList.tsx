"use client";

import ReviewCard from "./ReviewCard";
import type { ReviewWithProfile } from "./queries";

export default function ReviewList({
  reviews,
  userId,
}: {
  reviews: ReviewWithProfile[];
  userId: string | null;
}) {
  if (!reviews.length) {
    return <p className="text-sm opacity-50">No reviews yet. Be the first!</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} userId={userId} />
      ))}
    </div>
  );
}
