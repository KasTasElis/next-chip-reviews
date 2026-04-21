import React from "react";

export default function StarRating({
  rating = 0,
  count = 0,
  size = "sm",
}: {
  rating?: number;
  count?: number;
  size?: "sm" | "md" | "lg";
}) {
  const displayRating = Math.round(rating * 2) / 2;
  const textSize = size === "sm" ? "md" : size;

  return (
    <div className="flex items-center gap-1">
      <span className={`text-${textSize}`}>{rating}</span>

      <div
        className={`rating rating-half rating-${size} relative bottom-[1px]`}
      >
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

      <span className={`text-${textSize} opacity-50`}>
        ({count})
      </span>
    </div>
  );
}
