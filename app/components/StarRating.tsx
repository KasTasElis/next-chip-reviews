import React from "react";

export default function StarRating({
  rating = 0,
  count = 0,
}: {
  rating?: number;
  count?: number;
}) {
  const displayRating = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1">
      <span className="text-md">{rating}</span>

      <div className="rating rating-half rating-sm relative bottom-[1px]">
        {[1, 2, 3, 4, 5].map((v) => (
          <React.Fragment key={v}>
            <input
              type="radio"
              className="mask mask-star-2 mask-half-1 bg-orange-400"
              checked={displayRating === v - 0.5}
              readOnly
              disabled
            />
            <input
              type="radio"
              className="mask mask-star-2 mask-half-2 bg-orange-400"
              checked={displayRating === v}
              readOnly
              disabled
            />
          </React.Fragment>
        ))}
      </div>

      <span className="text-md opacity-50">({count})</span>
    </div>
  );
}
