type Review = {
  id: number;
  rating: number;
  review: string;
  created_at: string;
  profiles: { username: string } | { username: string }[] | null;
};

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return <p className="text-sm opacity-50">No reviews yet. Be the first!</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((r) => (
        <div key={r.id} className="card bg-base-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {(Array.isArray(r.profiles) ? r.profiles[0]?.username : r.profiles?.username) ?? "Anonymous"}
            </span>
            <span className="text-xs opacity-50">
              {new Date(r.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="rating rating-sm mb-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <input
                key={v}
                type="radio"
                className="mask mask-star-2 bg-orange-400"
                checked={r.rating === v}
                readOnly
                disabled
              />
            ))}
          </div>
          <p className="text-sm">{r.review}</p>
        </div>
      ))}
    </div>
  );
}
