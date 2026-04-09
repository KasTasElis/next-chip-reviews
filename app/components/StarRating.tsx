export default function StarRating({
  rating = 0,
  count,
}: {
  rating?: number;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="rating rating-sm">
        {[1, 2, 3, 4, 5].map((v) => (
          <input
            key={v}
            type="radio"
            className="mask mask-star-2 bg-orange-400"
            checked={rating === v}
            readOnly
            disabled
          />
        ))}
      </div>

      <span className="text-sm opacity-60">
        ({count === undefined ? "0" : count})
      </span>
    </div>
  );
}
